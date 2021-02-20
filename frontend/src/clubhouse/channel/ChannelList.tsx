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
import AgoraRTC, { IBufferSourceAudioTrack, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng';
import keyBy from 'lodash/keyBy';
import React, { Fragment, useEffect, useState } from 'react';

import { ISelectedChannel, IUser } from '../interface';
import { IChannel } from '../interface/request';
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
  const [mic, isMic] = useState(false);
  const [raiseHand, isRaiseHand] = useState(false);
  const [micDevice, setMicDevice] = useState<IMicrophoneAudioTrack>();
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

  useEffect(() => {
    micDevice?.setVolume(mic ? 100 : 0);
  }, [mic, micDevice]);

  async function initAgora() {
    AgoraRTC.setLogLevel(3);
    setPresetAudios([
      await AgoraRTC.createBufferSourceAudioTrack({
        source: 'audio.mp3',
      }),
    ]);
  }

  async function loadChannels() {
    if (user) {
      const response = await doGetChannels({
        user_id: String(user.user_profile.user_id),
        token: user.token,
      });
      const channelsByKey = keyBy(response.Channels, 'channel');
      for (const channelId of Object.keys(selectedChannels)) {
        if (!channelsByKey[channelId]) {
          const { client } = selectedChannels[channelId];
          await client.leave();
          delete selectedChannels[channelId];
          setSelectedChannels({ ...selectedChannels });
        }
      }
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
    }
    isMic(false);
    isRaiseHand(false);
  }

  async function joinChannel(channelId: string) {
    const response = await doJoinChannel({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
    });

    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
    setSelectedChannels({
      ...selectedChannels,
      [channelId]: { channelId, client, isHandraiseEnabled: response.is_handraise_enabled },
    });
    await client.join('938de3e8055e42b281bb8c6f69c21f78', channelId, response.token, user.user_profile.user_id);
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio' && user.audioTrack) {
        user.audioTrack.play();
      }
    });
    if (micDevice) {
      await client.publish(micDevice);
    }
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

  async function handleClickMic(e: React.MouseEvent) {
    e.stopPropagation();
    isMic(!mic);
  }

  async function handleClickRaiseHand(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    await doRaiseHand({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
      raise_hands: !raiseHand,
    });
    isRaiseHand(!raiseHand);
  }

  async function handleClickPlayPreset(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    const { client } = selectedChannels[channelId];
    const presetAudio = presetAudios[0];
    await client.publish(presetAudio);
    presetAudio.play();
    presetAudio.startProcessAudioBuffer({ cycle: 1 });
  }

  async function handleClickAcceptSpeaker(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    await doAcceptSpeakerInvite({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channelId,
      target_user_id: user.user_profile.user_id,
    });
  }

  async function leaveChannel(channelId: string) {
    await selectedChannels[channelId].client.leave();
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
                      {false && user.enabled_voice_chat && (
                        <VoiceAction
                          channelId={channel.channel}
                          raiseHand={raiseHand}
                          mic={mic}
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
