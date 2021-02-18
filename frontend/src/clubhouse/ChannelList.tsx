import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import React, { Fragment, useEffect, useState } from 'react';

import { IUser } from './interface';
import { IChannel } from './interface/request';
import { doActivePing, doGetChannels, doJoinChannel, doLeaveChannel } from './request';

interface Props {
  user: IUser;
}

interface SelectedChannel {
  channelId: number;
  channel: string;
  client: IAgoraRTCClient;
}

const useStyles = makeStyles((theme) => ({
  avatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },
  listItemAvatar: {
    minWidth: theme.spacing(3) + 5,
  },
  leave: {
    width: '48px',
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
  const [selectedChannels, setSelectedChannels] = useState<{ [key: string]: SelectedChannel }>({});
  const [channels, setChannels] = useState<IChannel[]>();

  useEffect(() => {
    const id = setInterval(() => {
      loadChannels();
      activePing();
    }, 20e3);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (loading) {
      AgoraRTC.setLogLevel(3);
      loadChannels().then(() => isLoading(false));
    }
  }, [loading]);

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
    for (const channel of Object.keys(selectedChannels)) {
      doActivePing({
        user_id: String(user.user_profile.user_id),
        token: user.token,
        channel,
      });
    }
  }

  async function handleClickListItem(channel: IChannel) {
    const response = await doJoinChannel({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channel.channel,
    });

    const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
    setSelectedChannels({
      ...selectedChannels,
      [channel.channel]: { channelId: channel.channel_id, channel: channel.channel, client },
    });
    await client.join('938de3e8055e42b281bb8c6f69c21f78', channel.channel, response.token, user.user_profile.user_id);
    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }
    });
  }

  function handleClickLeave(e: React.MouseEvent, channelId: string) {
    e.stopPropagation();
    leaveChannel(channelId);
    if (selectedChannels[channelId]) {
      delete selectedChannels[channelId];
    }
    setSelectedChannels({ ...selectedChannels });
  }

  async function leaveChannel(channelId: string) {
    if (selectedChannels) {
      const { client, channel } = selectedChannels[channelId];
      await client.leave();
      await doLeaveChannel({
        user_id: String(user.user_profile.user_id),
        token: user.token,
        channel,
      });
    }
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
            <Fragment key={`channel-${channel.channel_id}`}>
              <ListItem
                selected={Boolean(selectedChannels[channel.channel])}
                onClick={() => handleClickListItem(channel)}
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
                      {channel.users
                        .filter((user) => user.is_speaker || user.is_moderator)
                        .map((user) => (
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
                    <Grid item className={classes.leave}>
                      <IconButton color="secondary" onClick={(e) => handleClickLeave(e, channel.channel)}>
                        <ExitToAppIcon fontSize="inherit" />
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
