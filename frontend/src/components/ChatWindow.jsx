import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, Sparkles, Loader2, MessageSquare } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { chatWithMaterial, getApiErrorMessage } from '../services/api';
import { useToast } from './Toast';

const SUGGESTED_PROMPTS = [
  "What is the main subject covered in this material?",
  "Explain the key concepts step-by-step.",
  "What are the most important terms and definitions to memorize?",
  "Give me practical real-world examples from this study material.",
];

export default function ChatWindow({ material }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { addToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Welcome message when material changes
    if (material) {
      setMessages([
        {
          role: 'model',
          content: `Hello! I have loaded **${material.original_name}** (${material.file_type.toUpperCase()}). You can ask me any questions, request concept explanations, or ask for exam revision notes based on this content.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [material?.material_id]);

  const handleSend = async (questionText = null) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || loading) return;

    if (!material) {
      addToast('Please upload or select study material first.', 'error');
      return;
    }

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = { role: 'user', content: textToSend, timestamp };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      // Build API history (exclude the very first welcome if desired or include recent)
      const historyPayload = updatedMessages
        .slice(0, -1)
        .map((m) => ({ role: m.role === 'model' ? 'model' : 'user', content: m.content }));

      const res = await chatWithMaterial(material.material_id, textToSend, historyPayload);

      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: res.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error(err);
      const detail = getApiErrorMessage(err, 'Failed to get answer from Gemini.');
      addToast(detail, 'error');
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: `⚠️ **Error:** ${detail}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (material) {
      setMessages([
        {
          role: 'model',
          content: `Chat history cleared. How can I help you study **${material.original_name}**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } else {
      setMessages([]);
    }
    addToast('Chat cleared', 'info');
  };

  return (
    <div className="chat-main-card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--primary)" />
          <span style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Interactive Study Chat
          </span>
          {material && (
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              background: 'var(--bg-hover)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
              Context: {material.original_name}
            </span>
          )}
        </div>

        <button
          onClick={handleClear}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}
          title="Clear conversation"
          disabled={messages.length <= 1}
        >
          <Trash2 size={13} /> Clear Chat
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} />
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <Loader2 size={16} className="spin-icon" style={{ animation: 'spin 1s linear infinite' }} />
            <span>EduMind AI is analyzing study material and generating answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {material && (
        <div style={{
          padding: '0.6rem 1.25rem',
          background: 'var(--bg-subtle)',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Sparkles size={12} color="#8b5cf6" /> Prompts:
          </span>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              style={{
                fontSize: '0.75rem',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                padding: '3px 10px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input */}
      <div className="chat-input-row">
        <input
          type="text"
          className="chat-input"
          placeholder={material ? "Ask a question about this material (e.g. explain the diagram, summarize section 2)..." : "Upload material first to ask questions"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          disabled={!material || loading}
        />
        <button
          className="btn btn-primary"
          onClick={() => handleSend()}
          disabled={!material || !input.trim() || loading}
        >
          <Send size={16} /> Send
        </button>
      </div>
    </div>
  );
}

