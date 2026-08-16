import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastStack() {
  const { toasts } = useApp();

  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div className="toast show" key={t.id}>
          <svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6" /></svg>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
