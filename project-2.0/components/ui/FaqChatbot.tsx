"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, Bot, Sparkles, User, Minimize2, Check } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  timestamp: Date;
  chips?: string[];
}

const FAQ_DATABASE: { keywords: string[]; answer: string; chips?: string[] }[] = [
  {
    keywords: ["voxamo", "what is", "about", "product", "pmtool"],
    answer: "🚀 **Voxamo** is an all-in-one, premium product management and roadmapping workspace designed to supercharge your shipping cycle. It unifies customer feedback, prioritization matrices, drag-and-drop roadmaps, and automated AI generation in one seamless workspace.",
    chips: ["📊 Prioritizing features", "🗺️ Exporting diagrams"]
  },
  {
    keywords: ["priorit", "score", "rice", "impact", "effort", "confidence", "matrix"],
    answer: "📊 **Prioritizing in Voxamo is easy!**\n\n1. Go to **Prioritization** on the sidebar.\n2. Adjust the sliders for **Impact, Confidence, Reach, and Effort** for each feature.\n3. Voxamo automatically computes an **Opportunity Score** to rank your highest-value features.\n4. Head to the Home Dashboard to see your **High Value — Unstarted** queue instantly!",
    chips: ["💡 Tell me about Voxamo", "🤖 AI PRD Writer"]
  },
  {
    keywords: ["export", "download", "png", "svg", "diagram", "save"],
    answer: "🗺️ **Exporting Roadmaps & User Journeys:**\n\nInside the **Roadmapping** canvas tool, click the **'Export SVG'** button in the top right header. This will instantly package your entire flowchart, connector lines, and nodes into a gorgeous, high-resolution vector `.svg` file suitable for pitch decks or wiki docs!",
    chips: ["👥 Inviting colleagues", "🤖 AI PRD Writer"]
  },
  {
    keywords: ["team", "invite", "collaborate", "colleague", "member", "share"],
    answer: "👥 **Collaboration in Voxamo:**\n\n1. Navigate to the **Team** page from the sidebar.\n2. Enter your colleague's corporate email address.\n3. Click **'Send Invitation'**.\n4. They will receive an automated invitation link. Once they register, they can directly view and edit your workspace in real-time!",
    chips: ["💡 Tell me about Voxamo", "📊 Prioritizing features"]
  },
  {
    keywords: ["ai", "prd", "generator", "write", "draft", "artificial"],
    answer: "🤖 **AI-Powered PRD Generator:**\n\nNeed to write a Product Requirement Document? \n\n1. Open the **PRD Generator** tool in the sidebar.\n2. Select an active feature from your board.\n3. Specify your target audience (e.g., developers, stakeholders) and tone (professional, direct, visionary).\n4. Click **'Generate'** and watch our AI draft a complete, production-ready PRD in under 10 seconds! You can copy it with one click.",
    chips: ["💡 Tell me about Voxamo", "🗺️ Exporting diagrams"]
  },
  {
    keywords: ["inbox", "ideas", "feedback", "sales", "request", "customer"],
    answer: "📥 **Ideas Inbox:**\n\nCapture customer requests, bug reports, and sales insights inside the **Ideas Inbox** before they pollute your board. When you're ready to build, click the **'Convert to Feature'** button to turn any item into a prioritized task with a single click!",
    chips: ["📊 Prioritizing features", "👥 Inviting colleagues"]
  },
  {
    keywords: ["timeline", "gantt", "date", "schedule", "month", "day"],
    answer: "📅 **Strategic Roadmap Timeline:**\n\nVoxamo lists your releases on a high-level visual roadmap timeline. To schedule, click on any release bar to set custom **Start** and **End dates** datewise, so you can track precisely when features will ship without complex scheduling precision.",
    chips: ["🗺️ Exporting diagrams", "🤖 AI PRD Writer"]
  }
];

const PRE_CONFIGURED_CHIPS = [
  "💡 What is Voxamo?",
  "📊 How to prioritize?",
  "🗺️ Exporting roadmaps?",
  "👥 Inviting colleagues?",
  "🤖 AI PRD Writer?",
  "📥 Ideas Inbox?",
  "📅 Timelines?"
];

