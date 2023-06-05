// webSocketHook.js
import { useState, useEffect } from 'react';

interface InterfaceWebSocketHook {
  socketUrl: string;
  retry?: number;
  retryInterval?: number;
}

// define a custom hook
// accept the url to connect to
// number of times the hook should retry a connection
// the interval between retries
function useWebSocketLite({
  socketUrl,
  retry: defaultRetry = 3,
  retryInterval = 1500,
}: InterfaceWebSocketHook) {
  // message and timestamp
  const [data, setData] = useState<{ message: any; timestamp: number }>();
  // send function
  const [send, setSend] = useState<(data?: any) => void>(() => () => undefined);
  // retry counter
  const [retry, setRetry] = useState(defaultRetry);
  // state of our connection
  const [readyState, setReadyState] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(socketUrl);
    ws.onopen = () => {
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

      // receive messages
      ws.onmessage = (event) => {
        const msg = formatMessage(event.data);
        setData({ message: msg, timestamp: getTimestamp() });
      };
    };

    // on close we should update connection state
    // and retry connection
    ws.onclose = () => {
      setReadyState(false);
      // retry logic
      if (retry > 0) {
        setTimeout(() => {
          console.log('retry message connection');
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

  console.log({ retry });

  return { send, data, readyState };
}

// small utilities that we need
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

// get epoch timestamp
const getTimestamp = () => {
  return new Date().getTime();
};

export default useWebSocketLite;
