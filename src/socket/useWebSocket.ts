import { useState } from 'react';

const useWebSocket = () => {
  const [data, setData] = useState<string>();
  return { data };
};

export default useWebSocket;