export default function FaqChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-greet",
      sender: "bot",
      text: "👋 Hi! I'm **Voxi**, your interactive Voxamo companion. Click any of the popular topics below to explore how to get the most out of your workspace!",
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsgId = crypto.randomUUID();
    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    // AI thinking delay
    setTimeout(() => {
      setIsTyping(false);
      const botResponse = generateBotResponse(textToSend);
      setMessages(prev => [...prev, botResponse]);
    }, 600);
  };

  const generateBotResponse = (query: string): Message => {
    const cleanedQuery = query.toLowerCase().trim();

    // Look for exact keyword match
    for (const faq of FAQ_DATABASE) {
      const match = faq.keywords.some(keyword => cleanedQuery.includes(keyword));
      if (match) {
        return {
          id: crypto.randomUUID(),
          sender: "bot",
          text: faq.answer,
          timestamp: new Date()
        };
      }
    }

    // Default fallback
    return {
      id: crypto.randomUUID(),
      sender: "bot",
      text: "🤔 I couldn't find a direct answer for that. You can explore: \n\n* **Prioritization** to rank features\n* **Roadmapping** for interactive diagrams\n* **AI PRD Generator** to generate documents\n* **Team** page to add colleagues\n\nTry checking out one of the active menu topics!",
      timestamp: new Date()
    };
  };

  const renderFormattedText = (text: string) => {
    return text.split("\n").map((line, idx) => {
      // Bold text formatting
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-slate-900 dark:text-white">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }

      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      const content = parts.length > 0 ? parts : formattedLine;

      if (line.startsWith("* ")) {
        return <li key={idx} className="ml-4 list-disc text-xs mt-1 text-slate-700 dark:text-gray-300">{content}</li>;
      }

      return <p key={idx} className="text-xs text-slate-700 dark:text-gray-300 mt-1 leading-relaxed">{content}</p>;
    });
  };

  const handleChipClick = (chipText: string) => {
    // Strip emojis for keyword searching
    const cleanedText = chipText.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDC00-\uDFFF]/g, "").replace(/\?/g, "").trim();
    handleSendMessage(cleanedText);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[999] w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 group border border-blue-500/20"
        title="Voxamo Assistant"
      >
        {isOpen ? (
          <X className="text-slate-900 dark:text-white group-hover:rotate-90 transition-transform duration-200" size={22} />
        ) : (
          <div className="relative">
            <MessageSquare className="text-slate-900 dark:text-white" size={22} />
            <Sparkles size={11} className="absolute -top-1 -right-2 text-amber-300 animate-pulse" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
          </div>
        )}
      </button>

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[998] w-80 sm:w-96 h-[480px] bg-white/95 dark:bg-[#121420]/95 border border-slate-200 dark:border-white/[0.08] rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-6">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-[#171923] dark:to-[#1a1c27] border-b border-slate-200 dark:border-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Bot size={16} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  Voxi FAQ Help
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Interactive FAQ Navigator</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/5"
            >
              <Minimize2 size={14} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${
                  msg.sender === "user"
                    ? "bg-indigo-600/15 border-indigo-500/30 text-indigo-400"
                    : "bg-blue-500/10 border-blue-500/30 text-blue-400"
                }`}>
                  {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-2">
                  <div className={`p-3 rounded-xl border ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-slate-900 dark:text-white border-indigo-500/20 rounded-tr-none"
                      : "bg-slate-100 dark:bg-white/[0.04] border-slate-200 dark:border-white/[0.06] rounded-tl-none text-slate-800 dark:text-gray-200"
                  }`}>
                    {renderFormattedText(msg.text)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 items-start max-w-[85%] mr-auto">
                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 border bg-blue-500/10 border-blue-500/30 text-blue-400">
                  <Bot size={12} />
                </div>
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.06] rounded-tl-none">
                  <div className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-gray-500 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Static Interactive FAQ Chips Tray (Footer) */}
          <div className="p-3 border-t border-slate-200 dark:border-white/[0.06] bg-slate-50 dark:bg-black/20 flex flex-col gap-2">
            <span className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest pl-1">⚡ Explore Topics</span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1 pb-1">
              {PRE_CONFIGURED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(chip)}
                  disabled={isTyping}
                  className="px-2.5 py-1 text-[10px] font-semibold rounded-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] hover:border-blue-500 hover:bg-blue-500/10 text-slate-700 dark:text-gray-300 hover:text-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed text-left"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </>
  );
}
