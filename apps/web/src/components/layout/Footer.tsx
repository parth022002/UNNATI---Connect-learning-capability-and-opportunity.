"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, MessageSquare, ArrowUpRight, Mail } from "lucide-react";

export const Footer: React.FC = () => {
  const handleOpenCompanion = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
  };

  return (
    <footer className="border-t border-slate-200/90 bg-white text-slate-700 relative z-10">
      {/* Main Footer Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-18 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand & Mission Column (Prominent 56px Logo Lockup) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100/90 via-white to-orange-50/80 p-1.5 border-2 border-purple-200/90 shadow-soft-md group-hover:border-unnati-violet group-hover:shadow-glow-violet transition-all">
                <Image 
                  src="/logo.png" 
                  alt="UNNATI Official Logo" 
                  width={52} 
                  height={52} 
                  className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105" 
                  priority
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-heading text-2xl font-black text-unnati-indigo tracking-tight group-hover:text-unnati-violet transition-colors">
                    UNNATI
                  </span>
                  <span className="text-[13px] font-bold text-purple-700 font-sans">
                    (उन्नति)
                  </span>
                  <span className="h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  Your Growth Companion
                </span>
              </div>
            </Link>

            <p className="text-[14px] text-slate-600 leading-relaxed max-w-sm font-normal">
              UNNATI is an AI-powered career growth companion connecting education, capability, and industry opportunity. We diagnose skill gaps, generate structured 3-phase roadmaps, and verify practical readiness across Business, Technology, Finance, Design, and Analytics.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-4 py-1.5 text-xs font-bold text-unnati-indigo shadow-soft-sm">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
              <span>Learn. Build. Grow. Succeed.</span>
            </div>

            <div className="pt-1 text-xs text-slate-500 flex items-center gap-2 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Non-high-risk formative self-development platform.</span>
            </div>
          </div>

          {/* Navigation Column 1: Explore & Learn */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore &amp; Learn
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
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
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
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
                  className="text-left text-slate-600 hover:text-unnati-indigo transition-colors font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="h-4 w-4 text-unnati-saffron" />
                  <span>AI Career Companion</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: For Learners */}
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              For Learners
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
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
          <div className="lg:col-span-2 space-y-3.5">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Trust &amp; Legal
            </h4>
            <ul className="space-y-2.5 text-[14px] font-medium">
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
                  <span>Open Source Repo</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </li>
              <li>
                <a href="mailto:grievance@unnati.in" className="text-slate-600 hover:text-unnati-indigo transition-colors flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-purple-600" />
                  <span>Contact Support</span>
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Copyright, Ethics, Compliance (with generous clearance padding for chatbot) */}
      <div className="border-t border-slate-100 bg-slate-50/90 py-6 pb-28 sm:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 sm:pr-36">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} UNNATI (उन्नति). All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
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
