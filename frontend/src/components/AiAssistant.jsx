import { useState, useRef, useEffect } from 'react';
import { getHeaders } from '../services/api';

const IconBot = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const IconSend = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconUser = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;

const AiAssistant = ({ userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I am your AI Assistant for TransitOps. I have analyzed your ${userRole} data context. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to get AI response');

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `*Error:* ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button if closed */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 1000,
            transition: 'transform 0.2s'
          }}
        >
          <IconBot />
        </button>
      )}

      {/* Chat Window Panel */}
      <div style={{
        width: isOpen ? '380px' : '0px',
        height: '100vh',
        backgroundColor: 'var(--surface)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'width 0.3s',
        borderLeft: isOpen ? '1px solid var(--border)' : 'none',
        flexShrink: 0
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          backgroundColor: 'var(--surface-hover)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ backgroundColor: 'var(--primary)', padding: '6px', borderRadius: '8px', color: 'white' }}>
              <IconBot />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>TransitOps AI</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Mistral 7B • {userRole}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <IconX />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              gap: '12px',
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              maxWidth: '85%'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '16px',
                backgroundColor: msg.role === 'user' ? 'var(--surface-hover)' : 'var(--primary)',
                color: msg.role === 'user' ? 'var(--text-primary)' : 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                {msg.role === 'user' ? <IconUser /> : <IconBot />}
              </div>
              <div style={{
                backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--surface-hover)',
                color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                padding: '12px 16px',
                borderRadius: '16px',
                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap'
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '85%' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '16px', backgroundColor: 'var(--primary)', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <IconBot />
              </div>
              <div style={{
                backgroundColor: 'var(--surface-hover)', color: 'var(--text-primary)', padding: '12px 16px',
                borderRadius: '16px', borderTopLeftRadius: '4px', fontSize: '0.9rem', display: 'flex', gap: '4px'
              }}>
                <span className="dot-typing">...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} style={{
          padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', backgroundColor: 'var(--surface)'
        }}>
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your operations..."
            disabled={isLoading}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: '24px', border: '1px solid var(--border)',
              backgroundColor: 'var(--background)', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            style={{
              width: '44px', height: '44px', borderRadius: '22px', backgroundColor: input.trim() && !isLoading ? 'var(--primary)' : 'var(--surface-hover)',
              color: input.trim() && !isLoading ? 'white' : 'var(--text-secondary)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed', transition: 'background-color 0.2s'
            }}
          >
            <IconSend />
          </button>
        </form>
      </div>
    </>
  );
};

export default AiAssistant;
