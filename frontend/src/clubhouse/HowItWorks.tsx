import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Link from '@material-ui/core/Link';
import React from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export function HowItWorks({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>How it works?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Hello,
          <br />
          <br />
          Why? First of all. The Clubhouse is a great app. Unfortunately, the web app doesn't exist yet. I have
          reimplemented ios app functionality where you can log in and listen to a channel. For me, this is 95% of all
          functionality which I use daily. Why not just use the ios app? Because the ios app very quickly discharges my
          airpods, even when I don't speak on a channel. And I want to be in several channels at the same time. In the
          future, the functionality may increase if the Clubhouse doesn't close the opportunity to use their
          functionality. I have a lot of ideas. Be in touch.
          <br />
          <br />
          Email: <Link href="mailto:chapp.link@protonmail.com">chapp.link@protonmail.com</Link>
          <br />
          <br />
          Sincerely yours, Chapp Developer
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
}
