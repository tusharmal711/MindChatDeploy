import { useEffect } from 'react';
import { getFCMToken } from './firebase-config';

const NotificationPermission = ({ mobile }) => {
  useEffect(() => {
    const saveToken = async () => {
      const token = await getFCMToken();
      if (token) {
        await fetch('http://localhost:3001/save-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile, token }),
        });
      }
    };

    saveToken();
  }, [mobile]);

  return null;
};

export default NotificationPermission;
