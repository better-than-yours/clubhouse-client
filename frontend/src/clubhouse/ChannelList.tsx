import React, { useState, useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { IUser } from './interface';
import { IChannel } from './interface/request';
import { doGetChannels, doJoinChannel } from './request';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import AgoraRTC from 'agora-rtc-sdk';

interface Props {
  user: IUser;
}

export function ChannelList({ user }: Props) {
  const [loading, isLoading] = useState(true);
  const [channels, setChannels] = useState<IChannel[]>();

  useEffect(() => {
    if (user && loading) {
      AgoraRTC.Logger.setLogLevel(2);
      loadChannels().then(() => isLoading(false));
    }
  }, []);

  async function loadChannels() {
    const response = await doGetChannels({
      user_id: String(user.user_profile.user_id),
      token: user.token,
    });
    setChannels(response.Channels);
  }

  function appendTo(id: string, toId: string) {
    const el = document.createElement('div');
    el.setAttribute('id', id);
    document.getElementById(toId)?.appendChild(el);
  }

  function addView(id: string) {
    if (!document.getElementById(`#${id}`)) {
      appendTo(`remote_video_panel_${id}`, 'video');
      appendTo(`remote_video_${id}`, `remote_video_panel_${id}`);
    }
  }

  function removeView(id: string) {
    if (document.getElementById(`remote_video_panel_${id}`)) {
      document.getElementById(`remote_video_panel_${id}`)?.remove();
    }
  }

  async function handleClickListItem(channel: IChannel) {
    const response = await doJoinChannel({
      user_id: String(user.user_profile.user_id),
      token: user.token,
      channel: channel.channel,
    });

    const client = AgoraRTC.createClient({ mode: 'live', codec: 'h264' });
    let streamID: any;
    let remoteStreams: any[] = [];

    client.on('error', (err) => {
      console.log(err);
    });
    client.on('peer-leave', (evt) => {
      const id = evt.uid;
      const streams = remoteStreams.filter((e) => id !== e.getId());
      const peerStream = remoteStreams.find((e) => id === e.getId());
      peerStream && peerStream.stop();
      remoteStreams = streams;
      if (id !== streamID) {
        removeView(id);
      }
      console.log('peer-leave', id);
    });
    client.on('stream-published', () => {
      console.log('stream-published');
    });
    client.on('stream-added', (evt) => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      if (id !== streamID) {
        client.subscribe(remoteStream, { video: false, audio: true }, (err: any) => {
          console.log('stream subscribe failed', err);
        });
      }
      console.log(`stream-added remote-uid: ${id}`);
    });
    client.on('stream-subscribed', (evt) => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStreams.push(remoteStream);
      addView(id);
      remoteStream.play(`remote_video_${id}`, { fit: 'cover' });
      console.log('stream-subscribed remote-uid: ', id);
    });
    client.on('stream-removed', (evt) => {
      const remoteStream = evt.stream;
      const id = remoteStream.getId();
      remoteStream.stop();
      remoteStreams = remoteStreams.filter((stream) => stream.getId() !== id);
      removeView(id);
      console.log('stream-removed remote-uid: ', id);
    });
    client.on('onTokenPrivilegeWillExpire', () => {
      console.log('onTokenPrivilegeWillExpire');
    });
    client.on('onTokenPrivilegeDidExpire', () => {
      console.log('onTokenPrivilegeDidExpire');
    });
    client.init('938de3e8055e42b281bb8c6f69c21f78', () => {
      client.join(response.token, channel.channel, user.user_profile.user_id, undefined, (uid: any) => {
        streamID = uid;
        console.log(`join channel: ${channel.channel} success, uid: ${uid}`);
      });
    });
  }

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <>
      <div id="video" />
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
    </>
  );
}
