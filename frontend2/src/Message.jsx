import React, { useState } from 'react';
import useWebSocket from './hooks/useWebSocket';

export default function Chat({ username }) {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useWebSocket(username);

  const handleSend = () => {
    if (!input) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div>
      <h2>Chat</h2>
      <div style={{ border: '1px solid #ccc', height: 300, overflowY: 'scroll', padding: 10 }}>
        {messages.map((msg, idx) => (
          <div key={idx}><strong>{msg.username}:</strong> {msg.message}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type a message"
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
}