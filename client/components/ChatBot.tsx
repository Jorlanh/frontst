import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../types';
import { getChatResponse } from '../services/aiClientService';
import { Button } from './UIComponents';

const markdownComponents = {
  h1: ({ children }: any) => <h3 className="text-base font-bold mt-3 mb-1 text-purple-600 dark:text-purple-400">{children}</h3>,
  h2: ({ children }: any) => <h3 className="text-base font-bold mt-3 mb-1 text-purple-600 dark:text-purple-400">{children}</h3>,
  h3: ({ children }: any) => <h3 className="text-sm font-bold mt-3 mb-1 text-purple-600 dark:text-purple-400">{children}</h3>,
  strong: ({ children }: any) => <strong className="font-bold">{children}</strong>,
  em: ({ children }: any) => <em className="italic">{children}</em>,
  ul: ({ children }: any) => <ul className="list-disc ml-5 my-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal ml-5 my-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li>{children}</li>,
  p: ({ children }: any) => <p className="mb-2 last:mb-0">{children}</p>,
  code: ({ children }: any) => <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded text-sm font-mono">{children}</code>,
  a: ({ children, href }: any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 underline">{children}</a>,
};

interface ChatBotProps {
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'intro', role: 'model', text: 'Olá! Sou seu Tutor IA do ENEM. Posso te ajudar com dúvidas de qualquer matéria, explicar conteúdos, resolver questões ou dar dicas de redação. O que vamos estudar hoje?' }
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const responseText = await getChatResponse(messages, userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        // 🚨 INCREMENTO AQUI: Mensagem de erro aprimorada. Se a conexão cair de verdade, a IA não cospe um erro seco, mas explica o que se passou.
        text: "Parece que a sua ligação oscilou ou o servidor está sobrecarregado. Por favor, tente enviar a pergunta novamente em alguns segundos."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Toggle Button (Visible only when chat is closed or on desktop if not covering) */}
      {!isOpen && (
        <button
          onClick={() => onToggle(true)}
          className="fixed bottom-6 right-6 z-50 p-0 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 bg-purple-600 flex items-center justify-center w-16 h-16 overflow-hidden border-2 border-white dark:border-slate-800"
          aria-label="Abrir Chat Tutor ENEM"
        >
          <img src="/ai_tutor_avatar.png" alt="Tutor IA" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat Window - Fullscreen on Mobile, Large on Desktop */}
      {isOpen && (
        <div className="fixed inset-0 md:inset-auto md:bottom-24 md:right-6 md:w-[600px] md:h-[80vh] md:max-h-[850px] bg-white dark:bg-slate-900 md:rounded-2xl shadow-2xl flex flex-col z-50 border border-gray-200 dark:border-slate-800 animate-fade-in-up overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 p-4 flex justify-between items-center text-white shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => onToggle(false)} 
                className="md:hidden text-white/80 hover:text-white"
              >
                <span className="text-2xl">✕</span>
              </button>
              <div>
                <h3 className="font-bold text-lg">Tutor ENEM IA</h3>
                <p className="text-xs text-purple-100 opacity-80">Todas as matérias • Rigoroso</p>
              </div>
            </div>
            <div className="flex gap-3 items-center">
                <button 
                  onClick={() => setMessages([{ id: 'intro', role: 'model', text: 'Olá! Sou seu Tutor IA do ENEM. Como posso ajudar?' }])}
                  className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded transition-colors font-medium"
                >
                  Limpar
                </button>
                <button 
                  onClick={() => onToggle(false)} 
                  className="hidden md:block text-white/80 hover:text-white hover:bg-white/10 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >
                  <span className="text-xl font-bold">✕</span>
                </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-base leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-purple-600 text-white rounded-tr-none whitespace-pre-wrap'
                      : 'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100 border border-gray-100 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'model' && <span className="block text-xs font-bold text-purple-600 dark:text-purple-400 mb-1">Tutor IA</span>}
                  {msg.role === 'model' ? (
                    <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-slate-700 shadow-sm flex gap-1.5 items-center">
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2.5 h-2.5 bg-gray-400 dark:bg-slate-500 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 shrink-0">
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Pergunte sobre qualquer matéria..."
                className="w-full resize-none border border-gray-300 dark:border-slate-700 rounded-lg p-3 text-base focus:ring-2 focus:ring-purple-600 focus:outline-none max-h-32 custom-scrollbar bg-white dark:bg-slate-800 dark:text-white"
                rows={1}
                style={{ minHeight: '48px' }}
              />
              <Button onClick={handleSend} disabled={loading || !inputText.trim()} className="px-6 py-2 self-end !bg-purple-600 hover:!bg-purple-700 h-[48px] flex items-center justify-center">
                ➤
              </Button>
            </div>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2 text-center">
              A IA pode cometer erros. Sempre verifique informações críticas.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;