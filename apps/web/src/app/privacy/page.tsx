"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Lock, Mail, FileCheck2, Database, KeyRound, CheckCircle2 } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      {/* Hero Header */}
      <section className="relative z-10 border-b border-slate-200 bg-white/70 backdrop-blur-xl py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <Badge variant="violet" className="text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
            Statutory Compliance Baseline
          </Badge>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy &amp; Data Protection Notice
          </h1>
          <p className="text-sm sm:text-base text-slate-700 max-w-2xl mx-auto leading-relaxed">
            Governed under the Digital Personal Data Protection (DPDP) Act, 2025/2026 (India) and EU AI Act Formative Mentorship Framework.
          </p>
          <div className="text-xs text-purple-900 font-semibold pt-2">
            Last Updated &amp; Verified: November 10, 2026 | Version 2.0 (Production Verified)
          </div>
        </div>
      </section>

      {/* Content Container */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 text-xs sm:text-sm leading-relaxed">
        
        {/* Section 1 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">01.</span> Executive Statement &amp; Formative Purpose
          </h2>
          <p className="text-slate-700">
            <strong>UNNATI (उन्नति) — Your Growth Companion</strong> is dedicated to bridging the critical gap between academic learning and industry capability through objective talent intelligence.
          </p>
          <p className="text-slate-700">
            Under the <strong>Digital Personal Data Protection (DPDP) Act (India)</strong> and international privacy standards, UNNATI operates exclusively as a <em>Data Fiduciary</em> for the specified purpose of <strong>formative, non-high-risk career self-development</strong>. UNNATI does not serve as an automated recruitment screening or exclusionary hiring filter under Annex III of the EU AI Act; our algorithms are strictly designed to empower learners with transparent skill diagnostics and personalized milestone roadmaps.
          </p>
        </section>

        {/* Section 2 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">02.</span> Personal Data Collected &amp; Processing Scope
          </h2>
          <p className="text-slate-700">
            Pursuant to the principle of <em>Data Minimisation</em>, UNNATI collects only information strictly necessary to provide career diagnostics:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>Authentication Identity:</strong> Candidate name, verified email address, and external auth tokens managed securely via Clerk OIDC.</li>
            <li><strong>Academic &amp; Work Background:</strong> Institutions attended, degree programs, field of study, graduation year, and self-reported work/project experience.</li>
            <li><strong>Candidate Documents:</strong> Uploaded resumes and academic transcripts provided directly by the learner for skills extraction via Gemini 2.5 Flash.</li>
            <li><strong>Skill Evidence Ledger:</strong> Claimed, inferred, and verified competencies mapped against canonical industry taxonomies (O*NET &amp; ESCO).</li>
          </ul>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-xs text-orange-950 mt-2 font-medium">
            <strong>Zero Commercialization Guarantee:</strong> UNNATI does not sell, license, lease, or monetize candidate personal information to third-party advertisers, data aggregators, or external recruiters.
          </div>
        </section>

        {/* Section 3 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">03.</span> Statutory Rights of the Candidate (Data Principal)
          </h2>
          <p className="text-slate-700">
            Under Chapter III of the DPDP Act, you are endowed with enforceable statutory rights:
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-xs mb-1">Right to Access (Section 11)</h3>
              <p className="text-[11px] text-slate-600">Access a complete summary of your personal data, verified skills, and roadmap milestones at any time via your dashboard.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-xs mb-1">Right to Correction (Section 12)</h3>
              <p className="text-[11px] text-slate-600">Freely update or correct misattributed skills, inaccurate education history, or parsed resume information.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-xs mb-1">Right to Erasure (Section 12)</h3>
              <p className="text-[11px] text-slate-600">Request total erasure of your candidate profile. All private documents are permanently crypto-shredded within 72 hours.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-xs mb-1">Right to Grievance (Section 13)</h3>
              <p className="text-[11px] text-slate-600">Directly contact our Grievance Redressal Officer with guaranteed statutory acknowledgement within 24 hours.</p>
            </div>
          </div>
        </section>

        {/* Section 4 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-3">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">04.</span> Data Retention &amp; 72-Hour Crypto-Shredding Protocol
          </h2>
          <div className="space-y-3 text-slate-700">
            <p>
              <strong>Rolling 2-Year Retention:</strong> Candidate profiles and skill records are maintained for an active rolling period of <strong>twenty-four (24) months</strong> from the candidate’s last login or roadmap activity.
            </p>
            <p>
              <strong>Automated Account Purge:</strong> Accounts inactive for over 730 continuous days are scheduled for automated archiving and cryptographic sanitization.
            </p>
            <p>
              <strong>72-Hour Crypto-Shredding Protocol:</strong> When a candidate deletes their account via the platform:
            </p>
            <ol className="list-decimal pl-5 space-y-1.5 text-xs text-slate-600">
              <li>All candidate resumes and transcripts in Cloudflare R2 object storage are immediately and permanently deleted via S3 lifecycle APIs.</li>
              <li>User identity rows, education records, and experience entries in Neon PostgreSQL are cascade-deleted under Row-Level Security rules.</li>
              <li>A cryptographic audit receipt confirming data destruction is logged in immutable records without retaining candidate PII.</li>
            </ol>
          </div>
        </section>

        {/* Section 5 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">05.</span> Grievance Redressal Officer (GRO) &amp; Redressal Mechanism
          </h2>
          <p className="text-slate-700">
            In accordance with Section 8(10) of the DPDP Act and Rule 3(2) of the Information Technology Rules, UNNATI has appointed a designated Grievance Redressal Officer:
          </p>
          <div className="rounded-2xl bg-purple-50 p-5 border border-purple-200 text-xs">
            <div className="grid sm:grid-cols-2 gap-4 text-slate-800">
              <div>
                <span className="text-slate-500 font-semibold text-[11px]">Designation:</span>
                <p className="font-bold text-slate-900">Grievance Redressal Officer (GRO)</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[11px]">Department:</span>
                <p className="font-bold text-slate-900">UNNATI Trust, Ethics &amp; Compliance Office</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[11px]">Official Redressal Email:</span>
                <p className="font-bold text-purple-900 font-mono">privacy@unnati.example</p>
              </div>
              <div>
                <span className="text-slate-500 font-semibold text-[11px]">Statutory SLA:</span>
                <p className="font-bold text-slate-900">24-hour Acknowledgement | 15-day Resolution</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            If you are dissatisfied with our internal redressal, you retain the statutory right to escalate complaints to the <strong>Data Protection Board of India (DPBI)</strong>.
          </p>
        </section>

        {/* Section 6 */}
        <section className="clean-card p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <span className="text-orange-600 font-mono">06.</span> Technical Security &amp; Infrastructure Safeguards
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-purple-700" /> Transport Security
              </div>
              <p className="text-slate-600 text-[11px]">TLS 1.3 encryption enforced across all API communications and web interfaces.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-purple-700" /> Zero Public Buckets
              </div>
              <p className="text-slate-600 text-[11px]">All candidate resumes are isolated in Cloudflare R2 private buckets with presigned URL access.</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Rate Limiting
              </div>
              <p className="text-slate-600 text-[11px]">Sliding-window Upstash Redis limits (60/min IP, 120/min user) prevent automated scraping.</p>
            </div>
          </div>
        </section>

      </main>

      <Footer />

      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}
