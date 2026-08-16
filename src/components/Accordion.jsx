import React, { useRef, useState } from 'react';

export default function Accordion({ title, children }) {
  const [open, setOpen] = useState(false);
  const bodyRef = useRef(null);

  return (
    <div className={`acc ${open ? 'open' : ''}`}>
      <div className="acc-head" onClick={() => setOpen((o) => !o)}>
        <span>{title}</span>
        <span className="pm">+</span>
      </div>
      <div
        className="acc-body"
        ref={bodyRef}
        style={{ maxHeight: open ? bodyRef.current?.scrollHeight : 0 }}
      >
        <div className="acc-body-inner">{children}</div>
      </div>
    </div>
  );
}
