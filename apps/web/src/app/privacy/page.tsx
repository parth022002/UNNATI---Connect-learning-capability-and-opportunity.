import React from "react";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navbar */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-900 text-white font-extrabold text-lg">
              उ
            </span>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              UNNATI <span className="text-sm font-normal text-slate-500">(उन्नति)</span>
            </span>
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-violet-800 hover:text-violet-950 px-3.5 py-1.5 rounded-lg border border-violet-200 hover:bg-violet-50 transition"
          >
            ← Back to App
          </Link>
        </div>
      </header>

      {/* Hero Header */}
      <section className="bg-gradient-to-b from-violet-900 to-violet-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-800/80 border border-violet-700 text-xs font-medium text-violet-200">
            <span>🛡️</span> Statutory Compliance Baseline
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Privacy Policy & Data Protection Notice
          </h1>
          <p className="text-sm sm:text-base text-violet-200 max-w-2xl mx-auto">
            Governed under the Digital Personal Data Protection (DPDP) Act (India) and EU AI Act Formative Mentorship Framework.
          </p>
          <div className="text-xs text-violet-300 pt-2">
            Last Updated & Verified: November 10, 2026 | Version 2.0 (Production Verified)
          </div>
        </div>
      </section>

      {/* Content Container */}
      <main className="max-w-4xl mx-auto px-4 py-12 space-y-10 text-sm leading-relaxed">
        {/* Executive Statement */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            1. Executive Statement & Formative Purpose
          </h2>
          <p>
            <strong>UNNATI (उन्नति) — Your Growth Companion</strong> is dedicated to bridging the critical gap between academic learning and industry capability through objective talent intelligence.
          </p>
          <p>
            Under the <strong>Digital Personal Data Protection (DPDP) Act (India)</strong> and international privacy standards, UNNATI operates exclusively as a <em>Data Fiduciary</em> for the specified purpose of <strong>formative, non-high-risk career self-development</strong>. UNNATI does not serve as an automated recruitment screening or exclusionary hiring filter under Annex III of the EU AI Act; our algorithms (Algorithms A, B, and C) are strictly designed to empower learners with transparent skill diagnostics and personalized milestone roadmaps.
          </p>
        </section>

        {/* 2. Personal Data We Collect */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            2. Personal Data Collected & Processing Scope
          </h2>
          <p>
            Pursuant to the principle of <em>Data Minimisation</em>, UNNATI collects only the information strictly necessary to provide career diagnostics:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li><strong>Authentication Identity:</strong> Candidate name, verified email address, and external auth tokens managed securely via Clerk OIDC.</li>
            <li><strong>Academic & Work Background:</strong> Institutions attended, degree programs, field of study, graduation year, and self-reported work/project experience.</li>
            <li><strong>Candidate Documents:</strong> Uploaded resumes and academic transcripts provided directly by the learner for skills extraction.</li>
            <li><strong>Skill Evidence Ledger:</strong> Claimed, inferred, and verified competencies mapped against canonical industry taxonomies (O*NET & ESCO).</li>
          </ul>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900">
            <strong>⚠️ Zero Commercialization Guarantee:</strong> UNNATI does not sell, license, lease, or monetize candidate personal information to third-party advertisers, data aggregators, or unauthorized external recruiters.
          </div>
        </section>

        {/* 3. Statutory Candidate Rights */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            3. Statutory Rights of the Candidate (Data Principal)
          </h2>
          <p>
            Under Chapter III of the DPDP Act, you are endowed with enforceable statutory rights:
          </p>
          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Right to Access (Section 11)</h3>
              <p className="text-xs text-slate-600">Access a complete summary of your personal data, verified skills, and roadmap milestones at any time via your dashboard.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Right to Correction (Section 12)</h3>
              <p className="text-xs text-slate-600">Freely update or correct misattributed skills, inaccurate education history, or parsed resume information.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Right to Erasure (Section 12)</h3>
              <p className="text-xs text-slate-600">Request total erasure of your candidate profile. All private documents are permanently crypto-shredded within 72 hours.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-semibold text-slate-900 text-sm mb-1">Right to Grievance (Section 13)</h3>
              <p className="text-xs text-slate-600">Directly contact our Grievance Redressal Officer with guaranteed statutory acknowledgement within 24 hours.</p>
            </div>
          </div>
        </section>

        {/* 4. 72-Hour Crypto-Shredding & Retention */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. Data Retention Schedule & 72-Hour Crypto-Shredding
          </h2>
          <div className="space-y-3 text-slate-700">
            <p>
              <strong>Rolling 2-Year Retention:</strong> Candidate profiles and skill records are maintained for an active rolling period of <strong>twenty-four (24) months</strong> from the candidate’s last login or roadmap activity.
            </p>
            <p>
              <strong>Automated Account Purge:</strong> Accounts inactive for over 730 continuous days are scheduled for automated archiving and cryptographic sanitization.
            </p>
            <p>
              <strong>72-Hour Crypto-Shredding Protocol:</strong> When a candidate deletes their account via the platform or via Clerk:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600">
              <li>All candidate resumes and transcripts stored in Cloudflare R2 object storage are immediately and permanently deleted via S3 lifecycle APIs.</li>
              <li>User identity rows, education records, and experience entries in Neon PostgreSQL are cascade-deleted.</li>
              <li>A cryptographic audit receipt confirming data destruction is logged in immutable records without retaining candidate PII.</li>
            </ol>
          </div>
        </section>

        {/* 5. Grievance Redressal Mechanism */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            5. Grievance Redressal Officer (GRO) & Redressal Mechanism
          </h2>
          <p>
            In accordance with Section 8(10) of the DPDP Act and Rule 3(2) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, UNNATI has appointed a designated Grievance Redressal Officer:
          </p>
          <div className="rounded-xl bg-violet-50 p-5 border border-violet-100 space-y-2 text-xs">
            <div className="grid sm:grid-cols-2 gap-3 text-slate-800">
              <div>
                <span className="text-slate-500 font-medium">Designation:</span>
                <p className="font-semibold text-slate-900">Grievance Redressal Officer (GRO)</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Department:</span>
                <p className="font-semibold text-slate-900">UNNATI Trust, Ethics & Compliance Office</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Official Email:</span>
                <p className="font-semibold text-violet-900 font-mono">gro@unnati.dev</p>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Statutory SLA:</span>
                <p className="font-semibold text-slate-900">24-hour Acknowledgement | 15-day Resolution</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500">
            If you are dissatisfied with our internal redressal, you retain the statutory right to escalate complaints to the <strong>Data Protection Board of India (DPBI)</strong>.
          </p>
        </section>

        {/* 6. Security Baseline */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
            6. Technical Security & Infrastructure Safeguards
          </h2>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">🔐 Transport Encryption</div>
              TLS 1.3 encryption enforced across all API communications and web interfaces.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">🗄️ Zero Public Buckets</div>
              All candidate resumes are isolated in Cloudflare R2 private buckets with presigned URL access.
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="font-bold text-slate-900 mb-1">🛡️ Rate Limiting</div>
              Sliding-window rate limits (60/min IP, 120/min user) prevent automated credential stuffing.
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center text-xs text-slate-500">
        <p>&copy; 2026 UNNATI (उन्नति). All rights reserved. Built for ambitious learners.</p>
        <p className="mt-1 text-slate-400">Campaign: <em>Learn. Build. Grow. Succeed.</em></p>
      </footer>
    </div>
  );
}
