"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Briefcase,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Layers,
  RefreshCw,
  MessageSquare,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

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

type UserCategory = "all" | "students" | "business" | "finance" | "tech" | "switchers";

export const CareerCompanionWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [footerOffset, setFooterOffset] = useState(0);
  const [isFooterCollisionHidden, setIsFooterCollisionHidden] = useState(false);
  const [activeCategory, setActiveCategory] = useState<UserCategory>("all");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome-1",
      sender: "companion",
      content: "Namaste! I am **UNNATI**, your friendly AI Career & Growth Mentor. 🙏\n\nI'm designed for **every learner and professional**:\n- 🎓 **Students & Freshers** exploring degrees and first jobs\n- 💼 **Business, Marketing & Ops** professionals scaling up\n- 📊 **Finance & Analytics** learners mastering data\n- 💻 **Tech & Design** creators building portfolios\n- 🔄 **Career Switchers** moving into new fields\n\nHow can I help you today? Choose a question below or ask me anything!",
      timestamp: "Just now",
      sources: ["UNNATI Career Mentorship Engine", "O*NET & ESCO 2026 Standards"],
      suggestedAction: {
        label: "Explore 20+ Career Pathways",
        href: "/explore"
      }
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Footer collision detection & repositioning via IntersectionObserver & scroll metrics
  useEffect(() => {
    const checkFooterCollision = () => {
      const footer = document.querySelector("footer");
      if (!footer) return;

      const footerRect = footer.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // When the footer enters the viewport
      if (footerRect.top < viewportHeight) {
        const visibleFooterHeight = viewportHeight - footerRect.top;
        const spaceAboveFooter = footerRect.top;

        // If adequate space does NOT exist (< 150px remaining above footer)
        if (spaceAboveFooter < 150) {
          setIsFooterCollisionHidden(true);
          setFooterOffset(0);
        } else {
          // Adequate space exists: elevate launcher above the footer
          setIsFooterCollisionHidden(false);
          // Elevate so launcher stays 16px cleanly above the top of the footer
          setFooterOffset(visibleFooterHeight + 16);
        }
      } else {
        // Footer is entirely below viewport
        setIsFooterCollisionHidden(false);
        setFooterOffset(0);
      }
    };

    window.addEventListener("scroll", checkFooterCollision, { passive: true });
    window.addEventListener("resize", checkFooterCollision, { passive: true });
    checkFooterCollision();

    // IntersectionObserver for reliable threshold notifications
    const footer = document.querySelector("footer");
    let observer: IntersectionObserver | null = null;
    if (footer && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => checkFooterCollision(),
        { threshold: [0, 0.05, 0.1, 0.25, 0.5, 0.75, 1.0] }
      );
      observer.observe(footer);
    }

    return () => {
      window.removeEventListener("scroll", checkFooterCollision);
      window.removeEventListener("resize", checkFooterCollision);
      observer?.disconnect();
    };
  }, []);

  // Listen to global open event (e.g. from footer link or action triggers)
  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true);
    };
    window.addEventListener("open-unnati-companion", handleOpen);
    window.addEventListener("open-companion", handleOpen);
    return () => {
      window.removeEventListener("open-unnati-companion", handleOpen);
      window.removeEventListener("open-companion", handleOpen);
    };
  }, []);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input on open
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [messages, isOpen]);

  const categories = [
    { id: "all", label: "🌟 All Topics" },
    { id: "students", label: "🎓 Students & Freshers" },
    { id: "business", label: "💼 Business & Marketing" },
    { id: "finance", label: "📊 Finance & Analytics" },
    { id: "tech", label: "💻 Tech & Design" },
    { id: "switchers", label: "🔄 Career Switchers" },
  ];

  const suggestedPrompts: Record<UserCategory, string[]> = {
    all: [
      "What skills do I need for Product Management?",
      "How to build a resume with zero experience?",
      "How does my personalized roadmap work?",
      "How to switch careers without starting over?"
    ],
    students: [
      "How do I choose the right career path after college?",
      "How to build a resume with zero experience?",
      "What skills are companies hiring freshers for?",
      "When and how should I apply for internships?"
    ],
    business: [
      "What skills do I need for Product Management?",
      "What are the highest in-demand Digital Marketing skills?",
      "How to move from Sales to Business Operations?",
      "What does a Business Analyst do day-to-day?"
    ],
    finance: [
      "How to become a Data Analyst without coding experience?",
      "What tools should a Financial Analyst master first?",
      "Excel vs SQL vs Power BI: Where should I start?",
      "What are typical entry-level salaries in Data Analytics?"
    ],
    tech: [
      "How do I build an impressive UI/UX design portfolio?",
      "Frontend vs Backend vs Full-Stack: What should I pick?",
      "What capstone projects impress tech hiring managers?",
      "How to prepare for UNNATI technical skill checks?"
    ],
    switchers: [
      "How to switch careers without starting over?",
      "How do I find my transferable skills?",
      "How long does a career transition usually take?",
      "How to explain a career gap or transition on my resume?"
    ]
  };

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

    setTimeout(() => {
      let replyContent = "";
      let sources = ["UNNATI Career Mentorship Engine"];
      let action: { label: string; href: string } | undefined;

      const lower = textToSend.toLowerCase();

      // 1. STUDENTS & FRESHERS
      if (lower.includes("student") || lower.includes("after college") || lower.includes("choose the right career") || lower.includes("freshers")) {
        replyContent = `### Career Path Planning for Students & Freshers 🎓\n\nStarting your career is all about finding the intersection of **what you enjoy, what you can learn, and what companies are hiring for**:\n\n1. **Step 1: Discover Your Baseline Strengths**\n   You don't need years of experience. Focus on your foundational strengths—problem solving, communication, analytical thinking, or creativity.\n\n2. **Step 2: Explore Real-World Roles**\n   Check our **Career Pathways catalog**. Look beyond job titles: read day-to-day responsibilities, median salaries, and core skill requirements for roles in Business, Design, Finance, and Tech.\n\n3. **Step 3: Build Proof of Work**\n   Employers love candidates who build something tangible: a class project, a marketing audit of a favourite brand, a financial analysis spreadsheet, or a simple web app.\n\n4. **Step 4: Take a Quick Skill Check**\n   Complete a 10-minute diagnostic check on UNNATI to discover where you stand and get a tailored study plan!`;
        sources = ["O*NET Student Career Guidance", "UNNATI Campus-to-Corporate Framework"];
        action = { label: "Explore Careers Catalog", href: "/explore" };
      }
      // 2. RESUME WITH ZERO EXPERIENCE
      else if (lower.includes("zero experience") || lower.includes("no experience") || lower.includes("first resume")) {
        replyContent = `### How to Build a Strong Resume with Zero Experience 📄\n\nWhen you don't have corporate experience, highlight **competence, initiatives, and practical evidence**:\n\n1. **Lead with Academic & Personal Projects**\n   Dedicate 40% of your resume space to projects! Detail the problem you solved, the tools used (Excel, Figma, Python, Canva, etc.), and the outcome.\n\n2. **Use the STAR Formula**\n   *(Situation, Task, Action, Result)*. Instead of saying *"Managed club social media"*, write *"Created 12 Instagram campaigns that boosted club event attendance by 45%"*.\n\n3. **Showcase Verified Skills**\n   Group skills cleanly into **Tools** (e.g. Excel, Notion, SQL), **Functional Skills** (e.g. Market Research, Financial Modeling), and **Soft Skills**.\n\n4. **Add Extracurricular Leadership**\n   Volunteering, hackathons, college fest committees, and student councils all demonstrate real-world initiative!`;
        sources = ["UNNATI Placement & Resume Rubric", "Industry Recruiter Benchmarks"];
        action = { label: "Upload Resume to Dashboard", href: "/dashboard" };
      }
      // 3. PRODUCT MANAGEMENT
      else if (lower.includes("product management") || lower.includes("pm") || lower.includes("product manager")) {
        replyContent = `### Becoming a Product Manager (PM) 💼\n\nProduct Management sits at the intersection of **Business Strategy, Technology, and User Experience**:\n\n1. **Core Competencies to Build:**\n   - **User Empathy & Research:** Talking to customers, identifying unmet needs, and writing user stories.\n   - **Product Sense & Prioritization:** Using frameworks like RICE (*Reach, Impact, Confidence, Effort*) or MoSCoW to prioritize features.\n   - **Data-Driven Thinking:** Understanding product metrics (DAU/MAU, conversion funnels, churn, retention).\n   - **Execution & Communication:** Writing clear Product Requirement Documents (PRDs) and collaborating with designers and engineers.\n\n2. **How to Break In:**\n   You don't need a computer science degree! Many top PMs transition from Business, Marketing, Design, or Customer Support. Build a **Product Tear-Down** of an app you use daily to showcase your product thinking.`;
        sources = ["O*NET 15-1299.09 (Product Management)", "Product School 2026 Standards"];
        action = { label: "View Product Manager Pathway", href: "/explore" };
      }
      // 4. DIGITAL MARKETING
      else if (lower.includes("marketing") || lower.includes("digital marketing") || lower.includes("growth")) {
        replyContent = `### Digital Marketing & Growth Strategy 🚀\n\nModern digital marketing is a blend of **creative storytelling and data analytics**:\n\n1. **Key Pillars to Master:**\n   - **Organic Growth & SEO:** Keyword research, on-page optimization, content distribution.\n   - **Performance Marketing:** Running targeted campaigns on Google Ads and Meta Ads, managing CAC (Customer Acquisition Cost) and ROAS.\n   - **Lifecycle & Retention:** Email automation, drip campaigns, push notifications, and customer journey mapping.\n   - **Analytics & Experimentation:** Google Analytics 4 (GA4), A/B testing, and funnel tracking.\n\n2. **Portfolio Project Idea:**\n   Run a real or mock digital campaign for a local business, student event, or personal blog. Track impressions, clicks, conversions, and document your learnings!`;
        sources = ["ESCO Digital Marketing Unit", "HubSpot Academy Benchmarks"];
        action = { label: "Explore Marketing Pathways", href: "/explore" };
      }
      // 5. DATA ANALYST WITHOUT CODING
      else if (lower.includes("data analyst") || lower.includes("analytics") || lower.includes("without coding")) {
        replyContent = `### Transitioning into Data Analytics 📊\n\nGood news: You **do NOT need an advanced computer science degree** to become a high-impact Data Analyst!\n\n1. **Start with Advanced Excel / Google Sheets:**\n   Master Pivot Tables, VLOOKUP/XLOOKUP, conditional aggregations (SUMIFS/COUNTIFS), and data cleaning. 60% of business reporting begins here.\n\n2. **Learn Business SQL (The #1 Most Demanded Skill):**\n   Focus on SELECT, WHERE, GROUP BY, HAVING, and JOINs. Writing queries to extract answers from databases is the core of analytics.\n\n3. **Master a BI Visualization Tool:**\n   Learn **Power BI** or **Tableau**. Build clean, interactive dashboards that tell an executive story in seconds.\n\n4. **Add Applied Python When Ready:**\n   Once comfortable with SQL, pick up Python libraries like Pandas and Matplotlib for deeper statistical analysis.\n\nCheck our **Explore Careers** page to see real salary brackets and in-demand skills!`;
        sources = ["O*NET 15-2051.01 (Data Intelligence)", "ESCO Business Analytics Unit"];
        action = { label: "Inspect Data Analyst Pathway", href: "/explore" };
      }
      // 6. FINANCIAL ANALYST
      else if (lower.includes("finance") || lower.includes("financial analyst") || lower.includes("accounting")) {
        replyContent = `### Path to Financial Analyst & Corporate Finance 📈\n\nFinancial Analysts help organizations make strategic capital allocation, investment, and budgeting decisions:\n\n1. **Core Knowledge Pillars:**\n   - **3-Statement Financial Modeling:** Linking Income Statement, Balance Sheet, and Cash Flow Statement.\n   - **Valuation Methodologies:** Discounted Cash Flow (DCF), Comparable Company Analysis, and Precedent Transactions.\n   - **Financial Planning & Analysis (FP&A):** Variance analysis, budget forecasting, and KPI dashboards.\n\n2. **Essential Tools:**\n   Advanced Excel (shortcuts, financial formulas like NPV, IRR, XIRR), Power BI, and accounting software (Tally / SAP basics).\n\n3. **Practical Portfolio Step:**\n   Download an annual report (10-K or Indian Annual Report) of a public company (e.g., Tata, Infosys, Apple) and build a 3-year projection model!`;
        sources = ["O*NET 13-2051.00 (Financial Analysts)", "CFA Institute Core Curriculum"];
        action = { label: "Explore Finance Pathways", href: "/explore" };
      }
      // 7. UI/UX DESIGN & PORTFOLIO
      else if (lower.includes("design") || lower.includes("ui") || lower.includes("ux") || lower.includes("figma")) {
        replyContent = `### Building a Standout UI/UX Design Portfolio 🎨\n\nDesign hiring managers care about **how you think and solve problems**, not just pretty dribbble mockups:\n\n1. **The 4 Steps of a Stellar Case Study:**\n   - **The Problem:** What user pain point or business challenge were you addressing?\n   - **User Research:** Who are the users? What did you discover through interviews or surveys?\n   - **Wireframing & Iterations:** Show early paper sketches or low-fidelity wireframes and explain why you changed them.\n   - **Final Solution & Usability Testing:** High-fidelity Figma prototypes with tested user feedback.\n\n2. **Tool Mastery:**\n   Figma (Auto-layout, Components, Variants), FigJam for mapping journeys, and basic knowledge of HTML/CSS constraints.\n\n3. **How Many Case Studies?**\n   Quality beats quantity! 2 to 3 thorough, deep case studies are far better than 10 shallow screens.`;
        sources = ["Nielsen Norman Group UX Standards", "Interaction Design Foundation"];
        action = { label: "Explore UI/UX Design Roles", href: "/explore" };
      }
      // 8. TECH: FRONTEND VS BACKEND VS FULLSTACK
      else if (lower.includes("frontend") || lower.includes("backend") || lower.includes("full-stack") || lower.includes("full stack") || lower.includes("software engineer")) {
        replyContent = `### Software Engineering: Choosing Your Direction 💻\n\nHere is how to choose between Frontend, Backend, and Full-Stack based on what you enjoy:\n\n- **Frontend Engineering:** Ideal if you love visual interfaces, immediate feedback, and user interaction. Learn **JavaScript/TypeScript, React/Next.js, and Tailwind CSS**.\n- **Backend Engineering:** Ideal if you enjoy data architecture, system design, databases, security, and APIs. Learn **Python (FastAPI), Node.js, and PostgreSQL**.\n- **Full-Stack Engineering:** Bridges both worlds. Enables you to build complete end-to-end web products from scratch.\n\n**Recruiter Secret:** Build 1 complete, polished full-stack application with user authentication, a database, and responsive mobile styling rather than 5 generic todo-apps!`;
        sources = ["O*NET 15-1252.00 (Software Developers)", "UNNATI Technical Competency Guide"];
        action = { label: "Explore Tech Pathways", href: "/explore" };
      }
      // 9. CAREER SWITCHERS & TRANSITIONS
      else if (lower.includes("switch") || lower.includes("transition") || lower.includes("transferable") || lower.includes("career gap")) {
        replyContent = `### Switching Careers Successfully 🔄\n\nCareer transitions are very common today, and you are **not starting from zero**! Your existing background provides valuable transferable strengths:\n\n1. **Map Your Transferable Skills:**\n   - Communication, stakeholder management, client relations, and leadership transfer into **Product Management, Customer Success, and Operations**.\n   - Logical reasoning, Excel work, and business reporting transfer into **Data Analytics and BI**.\n   - Creative writing and visual communication transfer into **Digital Marketing and UI/UX Design**.\n\n2. **Address the Skill Delta:**\n   Use UNNATI to identify the specific 2-3 technical tools required for your target role so you don't waste time studying unnecessary subjects.\n\n3. **Position Your Resume Narrative:**\n   Frame your transition as a deliberate strength: *"Experienced in operations with newly certified skills in SQL and Power BI, bringing deep operational domain knowledge to business analytics."*`;
        sources = ["World Economic Forum Future of Jobs", "UNNATI Career Transition Matrix"];
        action = { label: "Start Skill Assessment", href: "/assessments" };
      }
      // 10. HOW ROADMAP & UNNATI WORKS
      else if (lower.includes("roadmap") || lower.includes("how does unnati work") || lower.includes("plan") || lower.includes("learning path")) {
        replyContent = `### How Your UNNATI Roadmap Works 🧭\n\nYour UNNATI roadmap is a **3-Phase adaptive milestone journey** tailored to your weekly study hours:\n\n- **Phase 1: Core Foundations** — The must-have concepts and fundamental tools.\n- **Phase 2: Applied Capability** — Hands-on mini-projects where you practice solving realistic challenges.\n- **Phase 3: Industry Capstone** — A portfolio-grade showcase project and verified skill evaluation to prove job readiness.\n\n**Adaptive Bayesian Engine:** As you take quick 10-minute diagnostic skill checks or complete modules, your readiness score updates dynamically!`;
        sources = ["UNNATI 3-Phase Milestone Framework", "Bayesian Skill Progression Engine"];
        action = { label: "Inspect Your Roadmap", href: "/roadmap" };
      }
      // 11. GENERAL / FALLBACK
      else {
        replyContent = `Thank you for asking about **"${textToSend}"**! 🌟\n\nHere is how UNNATI can help you make concrete progress on this:\n\n1. **Browse Approved Career Pathways:**\n   Review our **Explore Careers** section to view responsibilities, required capabilities, and salary trends for Business, Technology, Finance, and Design roles.\n\n2. **Take a 10-Minute Skill Check:**\n   Test what you already know without any stress. You'll get immediate constructive feedback and clear recommendations on what to learn next.\n\n3. **Follow a Step-by-Step Roadmap:**\n   Generate a personalized learning roadmap with curated resources and projects tailored to your available time.\n\nFeel free to ask more specific questions (e.g., *"How do I prepare for PM interviews?"*, *"Best tools for Data Analytics"*), and I'll break it down for you!`;
        sources = ["UNNATI Mentorship Engine", "Curated Career Standards"];
        action = { label: "Explore Career Pathways", href: "/explore" };
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
    }, 650);
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome-reset",
        sender: "companion",
        content: "Chat cleared! What career path, skill, or interview topic would you like to explore next? Feel free to pick a category above or type your question below.",
        timestamp: "Just now",
        sources: ["UNNATI Mentorship Engine"]
      }
    ]);
  };

  return (
    <>
      {/* 1. FLOATING LAUNCHER BUTTON (Compact Circular 48–54px, Footer Collision-Aware) */}
      <div 
        className={`fixed z-40 transition-all duration-300 ease-out motion-reduce:transition-none ${
          isFooterCollisionHidden ? "opacity-0 scale-75 pointer-events-none" : "opacity-100 scale-100"
        }`}
        style={{
          bottom: `max(1.25rem, env(safe-area-inset-bottom))`,
          right: `max(1.25rem, env(safe-area-inset-right))`,
          transform: footerOffset > 0 ? `translateY(-${footerOffset}px)` : undefined
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`group relative flex items-center justify-center rounded-full h-12 w-12 sm:h-[52px] sm:w-[52px] bg-unnati-indigo hover:bg-unnati-violet text-white shadow-soft-lg shadow-purple-950/25 hover:shadow-xl hover:shadow-purple-950/35 border-2 border-white ring-2 ring-purple-300/50 hover:ring-purple-400 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-unnati-violet focus-visible:ring-offset-2 ${
            isOpen ? "bg-slate-900 ring-slate-400" : ""
          }`}
          aria-label={isOpen ? "Close UNNATI AI Assistant" : "Ask UNNATI AI"}
          aria-expanded={isOpen}
          title={isOpen ? "Close UNNATI AI" : "Ask UNNATI AI"}
        >
          {/* Small Tooltip on Hover (Desktop only, "Ask UNNATI") */}
          {!isOpen && (
            <span 
              role="tooltip"
              className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900/90 backdrop-blur-sm text-white px-2.5 py-1 text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:block"
            >
              Ask UNNATI
            </span>
          )}

          {/* White Chat Icon (or Close X when open) */}
          {isOpen ? (
            <X className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <MessageSquare className="h-5 w-5 sm:h-5.5 sm:w-5.5 text-white transition-transform duration-200 group-hover:scale-110" />
          )}

          {/* Small AI Indicator (Saffron accent beacon on top right) */}
          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5 sm:h-3 sm:w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-unnati-saffron opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-unnati-saffron border-2 border-white" />
            </span>
          )}
        </button>
      </div>

      {/* 2. CHATBOT WINDOW (Bottom-Right Floating Card) */}
      {isOpen && (
        <div 
          role="dialog"
          aria-label="UNNATI AI Career Chatbot"
          className="fixed z-40 w-[calc(100vw-1.5rem)] sm:w-[440px] md:w-[470px] h-[580px] sm:h-[620px] max-h-[82vh] bg-white border-2 border-purple-200/90 rounded-3xl shadow-2xl shadow-slate-900/30 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 motion-reduce:animate-none"
          style={{
            bottom: `max(5rem, calc(env(safe-area-inset-bottom) + 4.5rem))`,
            right: `max(0.75rem, env(safe-area-inset-right))`,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-purple-100 bg-gradient-to-r from-purple-50 via-white to-orange-50/50 shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-100 p-1 border-2 border-purple-200 shadow-soft-sm shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="UNNATI" 
                  width={32} 
                  height={32} 
                  className="object-contain" 
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-sm font-bold text-slate-900">
                    UNNATI AI Mentor
                  </h3>
                  <Badge variant="saffron" className="text-[9px] py-0 px-1.5 font-bold">
                    Online
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Easy guidance for students &amp; all professionals
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Start a fresh conversation"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Clear chat history"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chatbot"
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                aria-label="Close chatbot"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* User Persona Filter Selector (Easy for Anyone) */}
          <div className="px-3.5 py-2 border-b border-slate-100 bg-slate-50/70 overflow-x-auto no-scrollbar shrink-0">
            <div className="flex items-center gap-1.5 min-w-max">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as UserCategory)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.id
                      ? "bg-unnati-indigo text-white shadow-soft-sm"
                      : "bg-white text-slate-600 hover:bg-purple-50 hover:text-unnati-indigo border border-slate-200/80"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`relative max-w-[90%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-unnati-indigo text-white shadow-soft-md rounded-tr-xs"
                      : "bg-white text-slate-800 border border-slate-200/90 shadow-soft-sm rounded-tl-xs"
                  }`}
                >
                  {/* Companion Header */}
                  {msg.sender === "companion" && (
                    <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100 text-xs text-unnati-indigo font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
                        UNNATI Growth Advisor
                      </span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-0.5"
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
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
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
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <Link
                        href={msg.suggestedAction.href}
                        onClick={() => setIsOpen(false)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-unnati-indigo border border-purple-200 text-xs font-bold transition-all"
                      >
                        <span>{msg.suggestedAction.label}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
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
              <div className="flex items-center gap-2 max-w-[80%] rounded-2xl rounded-tl-xs bg-white border border-slate-200 p-3 text-xs text-unnati-indigo font-medium shadow-soft-sm">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-unnati-saffron" />
                <span className="flex items-center gap-1 text-slate-600">
                  Preparing thoughtful guidance
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
                  <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Question Chips (Categorized & Easy to Click) */}
          <div className="px-3.5 py-2.5 border-t border-slate-100 bg-white shrink-0">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Questions ({categories.find(c => c.id === activeCategory)?.label})
            </p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              {suggestedPrompts[activeCategory].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(prompt)}
                  className="rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 px-2.5 py-1 text-[11px] text-slate-700 hover:text-unnati-indigo transition-all text-left cursor-pointer font-medium leading-tight"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about careers, skills, resumes, or transitions..."
                className="flex-1 rounded-xl clean-input px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-unnati-indigo hover:bg-unnati-indigo-dark text-white shadow-soft-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                title="Send question"
                aria-label="Send question"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
              <span>UNNATI Mentorship Engine</span>
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <ShieldCheck className="h-3 w-3" /> Safe, formative guidance
              </span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};

