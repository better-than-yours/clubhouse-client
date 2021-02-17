import Avatar from '@material-ui/core/Avatar';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import makeStyles from '@material-ui/core/styles/makeStyles';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import React, { Fragment, useEffect, useState } from 'react';

import { IUser } from './interface';
import { IChannel } from './interface/request';
import { doGetChannels, doJoinChannel, doLeaveChannel } from './request';

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
}));

export function ChannelList({ user }: Props) {
  const classes = useStyles();
  const [loading, isLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<SelectedChannel>();
  const [channels, setChannels] = useState<IChannel[]>();

  useEffect(() => {
    if (user && loading) {
      AgoraRTC.setLogLevel(3);
      loadChannels().then(() => isLoading(false));
    }
  }, []);

  async function loadChannels() {
    const response = await doGetChannels({
      user_id: String(user.user_profile.user_id),
      token: user.token,
    });
    setChannels(response.Channels.sort((a, b) => b.num_all - a.num_all));
  }

  async function handleClickListItem(channel: IChannel) {
    leaveChannel();
    const response = await doJoinChannel({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channel.channel,
    });

    const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
    setSelectedChannel({ channelId: channel.channel_id, channel: channel.channel, client });
    await client.join('938de3e8055e42b281bb8c6f69c21f78', channel.channel, response.token, user.user_profile.user_id);

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType === 'audio') {
        const remoteAudioTrack = user.audioTrack;
        remoteAudioTrack?.play();
      }
    });
  }

  function handleClickLeave(e: React.MouseEvent) {
    e.stopPropagation();
    leaveChannel();
  }

  async function leaveChannel() {
    if (selectedChannel) {
      const { client, channel } = selectedChannel;
      await client.leave();
      await doLeaveChannel({
        user_id: String(user.user_profile.user_id),
        token: user.token,
        channel,
      });
      setSelectedChannel(undefined);
    }
  }

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <Grid item>
      {channels && (
        <List dense={true}>
          {channels.map((channel) => (
            <Fragment key={`channel-${channel.channel_id}`}>
              <ListItem
                selected={selectedChannel?.channelId === channel.channel_id}
                onClick={() => handleClickListItem(channel)}
                button
              >
                <Grid container direction="row">
                  <Grid item xs={11}>
                    <ListItemText primary={`${channel.topic} ${channel.num_all}`} />
                    <Grid container spacing={1}>
                      {channel.users
                        .filter((user) => user.is_speaker || user.is_moderator)
                        .map((user) => (
                          <Grid item key={`channel-speaker-${user.user_id}`}>
                            <Grid container direction="row">
                              <ListItemAvatar className={classes.listItemAvatar}>
                                <Avatar alt={user.name} src={user.photo_url} className={classes.avatar} />
                              </ListItemAvatar>
                              <ListItemText>{user.name}</ListItemText>
                            </Grid>
                          </Grid>
                        ))}
                    </Grid>
                  </Grid>
                  <Grid item xs={1}>
                    {selectedChannel?.channelId === channel.channel_id && (
                      <IconButton onClick={handleClickLeave}>
                        <ExitToAppIcon fontSize="inherit" />
                      </IconButton>
                    )}
                  </Grid>
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
