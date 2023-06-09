import { useState, useRef, useEffect, KeyboardEvent } from 'react';

// import local hooks
import useWebSocketLite from '../socket/webSocketHook';

// prettify
const sendTag = (message: string) => (
  <span>
    <span style={{ color: 'red' }}>&#11014;</span>: {message}
  </span>
);
const receiveTag = (message: string) => (
  <span>
    <span style={{ color: 'green' }}>&#11015;</span>: {message}
  </span>
);

const MessageBox = () => {
  const [messagesList, setMessagesList] = useState([
    <span>Messages will be displayed here</span>,
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  const ws = useWebSocketLite({
    socketUrl: 'wss://socketsbay.com/wss/v2/1/demo/',
  });

  useEffect(() => {
    if (ws.data) {
      const { message } = ws.data;
      setMessagesList((messagesList) => [...messagesList, receiveTag(message)]);
    }
  }, [ws.data]);

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      const message = e.currentTarget.value;
      if (message) {
        setMessagesList((messagesList) => [...messagesList, sendTag(message)]);
        ws.send(message);
      }
    }
  };

  const handleSendJson = () => {
    const jsonHere = {
      timestamp: new Date().toISOString(),
      timeZone: 'GMT +7',
    };
    ws.send(jsonHere);
    setMessagesList((messagesList) => [
      ...messagesList,
      sendTag(JSON.stringify(jsonHere)),
    ]);
  };

  return (
    <div style={{ margin: '10px' }}>
      <input
        type='text'
        ref={inputRef}
        onKeyUp={handleKeyUp}
        placeholder='Enter message'
        disabled={!ws.readyState}
      />
      <button onClick={handleSendJson} disabled={!ws.readyState}>
        Send JSON
      </button>
      <div>
        {messagesList.map((message, index) => (
          <p key={'message' + index}>{message}</p>
        ))}
      </div>
    </div>
  );
};

export default MessageBox;
