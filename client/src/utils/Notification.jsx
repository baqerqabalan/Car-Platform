import React, { useState, useEffect } from 'react';

const Notification = ({ message }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return visible && message ? (
    <div className="notification">
      {message}
    </div>
  ) : null;
};

export default Notification;