import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ExitToAppOutlined from '@material-ui/icons/ExitToAppOutlined';
import AgoraRTC, { IAgoraRTCClient, IBufferSourceAudioTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import PubNub from 'pubnub';
import React, { Fragment, useEffect, useState } from 'react';

import { ISelectedChannel, IUser } from '../interface';
import { IChannel, IJoinChannelResponse } from '../interface/request';
import {
  doAcceptSpeakerInvite,
  doActivePing,
  doGetChannels,
  doJoinChannel,
  doLeaveChannel,
  doRaiseHand,
} from '../request';
import { VoiceAction } from './VoiceAction';

interface Props {
  user: IUser;
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  listItemAvatar: {
    minWidth: theme.spacing(3) + 5,
  },
  gutters: {
    padding: 5,
  },
  row: {
    flex: 1,
  },
}));

export function ChannelList({ user }: Props) {
  const classes = useStyles();
  const [loading, isLoading] = useState(true);
  const [micDevice, setMicDevice] = useState<IMicrophoneAudioTrack>();
  const [message, setMessage] = useState<{ action: string; channel: string }>();
  const [presetAudios, setPresetAudios] = useState<IBufferSourceAudioTrack[]>([]);
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: ISelectedChannel }>({});
  const [channels, setChannels] = useState<IChannel[]>();

  useEffect(() => {
    const id = setInterval(() => loadChannels(), 20e3);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => activePing(), 20e3);
    return () => clearInterval(id);
  }, [selectedChannels]);

  useEffect(() => {
    if (loading) {
      initAgora();
      loadChannels().then(() => isLoading(false));
    }
  }, [loading]);

  useEffect(() => {
    resetChatState();
    controlMicAudio();
  }, [user.enabled_voice_chat, micDevice]);

  useEffect(() => {
    if (message && selectedChannels) {
      const { action, channel } = message;
      switch (action) {
        case 'invite_speaker':
        case 'uninvite_speaker':
          if (selectedChannels[channel]) {
            setSelectedChannels({
              ...selectedChannels,
              [channel]: {
                ...selectedChannels[channel],
                hasInvite: action === 'invite_speaker',
                isAcceptInvite: false,
                isRaiseHand: false,
              },
            });
          }
          break;
        case 'remove_from_channel':
        case 'end_channel':
          leaveChannel(channel);
          break;
      }
    }
  }, [message]);

  async function controlMicAudio() {
    micDevice?.setEnabled(user.enabled_voice_chat);
    if (user.enabled_voice_chat) {
      if (!micDevice) {
        setMicDevice(await AgoraRTC.createMicrophoneAudioTrack());
      }
    } else {
      if (micDevice) {
        micDevice.stop();
        micDevice.close();
        setMicDevice(undefined);
      }
    }
  }

  async function initAgora() {
    AgoraRTC.setLogLevel(3);
    setPresetAudios([
      await AgoraRTC.createBufferSourceAudioTrack({
        source: 'audio.mp3',
      }),
      await AgoraRTC.createBufferSourceAudioTrack({
        source: 'audio1.mp3',
      }),
    ]);
  }

  async function loadChannels() {
    if (user) {
      const response = await doGetChannels({
        user_id: String(user.user_profile.user_id),
        token: user.token,
      });
      setChannels(response.Channels.sort((a, b) => b.num_all - a.num_all));
    }
  }

  async function activePing() {
    for (const channelId of Object.keys(selectedChannels)) {
      doActivePing({
        user_id: String(user.user_profile.user_id),
        token: user.token,
        channel: channelId,
      });
    }
  }

  async function resetChatState() {
    for (const channelId of Object.keys(selectedChannels)) {
      await leaveChannel(channelId);
      selectedChannels[channelId] = {
        ...selectedChannels[channelId],
        isRaiseHand: false,
        isMicActive: false,
        hasInvite: false,
        isAcceptInvite: false,
      };
    }
    setSelectedChannels({ ...selectedChannels });
  }

  async function subscribeAgora(
    agora: IAgoraRTCClient,
    channelId: string,
    userId: number,
    response: IJoinChannelResponse,
  ) {
    await agora.join('938de3e8055e42b281bb8c6f69c21f78', channelId, response.token, userId);
    agora.on('user-published', async (user, mediaType) => {
      await agora.subscribe(user, mediaType);
      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }
    });
    if (micDevice) {
      await agora.publish(micDevice);
    }
  }

  function subscribePubnub(pubnub: PubNub, channelId: string, userId: number) {
    pubnub.addListener({
      message: (data: any) => setMessage(data.message),
    });
    pubnub.subscribe({
      channels: [`users.${userId}`, `channel_user.${channelId}.${userId}`, `channel_all.${channelId}`],
    });
  }

  async function joinChannel(channelId: string) {
    const userId = user.user_profile.user_id;
    const response = await doJoinChannel({
      user_id: String(userId),
      token: user.token,
      channel: channelId,
    });
    const agora = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    subscribeAgora(agora, channelId, userId, response);
    const pubnub = new PubNub({
      publishKey: 'pub-c-6878d382-5ae6-4494-9099-f930f938868b',
      subscribeKey: 'sub-c-a4abea84-9ca3-11ea-8e71-f2b83ac9263d',
      uuid: String(userId),
      origin: 'clubhouse.pubnub.com',
      presenceTimeout: response.pubnub_heartbeat_interval,
      heartbeatInterval: response.pubnub_heartbeat_interval,
      authKey: response.pubnub_token,
    });
    subscribePubnub(pubnub, channelId, userId);
    setSelectedChannels({
      ...selectedChannels,
      [channelId]: {
        channelId,
        agora,
        pubnub: undefined,
        isHandraiseEnabled: response.is_handraise_enabled,
        isMicActive: false,
        isRaiseHand: false,
        hasInvite: false,
        isAcceptInvite: false,
      },
    });
  }

  async function handleClickListItem(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    await joinChannel(channelId);
  }

  function handleClickLeave(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    if (selectedChannels[channelId]) {
      leaveChannel(channelId);
    }
  }

  async function handleClickMic(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    const { isMicActive } = selectedChannels[channelId];
    micDevice?.setVolume(!isMicActive ? 100 : 0);
    setSelectedChannels({
      ...selectedChannels,
      [channelId]: {
        ...selectedChannels[channelId],
        isMicActive: !isMicActive,
      },
    });
  }

  async function handleClickRaiseHand(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    const { isRaiseHand } = selectedChannels[channelId];
    await doRaiseHand({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
      raise_hands: !isRaiseHand,
    });
    setSelectedChannels({
      ...selectedChannels,
      [channelId]: {
        ...selectedChannels[channelId],
        isRaiseHand: !isRaiseHand,
      },
    });
  }

  async function handleClickPlayPreset(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    const { agora } = selectedChannels[channelId];
    const presetAudio = presetAudios[0];
    await agora?.publish(presetAudio);
    presetAudio.play();
    presetAudio.startProcessAudioBuffer({ cycle: 1 });
  }

  async function handleClickAcceptSpeaker(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    const response = await doAcceptSpeakerInvite({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
      target_user_id: user.user_profile.user_id,
    });
    if (response.success) {
      setSelectedChannels({
        ...selectedChannels,
        [channelId]: {
          ...selectedChannels[channelId],
          isAcceptInvite: true,
        },
      });
    }
  }

  async function leaveChannel(channelId: string) {
    const { agora, pubnub } = selectedChannels[channelId];
    await agora?.leave();
    if (pubnub) {
      await pubnub.unsubscribeAll();
      await pubnub.stop();
    }
    await doLeaveChannel({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
    });
    delete selectedChannels[channelId];
    setSelectedChannels({ ...selectedChannels });
  }

  if (loading) {
    return (
      <Grid container alignItems="center" justify="center" style={{ minHeight: '100vh' }}>
        Loading...
      </Grid>
    );
  }

  return (
    <Grid item>
      {channels && (
        <List dense={true}>
          {channels.map((channel) => (
            <Fragment key={`channel-${channel.channel}`}>
              <ListItem
                selected={Boolean(selectedChannels[channel.channel])}
                onClick={(e) => handleClickListItem(e, channel.channel)}
                button
                className={classes.gutters}
              >
                <Grid container direction="row">
                  <Grid item className={classes.row}>
                    {channel.topic && (
                      <Grid container spacing={1} direction="row" alignItems="center">
                        <Grid item>
                          <Typography variant="body1">{channel.topic}</Typography>
                        </Grid>
                        <Grid item>
                          <Typography variant="caption">{channel.num_all}</Typography>
                        </Grid>
                      </Grid>
                    )}
                    <Grid container spacing={1} alignItems="center">
                      {channel.users.map((user) => (
                        <Grid item key={`channel-speaker-${user.user_id}`}>
                          <Grid container direction="row">
                            <ListItemAvatar className={classes.listItemAvatar}>
                              <Avatar alt={user.name} src={user.photo_url} className={classes.avatar} />
                            </ListItemAvatar>
                            <Typography variant="body2">{user.name}</Typography>
                          </Grid>
                        </Grid>
                      ))}
                      {!channel.topic && <Typography variant="caption">{channel.num_all}</Typography>}
                    </Grid>
                  </Grid>
                  {Boolean(selectedChannels[channel.channel]) && (
                    <Grid item>
                      {user.enabled_voice_chat && (
                        <VoiceAction
                          channelId={channel.channel}
                          selectedChannels={selectedChannels}
                          onClickRaiseHand={handleClickRaiseHand}
                          onClickPlayPreset={handleClickPlayPreset}
                          onClickAcceptSpeaker={handleClickAcceptSpeaker}
                          onClickMic={handleClickMic}
                        />
                      )}
                      <IconButton color="inherit" onClick={(e) => handleClickLeave(e, channel.channel)}>
                        <ExitToAppOutlined fontSize="inherit" />
                      </IconButton>
                    </Grid>
                  )}
                </Grid>
              </ListItem>
              <Divider component="li" />
            </Fragment>
          ))}
        </List>
      )}
    </Grid>
  );
}
