import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, Bot, User as UserIcon } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';

const SUGGESTED = [
  'Who is Riya?',
  'Where did I go yesterday?',
  'What do I have today?',
  'Tell me about my family.'
];

const WELCOME = {
  role: 'assistant',
  text: "Hello! I'm your Memory Companion. Everything I say comes from your saved memories and routines. How can I help you today?"
};

export default function Companion() {
  const { session } = useApp();
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  const send = async text => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', text: msg }]);
    setBusy(true);
    try {
      const res = await api.post('/api/assistant', { message: msg });
      setMessages(m => [...m, { role: 'assistant', text: res.reply, sources: res.sources }]);
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', text: `Sorry, I had trouble answering: ${err.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  const firstName = (session?.user?.name || 'User').split(' ')[0];

  return (
    <div className="mx-auto flex h-[calc(100vh-9rem)] max-w-4xl flex-col lg:h-[calc(100vh-7rem)]">
      <header className="mb-6 bg-white p-6 rounded-sm border border-slate-200 shadow-sm flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-sm bg-blue-50 text-nyala-primary">
          <Bot size={32} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-3xl font-display break-words font-bold text-slate-900">
            Memory Companion
          </h1>
          <p className="mt-1 text-lg text-slate-600">Hello {firstName}, ask me anything about your saved memories, people, and plans.</p>
        </div>
      </header>

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-6 overflow-y-auto p-4 mb-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              m.role === 'user' ? 'bg-nyala-primary text-white' : 'bg-blue-50 text-nyala-primary'
            }`} aria-hidden="true">
              {m.role === 'user' ? <UserIcon size={24} /> : <Bot size={24} />}
            </span>
            <div className={`max-w-[85%] rounded-sm px-6 py-4 text-xl leading-relaxed whitespace-pre-line shadow-sm border ${
              m.role === 'user' ? 'bg-nyala-primary text-white border-nyala-primary' : 'bg-white text-slate-800 border-slate-200'
            }`}>
              {m.text}
              {m.sources?.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/30">
                  <p className={`text-sm font-bold uppercase tracking-wider ${m.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>
                    Found in: {m.sources.map(s => s.type).filter((v, idx, a) => a.indexOf(v) === idx).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-nyala-primary"><Bot size={24} /></span>
            <div className="flex items-center gap-2 rounded-sm bg-white border border-slate-200 shadow-sm px-6 py-5">
              <span className="h-3 w-3 animate-bounce rounded-full bg-nyala-primary [animation-delay:0ms]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-nyala-primary [animation-delay:150ms]" />
              <span className="h-3 w-3 animate-bounce rounded-full bg-nyala-primary [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm">
        {/* Suggested questions */}
        <div className="mb-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {SUGGESTED.map(s => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={busy}
              className="shrink-0 rounded-sm border-2 border-slate-200 bg-white px-5 py-2 text-lg font-bold text-slate-600 hover:border-nyala-primary hover:text-nyala-primary disabled:opacity-50 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          className="flex gap-3"
          onSubmit={e => { e.preventDefault(); send(); }}
        >
          <input
            className="w-full border-2 border-slate-200 bg-slate-50 px-5 py-4 text-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-nyala-primary focus:bg-white transition-colors rounded-sm"
            placeholder="Ask a question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            aria-label="Message Memory Companion"
          />
          <button type="submit" className="btn-primary px-8 py-4 text-xl" disabled={busy || !input.trim()}>
            <Send size={24} className="mr-2" /> <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
