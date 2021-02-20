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
  raiseHand: boolean;
  mic: boolean;
  selectedChannels: { [key: string]: ISelectedChannel };
  onClickRaiseHand: (e: React.MouseEvent, channelId: string) => void;
  onClickPlayPreset: (e: React.MouseEvent, channelId: string) => void;
  onClickAcceptSpeaker: (e: React.MouseEvent, channelId: string) => void;
  onClickMic: (e: React.MouseEvent) => void;
}

export function VoiceAction({
  channelId,
  raiseHand,
  mic,
  selectedChannels,
  onClickRaiseHand,
  onClickPlayPreset,
  onClickAcceptSpeaker,
  onClickMic,
}: Props) {
  return (
    <>
      <IconButton
        disabled={!selectedChannels[channelId].isHandraiseEnabled}
        color="inherit"
        onClick={(e) => onClickRaiseHand(e, channelId)}
      >
        {raiseHand && <PanToolIcon fontSize="inherit" />}
        {!raiseHand && <PanToolOutlinedIcon fontSize="inherit" />}
      </IconButton>
      <IconButton color="inherit" onClick={(e) => onClickPlayPreset(e, channelId)}>
        <PlayArrowOutlinedIcon fontSize="inherit" />
      </IconButton>
      <IconButton color="inherit" onClick={(e) => onClickAcceptSpeaker(e, channelId)}>
        <CheckIcon fontSize="inherit" />
      </IconButton>
      <IconButton color="inherit" onClick={(e) => onClickMic(e)}>
        {mic && <MicOutlinedIcon fontSize="inherit" />}
        {!mic && <MicOffOutlinedIcon fontSize="inherit" />}
      </IconButton>
    </>
  );
}
