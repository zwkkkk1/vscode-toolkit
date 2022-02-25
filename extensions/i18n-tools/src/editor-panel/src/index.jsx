import React, { useEffect, useCallback, useState } from 'react';
import ReactDOM from 'react-dom';
import MessageView from './message-view/index';

import './index.scss';

const vscode = acquireVsCodeApi();

function App() {
  const [store, setStore] = useState(vscode.getState() || {});
  const { type, data } = store;

  useEffect(() => {
    if (Object.keys(store).length) {
      vscode.setState(store);
    }
  }, [store]);

  const handlePostMessage = useCallback((event) => {
    const { data } = event;
    console.log('post message >>> ', data);
    setStore(data);
  }, []);

  useEffect(() => {
    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, []);

  console.log('render >>> ', store);

  return type === 'message' ? (
    <MessageView data={data} />
  ): null;
}

ReactDOM.render(<App />, document.getElementById('root'));

vscode.postMessage({ type: 'ready' });
