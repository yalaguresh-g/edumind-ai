import React, { useState } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple formatting helper for markdown-like bold and bullet lists
  const formatContent = (content) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // Check for headings
      if (line.startsWith('### ')) {
        return <h4 key={idx} style={{ margin: '0.6rem 0 0.3rem', fontSize: '1rem', fontWeight: 700 }}>{line.replace('### ', '')}</h4>;
      }
      if (line.startsWith('## ')) {
        return <h3 key={idx} style={{ margin: '0.8rem 0 0.4rem', fontSize: '1.1rem', fontWeight: 700 }}>{line.replace('## ', '')}</h3>;
      }
      if (line.startsWith('# ')) {
        return <h2 key={idx} style={{ margin: '1rem 0 0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>{line.replace('# ', '')}</h2>;
      }

      // Check for bullet items
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const itemText = line.trim().substring(2);
        return (
          <li key={idx} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }}>
            {renderFormattedInline(itemText)}
          </li>
        );
      }

      // Numbered list items
      const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <li key={idx} value={numMatch[1]} style={{ marginLeft: '1.25rem', marginBottom: '0.25rem' }}>
            {renderFormattedInline(numMatch[2])}
          </li>
        );
      }

      if (!line.trim()) {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }

      return (
        <p key={idx} style={{ marginBottom: '0.4rem' }}>
          {renderFormattedInline(line)}
        </p>
      );
    });
  };

  const renderFormattedInline = (text) => {
    // Split bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: isUser ? '#ffffff' : '#1e1b4b' }}>{part.slice(2, -2)}</strong>;
      }
      // Inline code `code`
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} style={{
            background: isUser ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
            padding: '2px 5px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85em'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
        fontSize: '0.75rem',
        color: 'var(--text-muted)',
      }}>
        <div style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          background: isUser ? 'var(--primary)' : 'var(--accent-violet)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.65rem'
        }}>
          {isUser ? <User size={10} /> : <Bot size={10} />}
        </div>
        <span style={{ fontWeight: 600 }}>{isUser ? 'You' : 'EduMind AI Tutor'}</span>
        {message.timestamp && <span>• {message.timestamp}</span>}
      </div>

      <div className={`chat-bubble ${isUser ? 'user' : 'ai'}`} style={{ position: 'relative' }}>
        <div>{formatContent(message.content)}</div>

        {!isUser && (
          <button
            onClick={handleCopy}
            title="Copy answer"
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              padding: '4px',
              color: 'var(--text-muted)',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
          </button>
        )}
      </div>
    </div>
  );
}

