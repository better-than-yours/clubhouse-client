import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import MicOffOutlinedIcon from '@material-ui/icons/MicOffOutlined';
import MicOutlinedIcon from '@material-ui/icons/MicOutlined';
import PanToolIcon from '@material-ui/icons/PanTool';
import PanToolOutlinedIcon from '@material-ui/icons/PanToolOutlined';
import PlayArrowOutlinedIcon from '@material-ui/icons/PlayArrowOutlined';
import React from 'react';

import { ISelectedChannel } from '../interface';

interface Props {
  channelId: string;
  selectedChannels: { [key: string]: ISelectedChannel };
  onClickRaiseHand: (e: React.MouseEvent, channelId: string) => void;
  onClickPlayPreset: (e: React.MouseEvent, channelId: string) => void;
  onClickAcceptSpeaker: (e: React.MouseEvent, channelId: string) => void;
  onClickMic: (e: React.MouseEvent, channelId: string) => void;
}

export function VoiceAction({
  channelId,
  selectedChannels,
  onClickRaiseHand,
  onClickPlayPreset,
  onClickAcceptSpeaker,
  onClickMic,
}: Props) {
  const { isRaiseHand, isMicActive, isAcceptInvite, isHandraiseEnabled, hasInvite } = selectedChannels[channelId];
  return (
    <>
      <IconButton color="inherit" onClick={(e) => onClickPlayPreset(e, channelId)}>
        <PlayArrowOutlinedIcon fontSize="inherit" />
      </IconButton>
      {!hasInvite && (
        <IconButton disabled={!isHandraiseEnabled} color="inherit" onClick={(e) => onClickRaiseHand(e, channelId)}>
          {isRaiseHand && <PanToolIcon fontSize="inherit" />}
          {!isRaiseHand && <PanToolOutlinedIcon fontSize="inherit" />}
        </IconButton>
      )}
      {hasInvite && !isAcceptInvite && (
        <IconButton color="inherit" onClick={(e) => onClickAcceptSpeaker(e, channelId)}>
          <CheckIcon fontSize="inherit" />
        </IconButton>
      )}
      <IconButton disabled={!isAcceptInvite} color="inherit" onClick={(e) => onClickMic(e, channelId)}>
        {isMicActive && <MicOutlinedIcon fontSize="inherit" />}
        {!isMicActive && <MicOffOutlinedIcon fontSize="inherit" />}
      </IconButton>
    </>
  );
}
