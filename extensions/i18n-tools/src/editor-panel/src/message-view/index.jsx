import React, { useState, useEffect } from 'react';

import './index.scss';

function MessageView(props) {
  const { data: { key, records, remoteRecords, warnings } } = props;
  const [localRecords, setLocaleRecords] = useState(records);
  const inputRef = React.createRef();

  useEffect(() => {
    if (records) {
      setLocaleRecords(records);
    }
  }, [records]);

  const handleInputChange = (localKey) => (e) => {
    setLocaleRecords((prev) => {
      return { ...prev, [localKey]: e.target.value };
    });

    inputRef.current.style.height = `${inputRef.current.scrollHeight - 3}px`;
  };

  return (
    <div>
      <div className="message-header">
        <h2 className="message-key">{key}</h2>
        <div className="button default-bg-2">保存</div>
      </div>
      <div className="section-title">本地文案</div>
      {Object.entries(localRecords).map(([localKey, value]) => {
        return (
          <div className="message-item default-bg-1">
            <div className="message-locale">{localKey}</div>
            <textarea ref={inputRef} rows={1} className="message-input" value={value} onChange={handleInputChange(localKey)} />
            <div className="button-group">        
              <div className="button default-bg-2">
                <i class="fas fa-globe-asia"></i>翻译
              </div>
            </div>
          </div>
        );
      })}
      {remoteRecords && (
        <>
          <div className="section-title">远程文案</div>
          {Object.entries(remoteRecords).map(([localKey, value]) => {
            return (
              <div className="message-item default-bg-1">
                <div className="message-locale">{localKey}</div>
                <div className="message-input">{value}</div>
              </div>
            );
          })}
        </>
      )}
      {Object.entries(warnings).map(() => {

      })}
    </div>
  );
}

export default MessageView;