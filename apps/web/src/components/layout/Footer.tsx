"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShieldCheck, 
  Sparkles, 
  MessageSquare, 
  ArrowUpRight, 
  Mail, 
  Github, 
  Globe, 
  Heart,
  CheckCircle2
} from "lucide-react";

export const Footer: React.FC = () => {
  const handleOpenCompanion = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
  };

  return (
    <footer className="border-t-2 border-slate-200/90 bg-slate-50/95 text-slate-700 relative z-10">
      {/* ========================================================
          MAIN 5-COLUMN FOOTER CONTAINER
          Proportions: Brand 1.5fr, Explore 1fr, Platform 1fr, For Learners 1fr, Trust 1fr
         ======================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr] gap-10 lg:gap-8 xl:gap-10 items-start">
          
          {/* ----------------------------------------------------
              COLUMN 1 — BRAND (1.5fr)
             ---------------------------------------------------- */}
          <div className="space-y-4 lg:pr-4">
            {/* Approved Logo Lockup */}
            <Link 
              href="/" 
              className="inline-flex items-center gap-3.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl"
              aria-label="UNNATI Home"
            >
              <div className="flex h-13 w-13 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100/90 via-white to-orange-50/80 p-1.5 border-2 border-purple-200/90 shadow-soft-md group-hover:border-unnati-violet group-hover:shadow-glow-violet transition-all shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="UNNATI Official Logo" 
                  width={52} 
                  height={52} 
                  className="h-10 w-10 sm:h-11 sm:w-11 object-contain transition-transform duration-300 group-hover:scale-105" 
                  priority
                />
              </div>
              <div className="flex flex-col shrink-0">
                <div className="flex items-center gap-2 leading-none">
                  <span className="font-heading text-2xl font-black text-unnati-indigo tracking-tight group-hover:text-unnati-violet transition-colors">
                    UNNATI
                  </span>
                  <span className="text-[13px] font-bold text-purple-700 font-sans">
                    (उन्नति)
                  </span>
                  <span className="h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                  Your Growth Companion
                </span>
              </div>
            </Link>

            {/* Short Product Description with Controlled Width */}
            <p className="text-[14px] text-slate-600 leading-relaxed max-w-sm font-normal">
              UNNATI connects education, capability, and industry opportunity. We diagnose skill gaps, synthesize personalized 3-phase roadmaps, and verify practical readiness across Business, Technology, Finance, Design, and Analytics.
            </p>

            {/* Campaign Pillar Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-3.5 py-1.5 text-xs font-bold text-unnati-indigo shadow-soft-sm">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
              <span>Learn. Build. Grow. Succeed.</span>
            </div>

            {/* Social & Repository Links (Evenly Spaced) */}
            <div className="flex items-center gap-3 pt-1 text-slate-600">
              <a 
                href="https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity." 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-unnati-indigo hover:border-purple-300 hover:shadow-soft-sm transition-all"
                title="GitHub Repository"
                aria-label="UNNATI GitHub Repository"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="mailto:grievance@unnati.in" 
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-unnati-indigo hover:border-purple-300 hover:shadow-soft-sm transition-all"
                title="Contact Grievance Officer"
                aria-label="Email Grievance Redressal Officer"
              >
                <Mail className="h-4 w-4" />
              </a>
              <a 
                href="/privacy" 
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-unnati-indigo hover:border-purple-300 hover:shadow-soft-sm transition-all"
                title="Data Protection Policy"
                aria-label="Privacy and Data Protection Policy"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
              </a>
            </div>

            <div className="text-[12px] text-slate-500 flex items-center gap-1.5 font-medium pt-0.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Non-high-risk formative self-development platform.</span>
            </div>
          </div>

          {/* ----------------------------------------------------
              COLUMN 2 — EXPLORE (1fr)
             ---------------------------------------------------- */}
          <div className="space-y-4">
            <h4 className="font-heading text-[14px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
              Explore
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Career Pathways
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Role Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/assessments" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Skills Check
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Skills Inventory
                </Link>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------
              COLUMN 3 — PLATFORM (1fr)
             ---------------------------------------------------- */}
          <div className="space-y-4">
            <h4 className="font-heading text-[14px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Learner Dashboard
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Career Discovery
                </Link>
              </li>
              <li>
                <Link href="/assessments" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Assessments
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Progress Tracking
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleOpenCompanion} 
                  className="text-left text-slate-600 hover:text-unnati-indigo transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-unnati-saffron shrink-0" />
                  <span>AI Mentor</span>
                </button>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------
              COLUMN 4 — FOR LEARNERS (1fr)
             ---------------------------------------------------- */}
          <div className="space-y-4">
            <h4 className="font-heading text-[14px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
              For Learners
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
              <li>
                <Link href="/onboarding?persona=student" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Students &amp; Freshers
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=graduate" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Recent Graduates
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=professional" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Working Professionals
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=switcher" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Career Switchers
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Multi-Disciplinary Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* ----------------------------------------------------
              COLUMN 5 — TRUST & LEGAL (1fr)
             ---------------------------------------------------- */}
          <div className="space-y-4">
            <h4 className="font-heading text-[14px] font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200/60 pb-2">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Data Protection
                </Link>
              </li>
              <li>
                <a 
                  href="mailto:grievance@unnati.in" 
                  className="text-slate-600 hover:text-unnati-indigo transition-colors flex items-center gap-1.5"
                >
                  <Mail className="h-3.5 w-3.5 text-purple-600 shrink-0" />
                  <span>Contact Support</span>
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors block">
                  Grievance Officer (GRO)
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-600 hover:text-unnati-indigo transition-colors flex items-center gap-1 font-medium"
                >
                  <span>Open Source Repo</span>
                  <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* ========================================================
          FOOTER BOTTOM STRIP (Full-Width Divider & Developer Credit)
         ======================================================== */}
      <div className="border-t border-slate-200/90 bg-slate-100/70 py-6 pb-28 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-600 sm:pr-40">
          
          {/* Left: Copyright */}
          <div className="flex items-center gap-2">
            <span className="font-medium">&copy; 2026 UNNATI. All rights reserved.</span>
          </div>

          {/* Centre: Tasteful Developer Credit (Designed & Developed by Part Ahuja) */}
          <div className="flex items-center gap-1.5 font-medium text-slate-700 bg-white/90 border border-slate-200 px-3.5 py-1.5 rounded-full shadow-soft-sm">
            <span className="text-slate-500">Designed &amp; Developed by</span>
            <span className="font-bold text-unnati-indigo">Part Ahuja</span>
          </div>

          {/* Right: Legal & Compliance Links */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 font-medium">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>DPDP Act (India 2026) Compliant</span>
            </div>
            <Link href="/privacy" className="hover:text-unnati-indigo transition-colors">
              Privacy Policy
            </Link>
            <Link href="/privacy" className="hover:text-unnati-indigo transition-colors">
              Terms of Use
            </Link>
            <Link href="/#faq" className="hover:text-unnati-indigo transition-colors">
              FAQs
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};
