"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Sparkles, Heart, Globe, ArrowUpRight } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-700">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Mission Column (Large 56px Logo) */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-50 p-1.5 border-2 border-purple-200/80 shadow-soft-md">
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
                  <span className="text-sm font-semibold text-slate-400 font-sans">
                    (उन्नति)
                  </span>
                  <span className="h-2 w-2 rounded-full bg-unnati-saffron" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Your Growth Companion
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-600 leading-relaxed max-w-sm">
              UNNATI connects learning, capability, and real-world opportunity. Discover your direction, identify your skill gaps, and follow a personalised roadmap to the career you want.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200/80 px-4 py-1.5 text-xs font-bold text-unnati-indigo">
              <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" />
              <span>Learn. Build. Grow. Succeed.</span>
            </div>

            <div className="pt-2 text-xs text-slate-500">
              <p>Non-high-risk formative career mentorship platform.</p>
            </div>
          </div>

          {/* Navigation Column 1: Explore */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Explore
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Career Pathways
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Role Benchmarks
                </Link>
              </li>
              <li>
                <Link href="/assessments" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Skill Checks
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Learning Roadmaps
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Skills Inventory
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Platform */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm font-medium">
              <li>
                <Link href="/#how-it-works" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  How UNNATI Works
                </Link>
              </li>
              <li>
                <Link href="/#features" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Features &amp; Tools
                </Link>
              </li>
              <li>
                <Link href="/#audiences" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Who It Helps
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Data Protection &amp; Ethics
                </Link>
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
                <Link href="/onboarding" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  College Students
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Recent Graduates
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Working Professionals
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Career Switchers
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Multi-Disciplinary Tracks
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
                <a href="mailto:support@unnati.example" className="text-slate-600 hover:text-unnati-indigo transition-colors">
                  Contact Team
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Sub-Footer: Copyright, Ethics, Compliance */}
      <div className="border-t border-slate-100 bg-slate-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} UNNATI (उन्नति). All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>DPDP Act (India 2026) Compliant</span>
            </div>
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              Privacy Policy
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

