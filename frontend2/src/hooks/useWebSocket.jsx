import { useEffect, useRef, useState } from 'react';

export default function useWebSocket(username) {
  const ws = useRef(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // if (!username) return;

    ws.current = new WebSocket('ws://localhost:5000');

    ws.current.onopen = () => console.log('Connected to WebSocket server');

    ws.current.onmessage = (event) => {
      try {
        const msgObj = JSON.parse(event.data); // parse JSON
        setMessages(prev => [...prev, msgObj]);
      } catch (err) {
        console.error('Invalid message from server', err);
      }
    };

    return () => ws.current.close();
  }, [username]);

  const sendMessage = (message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ username, message }));
    }
  };

  return { messages, sendMessage };
}