"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { 
  Sparkles, 
  X, 
  Send, 
  RotateCcw, 
  CheckCheck, 
  Copy,
  ChevronRight,
  ShieldCheck,
  Zap,
  BookOpen,
  Compass,
  Briefcase
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Message {
  id: string;
  sender: "user" | "companion";
  content: string;
  timestamp: string;
  sources?: string[];
  suggestedAction?: {
    label: string;
    href: string;
  };
}

interface CareerCompanionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CareerCompanionDrawer: React.FC<CareerCompanionDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "companion",
      content: "Namaste! I am **UNNATI**, your AI Career & Growth Mentor.\n\nWhether you are a student exploring your first career direction, a graduate preparing for placements, or a professional aiming for a transition in **Technology, Business, Finance, Design, or Analytics**, I'm here to help.\n\nHow can I support your journey today?",
      timestamp: "Just now",
      sources: ["UNNATI Career Guide", "O*NET & ESCO Curated Taxonomies"],
      suggestedAction: {
        label: "Explore Career Pathways",
        href: "/explore"
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What skills do I need for Product Management?",
    "How does my personalized roadmap get built?",
    "How can I prepare for an entry-level Data Analyst role?",
    "Tips to make my resume stand out to employers"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      content: textToSend.trim(),
      timestamp: "Just now"
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!messageText) setInput("");
    setIsTyping(true);

    // Contextual, encouraging, human-centred career guidance
    setTimeout(() => {
      let replyContent = "";
      let sources = ["UNNATI Career Intelligence"];
      let action: { label: string; href: string } | undefined;

      const lower = textToSend.toLowerCase();

      if (lower.includes("product management") || lower.includes("pm") || lower.includes("product manager")) {
        replyContent = "### Path to Product Management (PM)\n\nProduct Management connects **technology, business strategy, and user experience**:\n\n1. **Core Capabilities:** Product lifecycle planning, user journey mapping, metrics analysis (A/B testing, churn, retention), and feature prioritization.\n2. **Recommended Sprints:** Build a product tear-down or redesign case study showing how you would improve an existing consumer app.\n3. **Cross-Disciplinary Bridge:** If you come from engineering, focus on user research; if you come from business or marketing, build empathy for technical feasibility.\n\nCheck our **Explore Careers** section to view median compensation and skill requirements!";
        sources = ["O*NET 15-1299.09 (Product Management)", "Industry Benchmark 2026"];
        action = { label: "View Product Manager Pathway", href: "/explore" };
      } else if (lower.includes("roadmap") || lower.includes("plan") || lower.includes("learning path")) {
        replyContent = "### How Your Roadmap Works\n\nYour roadmap is designed as a **structured 3-phase journey** tailored to your available study hours:\n\n- **Phase 1 (Core Foundations):** The essential concepts and prerequisites you need first.\n- **Phase 2 (Applied Capability):** Hands-on projects where you practice real-world problem solving.\n- **Phase 3 (Industry Capstone):** A showcase project and diagnostic evaluation that proves your readiness to employers.\n\nAs you check off modules and complete skill checks, your estimated readiness score updates automatically!";
        sources = ["UNNATI 3-Phase Milestone Framework"];
        action = { label: "Inspect Your Roadmap", href: "/roadmap" };
      } else if (lower.includes("data") || lower.includes("analyst") || lower.includes("analytics")) {
        replyContent = "### Data & Business Intelligence Analyst Pathway\n\nData Analysts translate complex metrics into clear business decisions:\n\n1. **Foundational Skills:** Advanced SQL queries, data manipulation with Python or Excel, and visualization with tools like Power BI or Tableau.\n2. **Business Problem Solving:** Learning how to answer practical questions: *Why are users dropping off?* or *Which region yields the highest ROI?*\n3. **Portfolio Projects:** Build an interactive public dashboard analyzing real-world public datasets.";
        sources = ["O*NET 15-2051.01 (Data Intelligence)", "ESCO Business Analytics Unit"];
        action = { label: "Explore Data Careers", href: "/explore" };
      } else if (lower.includes("resume") || lower.includes("cv")) {
        replyContent = "### Stand-Out Resume Best Practices\n\nTo make your profile compelling across both technical and business roles:\n\n1. **Show Impact with Metrics:** Instead of *\"Worked on marketing campaigns\"*, write *\"Led email growth campaign generating 35% higher student engagement\"*.\n2. **Highlight Practical Projects:** Employers care most about what you have built and demonstrated rather than just courses attended.\n3. **Keep Skills Relevant:** Group your skills clearly into tools, methodologies, and domain knowledge.\n\nYou can upload your resume on the **Dashboard** to let our AI extract your verified background automatically!";
        sources = ["UNNATI Placement & Resume Rubric"];
        action = { label: "Upload Resume on Dashboard", href: "/dashboard" };
      } else {
        replyContent = `Thank you for asking about **"${textToSend}"**!\n\nEvery career path requires a clear starting point. I recommend:\n\n1. Reviewing the **Career Pathways** catalog to find target roles that match your interests.\n2. Uploading your background to generate an evidence-weighted diagnostic of what to learn next.\n3. Completing a quick practice check to verify what you already know!`;
        sources = ["UNNATI Growth Advisor"];
        action = { label: "Explore Careers", href: "/explore" };
      }

      const companionMessage: Message = {
        id: `comp-${Date.now()}`,
        sender: "companion",
        content: replyContent,
        timestamp: "Just now",
        sources,
        suggestedAction: action
      };

      setMessages((prev) => [...prev, companionMessage]);
      setIsTyping(false);
    }, 700);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "companion",
        content: "Chat history cleared. What skill, career path, or interview topic would you like to explore next?",
        timestamp: "Just now",
        sources: ["UNNATI Growth Advisor"]
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-6 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Slide-over Drawer Container */}
      <div className="relative flex flex-col w-full sm:w-[460px] h-[92vh] sm:h-[720px] max-h-screen bg-white border border-slate-200/90 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 via-white to-orange-50/50">
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-100 p-1 border-2 border-purple-200 shadow-soft-sm">
              <Image 
                src="/logo.png" 
                alt="UNNATI" 
                width={36} 
                height={36} 
                className="object-contain" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-sm font-bold text-slate-900">
                  UNNATI AI Career Mentor
                </h3>
                <Badge variant="saffron" className="text-[10px] py-0 px-2 font-bold">
                  Live
                </Badge>
              </div>
              <p className="text-xs text-slate-500">
                Grounded guidance for students &amp; professionals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              title="Close companion"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`relative max-w-[88%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-unnati-indigo text-white shadow-soft-md rounded-tr-xs"
                    : "bg-white text-slate-800 border border-slate-200/80 shadow-soft-sm rounded-tl-xs"
                }`}
              >
                {/* Companion Header */}
                {msg.sender === "companion" && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-unnati-indigo font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                      UNNATI Growth Advisor
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                )}

                {/* Message Body */}
                <div className="space-y-2 whitespace-pre-wrap">
                  {msg.content}
                </div>

                {/* Grounding Source Tags */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold">Sources:</span>
                    {msg.sources.map((source, idx) => (
                      <span 
                        key={idx} 
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 border border-slate-200"
                      >
                        {source}
                      </span>
                    ))}
                  </div>
                )}

                {/* Suggested Action Pill */}
                {msg.suggestedAction && (
                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <a
                      href={msg.suggestedAction.href}
                      onClick={onClose}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-unnati-indigo border border-purple-200 text-xs font-bold transition-all"
                    >
                      <span>{msg.suggestedAction.label}</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-slate-400 mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Typing Animation */}
          {isTyping && (
            <div className="flex items-center gap-2 max-w-[80%] rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3.5 text-xs text-unnati-indigo font-medium shadow-soft-sm">
              <Sparkles className="h-4 w-4 animate-spin text-unnati-saffron" />
              <span className="flex items-center gap-1">
                Thinking and preparing advice
                <span className="animate-bounce">.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompt Chips */}
        {messages.length < 3 && (
          <div className="px-4 py-3 border-t border-slate-100 bg-white">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Common Questions
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-3 py-1.5 text-xs text-slate-700 hover:text-unnati-indigo transition-all text-left cursor-pointer font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Input Box */}
        <div className="p-3.5 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about careers, skills, resumes, or interview advice..."
              className="flex-1 rounded-xl clean-input px-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-unnati-indigo hover:bg-unnati-indigo-dark text-white shadow-soft-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
          <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-400">
            <span>Powered by UNNATI Mentorship Engine</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="h-3 w-3" /> Non-high-risk guidance
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
