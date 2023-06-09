import './App.css';
import { useState } from 'react';

// import local components
import MessageBox from './components/MessageBox';
import AnotherBox from './components/AnotherBox';

function App() {
  const [isBoxOpen, setBoxOpen] = useState(true);

  const handleToggleBox = () => {
    setBoxOpen(!isBoxOpen);
  };
  return (
    <div>
      <button onClick={handleToggleBox}>Toogle</button>
      <div style={{ display: 'flex' }}>
        {isBoxOpen ? <AnotherBox /> : null}
        <MessageBox />
      </div>
    </div>
  );
}

export default App;
