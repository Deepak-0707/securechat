import React, { useState } from 'react';
import { FiSend, FiPaperclip, FiSmile } from 'react-icons/fi';

export function MessageInput({ onSendMessage, onTyping, disabled = false }) {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleChange = (e) => {
    setInput(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
      setIsTyping(false);
      onTyping?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <div style={styles.inputContainer}>
        <button type="button" style={styles.iconButton} title="Attach file">
          <FiPaperclip size={20} />
        </button>

        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Type a message..."
          disabled={disabled}
          style={styles.input}
        />

        <button type="button" style={styles.iconButton} title="Emoji">
          <FiSmile size={20} />
        </button>

        <button
          type="submit"
          disabled={!input.trim() || disabled}
          style={{
            ...styles.sendButton,
            opacity: !input.trim() || disabled ? 0.5 : 1
          }}
        >
          <FiSend size={20} />
        </button>
      </div>
    </form>
  );
}

const styles = {
  form: {
    padding: '16px 20px',
    borderTop: '1px solid var(--border-color)',
    background: 'var(--surface)'
  },
  inputContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--surface-dark)',
    borderRadius: '24px',
    padding: '8px 12px'
  },
  input: {
    flex: 1,
    padding: '8px 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    background: 'transparent'
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px'
  },
  sendButton: {
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }
};