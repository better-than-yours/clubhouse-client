import React, { useEffect, useState } from 'react';

import { ChannelList } from './ChannelList';
import { IUser } from './interface';
import { Login } from './Login';

export function Client() {
  const [user, setUser] = useState<IUser>();
  const [loading, isLoading] = useState(true);

  useEffect(() => {
    loadUser();
    isLoading(false);
  }, [user]);

  function loadUser() {
    if (user) {
      localStorage.setItem('clubhouse', JSON.stringify(user));
    } else {
      try {
        const store = localStorage.getItem('clubhouse');
        if (store) {
          setUser(JSON.parse(store));
        }
      } catch (e) {
        console.warn(e);
      }
    }
  }

  function handleSetUser(user: IUser) {
    setUser(user);
  }

  if (loading) {
    return <>Loading...</>;
  }

  return (
    <>
      {!user && <Login onUpdateUser={handleSetUser} />}
      {user && <ChannelList user={user} />}
    </>
  );
}
