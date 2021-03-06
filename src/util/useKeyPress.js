// Credit to https://usehooks.com/useKeyPress/

import { useEffect, useState } from 'react';

function useKeyPress(targetKey) {
  const [keyPressed, setKeyPressed] = useState(false);

  function downHandler(e) {
    if (e.key === targetKey) {
      e.preventDefault();
      setKeyPressed(true);
    }
  }

  const upHandler = e => {
    if (e.key === targetKey) {
      e.preventDefault();
      setKeyPressed(false);
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);

    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, []);

  return keyPressed;
}

export default useKeyPress;
