'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  X, 
  MessageSquare, 
  Terminal, 
  Activity, 
  CheckCircle2, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I am your **DebugBit AI Copilot**. I have indexed your current active telemetry session logs and performance metrics. How can I help you debug your stack or generate code auto-fixes today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const userText = textToSend || input;
    if (!userText.trim() || isLoading) return;

    // Append user message
    const updatedMessages = [...messages, { role: 'user', content: userText } as ChatMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error(`API Error Status: ${response.status}`);
      }

      const resData = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: resData.text }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev, 
        { 
          role: 'assistant', 
          content: `⚠️ **Copilot Sync Interrupted**: Failed to exchange packets with the serverless AI gateway. Please check your developer API key config or try again. (${err.message})` 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (actionPrompt: string) => {
    handleSend(actionPrompt);
  };

  return (
    <>
      {/* 1. Floating Toggle Button with Glowing Pulsing Ring */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] text-white flex items-center justify-center shadow-lg shadow-[#7c3aed]/30 hover:scale-110 active:scale-95 transition-all duration-300 z-50 border border-[#a78bfa]/20 group focus:outline-none"
        title="Open AI Copilot Chat"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] animate-ping opacity-25 group-hover:opacity-40 transition-opacity" />
        {isOpen ? (
          <X className="h-6 w-6 relative z-10 transition-transform duration-300 rotate-90" />
        ) : (
          <Sparkles className="h-6 w-6 relative z-10 transition-transform duration-300 group-hover:rotate-12" />
        )}
      </button>

      {/* 2. Slide-Over Panel Container */}
      <div
        className={`fixed top-0 right-0 h-screen w-[420px] max-w-full bg-[#070a12]/95 backdrop-blur-xl border-l border-[#1f2937] z-40 shadow-2xl flex flex-col transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel Header */}
        <div className="h-16 border-b border-[#1f2937] px-6 flex items-center justify-between bg-[#0b0f19]/80">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#4c1d95] flex items-center justify-center border border-[#a78bfa]/20">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h5 className="font-outfit text-sm font-bold text-white flex items-center gap-1.5">
                DebugBit Copilot
              </h5>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Gemini 2.5 Flash</span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-[#111827] border border-[#1f2937] text-gray-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 scrollbar-thin">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={index} 
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? 'ml-auto flex-row-reverse' : ''
                }`}
              >
                {!isUser && (
                  <div className="h-7 w-7 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#a78bfa] flex items-center justify-center text-xs shrink-0 font-bold uppercase">
                    AI
                  </div>
                )}
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-[#7c3aed] text-white shadow-md shadow-[#7c3aed]/15 rounded-tr-none' 
                      : 'bg-[#0f172a] border border-[#1f2937] text-gray-300 rounded-tl-none font-sans whitespace-pre-wrap'
                  }`}
                >
                  {/* Basic markdown parsing support for code blocks & bolding inside AI messages */}
                  {isUser ? (
                    msg.content
                  ) : (
                    msg.content.split('\n').map((line, lIdx) => {
                      // Check for code blocks
                      if (line.startsWith('```')) return null;
                      
                      let formattedLine = line;
                      // Replace bold syntax
                      const boldMatch = line.match(/\*\*(.*?)\*\*/g);
                      if (boldMatch) {
                        boldMatch.forEach(bm => {
                          const cleanText = bm.replace(/\*\*/g, '');
                          formattedLine = formattedLine.replace(bm, `<strong class="text-white font-bold">${cleanText}</strong>`);
                        });
                      }
                      
                      // Replace code indicators
                      const codeMatch = line.match(/`(.*?)`/g);
                      if (codeMatch) {
                        codeMatch.forEach(cm => {
                          const cleanCode = cm.replace(/`/g, '');
                          formattedLine = formattedLine.replace(cm, `<code class="bg-gray-800 text-purple-300 px-1.5 py-0.5 rounded font-mono text-[10px]">${cleanCode}</code>`);
                        });
                      }

                      return (
                        <p 
                          key={lIdx} 
                          className="mb-2 last:mb-0"
                          dangerouslySetInnerHTML={{ __html: formattedLine }}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-3 max-w-[80%] items-center text-gray-500 text-xs">
              <div className="h-7 w-7 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20 text-[#a78bfa] flex items-center justify-center text-xs shrink-0 font-bold animate-pulse">
                AI
              </div>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 bg-gray-600 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-gray-600 rounded-full animate-bounce delay-75" />
                <span className="h-1.5 w-1.5 bg-gray-600 rounded-full animate-bounce delay-150" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Prompts */}
        {messages.length === 1 && (
          <div className="px-6 py-2 space-y-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Recommended Scenarios</span>
            <div className="space-y-1.5">
              <button 
                onClick={() => handleQuickAction("Analyze the payment session failures")}
                className="w-full text-left text-xs bg-[#0b0f19] border border-[#1f2937] hover:border-[#7c3aed]/50 text-gray-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group"
              >
                <span>🔍 Explain current Checkout failures</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>
              <button 
                onClick={() => handleQuickAction("Draft an automatic hotfix patch for paymentMethod runtime crash")}
                className="w-full text-left text-xs bg-[#0b0f19] border border-[#1f2937] hover:border-[#7c3aed]/50 text-gray-300 px-3.5 py-2.5 rounded-xl transition-all flex items-center justify-between group"
              >
                <span>⚡ Draft hotfix patch for paymentMethod crash</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        )}

        {/* Input Panel Bar */}
        <div className="p-6 border-t border-[#1f2937] bg-[#0b0f19]/80 flex gap-2">
          <input
            type="text"
            placeholder="Ask Copilot anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isLoading}
            className="flex-1 bg-[#030712] border border-[#1f2937] px-4 py-3 rounded-xl text-xs text-white placeholder-gray-500 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-all outline-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading}
            className="p-3 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white transition-all shadow-md shadow-[#7c3aed]/10 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
