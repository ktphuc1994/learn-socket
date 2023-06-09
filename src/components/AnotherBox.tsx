import { KeyboardEvent, useEffect, useRef, useState } from 'react';

// handle json messages
const formatMessage = (data: any) => {
  try {
    const parsed = JSON.parse(data);
    if (typeof parsed === 'object') return "It's a object";
    return parsed;
  } catch (err) {
    return data;
  }
};

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

interface InterfaceAnotherBox {
  retry?: number;
  retryInterval?: number;
}

const AnotherBox = ({
  retry: defaultRetry = 3,
  retryInterval = 1500,
}: InterfaceAnotherBox) => {
  // send function
  const [send, setSend] = useState<(data?: any) => void>(() => () => undefined);
  // retry counter
  const [retry, setRetry] = useState(defaultRetry);
  // state of our connection
  const [readyState, setReadyState] = useState(false);
  // retry timeout ref
  const retryTimeoutRef = useRef<number>();

  const [messagesList, setMessagesList] = useState([
    <span>Another Box will be displayed here</span>,
  ]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const ws = new WebSocket(import.meta.env.SOCKET_URL);
    ws.onopen = () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = undefined;
        setRetry(defaultRetry);
      }
      console.log('Connected to socket');
      setReadyState(true);

      // function to send messages
      setSend(() => (data: any) => {
        try {
          const d = JSON.stringify(data);
          ws.send(d);
          return true;
        } catch (err) {
          return false;
        }
      });
    };

    // receive messages
    ws.onmessage = (event) => {
      const msg = formatMessage(event.data);
      setMessagesList((messagesList) => [...messagesList, receiveTag(msg)]);
    };

    // on close we should update connection state
    // and retry connection
    ws.onclose = (event) => {
      console.log('Socket closed', event);
      setReadyState(false);
      // retry logic
      if (retry > 0) {
        retryTimeoutRef.current = setTimeout(() => {
          setRetry((retry) => retry - 1);
        }, retryInterval);
      }
    };

    // terminate connection on unmount
    return () => {
      ws.close();
    };

    // retry dependency here triggers the connection attempt
  }, [retry]);

  const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.key === 'Enter') {
      const message = e.currentTarget.value;
      if (message) {
        setMessagesList((messagesList) => [...messagesList, sendTag(message)]);
        send(message);
      }
    }
  };

  const handleSendJson = () => {
    const jsonHere = {
      timestamp: new Date().toISOString(),
      timeZone: 'GMT +7',
    };
    send(jsonHere);
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
        disabled={!readyState}
      />
      <button onClick={handleSendJson} disabled={!readyState}>
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

export default AnotherBox;
