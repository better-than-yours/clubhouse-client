import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { IUser } from './interface';
import { IChannel } from './interface/request';
import { doGetChannels, doRefreshToken, doJoinChannel } from './request';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import agoraRtcSdk from 'agora-rtc-sdk';

interface Params {
  user: IUser;
  onUpdateUser: (user: IUser) => void;
}

export function ChannelList({ user, onUpdateUser }: Params) {
  const [loading, isLoading] = useState(true);
  const [channels, setChannels] = useState<IChannel[]>();

  useEffect(() => {
    if (user) {
      loadChannels().then(() => isLoading(false));
    }
  }, []);

  async function loadChannels() {
    try {
      const response = await doGetChannels({
        user_id: String(user.user_profile.user_id),
        authorization: user.access_token,
      });
      setChannels(response.Channels);
    } catch {
      const response = await doRefreshToken({ refresh: user.refresh_token });
      onUpdateUser({ ...user, access_token: response.access, refresh_token: response.refresh });
    }
  }

  async function handleClickListItem(channel: IChannel) {
    const response = await doJoinChannel({
      user_id: String(user.user_profile.user_id),
      authorization: user.access_token,
      channel: channel.channel,
    });
    const client = agoraRtcSdk.createClient({ mode: 'live', codec: 'h264' });
    client.init('938de3e8055e42b281bb8c6f69c21f78', () => {
      client.join(
        response.token,
        channel.channel,
        user.user_profile.user_id,
        undefined,
        (streamID) => {
          const stream = agoraRtcSdk.createStream({
            streamID,
            audio: true,
            video: false,
            screen: false,
          });
          stream.init(() => {
            console.log('init local stream success');
            stream.play('local_stream', { fit: 'cover' });
          });
        },
        console.error,
      );
    });
    // console.log('938de3e8055e42b281bb8c6f69c21f78', channel.channel, response.token, user.user_profile.user_id);
  }

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <Grid item>
      {channels && (
        <List>
          {channels.map((channel) => (
            <ListItem key={`channel-${channel.channel_id}`} onClick={() => handleClickListItem(channel)}>
              <ListItemText
                primary={`${channel.topic} ${channel.num_all}`}
                secondary={channel.users.map((user) => user.name).join(', ')}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Grid>
  );
}
