import { useState, useRef, useEffect, type FormEvent } from 'react';
import { PHCOperationalData, AICopilotMessage } from '../types';
import {
  MessageSquare,
  Send,
  Sparkles,
  Bot,
  User,
  CornerDownLeft,
  AlertCircle,
  Pill,
  Bed,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

interface Props {
  data: PHCOperationalData;
  messages: AICopilotMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

const SUGGESTED_QUESTIONS = [
  'How many days of Paracetamol stock do I have?',
  'Which disease cases are rising?',
  'What is my bed occupancy?',
  'What should I do today?',
];

export function CopilotChat({ data, messages, onSendMessage, isLoading }: Props) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleSuggestedClick = async (q: string) => {
    if (isLoading) return;
    await onSendMessage(q);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[650px]">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 text-blue-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">PHC-SHIELD AI Operational Copilot</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-xs text-slate-500">
              Grounded conversational assistant querying live facility state &amp; clinical logistics
            </p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] font-mono text-slate-400">Context: {data.basicInfo.name || 'PHC Operational Register'}</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/50">
        {messages.map((msg) => {
          const isAI = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 max-w-2xl ${
                isAI ? 'mr-auto' : 'ml-auto flex-row-reverse'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                  isAI
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-800 text-white shadow-xs'
                }`}
              >
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`p-4 rounded-xl text-xs sm:text-sm leading-relaxed ${
                  isAI
                    ? 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    : 'bg-blue-600 text-white font-medium'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Grounding metadata pill */}
                {isAI && msg.groundingDataPoints && msg.groundingDataPoints.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Grounded in:
                    </span>
                    {msg.groundingDataPoints.map((dp, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono"
                      >
                        {dp}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-[10px] text-right opacity-60">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3 max-w-2xl mr-auto">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-xs flex items-center gap-2 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-300"></span>
              <span className="text-slate-500">Evaluating facility logs...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200 overflow-x-auto flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 shrink-0">
          Suggested Queries:
        </span>
        {SUGGESTED_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestedClick(q)}
            disabled={isLoading}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 text-slate-700 font-medium transition-colors disabled:opacity-50 shadow-2xs"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3.5 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2">
          <input
            type="text"
            id="input-copilot-query"
            placeholder="Ask anything about inventory, patient trends, bed occupancy, or clinical guidelines..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="submit"
            id="btn-send-copilot-msg"
            disabled={!inputText.trim() || isLoading}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-lg font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send Query</span>
          </button>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2 px-1">
          <span>
            AI analyses operational and aggregated healthcare data. Sensitive personal info is never stored.
          </span>
          <span className="font-mono">Privacy-Preserving Prototype</span>
        </div>
      </form>
    </div>
  );
}
