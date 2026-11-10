"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Lock, MessageSquare, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  const handleOpenCompanion = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700 relative z-10">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Mission Column (56px Logo) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-50 p-1.5 border-2 border-purple-200/80 shadow-soft-md group-hover:border-unnati-violet transition-all">
                <Image 
                  src="/logo.png" 
                  alt="UNNATI Official Logo" 
                  width={52} 
                  height={52} 
                  className="object-contain" 
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-2xl font-black text-unnati-indigo tracking-tight">
                    UNNATI
                  </span>
                  <span className="text-sm font-semibold text-purple-700 font-sans">
                    (उन्नति)
                  </span>
                  <span className="h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Your Growth Companion
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              UNNATI is an AI-powered career growth companion connecting education, capability, and industry opportunity. We diagnose skill gaps, generate structured 3-phase roadmaps, and verify practical readiness across Business, Technology, Finance, Design, and Analytics.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-3.5 py-1 text-xs font-bold text-unnati-indigo">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
              <span>Learn. Build. Grow. Succeed.</span>
            </div>

            <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Non-high-risk formative self-development platform.</span>
            </div>
          </div>

          {/* Navigation Column 1: Explore & Features */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore &amp; Learn
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Career Pathways (20+)
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Role Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/assessments" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Diagnostic Skill Checks
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Personalized Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Platform Tour */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/#how-it-works" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Continuous Journey
                </Link>
              </li>
              <li>
                <Link href="/#showcase" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Product Showcase
                </Link>
              </li>
              <li>
                <Link href="/#diagnostic" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Interactive Diagnostic
                </Link>
              </li>
              <li>
                <Link href="/#audiences" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Audience Pathways
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleOpenCompanion} 
                  className="text-left text-slate-600 hover:text-unnati-indigo transition-colors font-medium flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-unnati-saffron" />
                  <span>AI Career Companion</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Audiences */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              For Learners
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/onboarding?persona=student" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Students &amp; Freshers
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=graduate" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Recent Graduates
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=professional" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Working Professionals
                </Link>
              </li>
              <li>
                <Link href="/onboarding?persona=switcher" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Career Switchers
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Multi-Disciplinary Catalog
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 4: Trust & Support */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Privacy Policy (DPDP)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Grievance Officer (GRO)
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  72-Hour Data Erasure
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <a 
                  href="https://github.com/parth022002/UNNATI---Connect-learning-capability-and-opportunity." 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-slate-600 hover:text-unnati-indigo transition-colors flex items-center gap-1 font-medium"
                >
                  <span>Open Source Repository</span>
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              </li>
              <li>
                <a href="mailto:grievance@unnati.in" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Copyright, Ethics, Compliance (with extra right padding to prevent chatbot overlap) */}
      <div className="border-t border-slate-100 bg-slate-50 py-6 pb-24 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 sm:pr-32">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} UNNATI (उन्नति). All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>DPDP Act (India 2026) Compliant</span>
            </div>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Terms &amp; Ethics
            </Link>
            <Link href="/#faq" className="hover:text-slate-900 transition-colors">
              FAQs
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
