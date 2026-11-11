"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, ExamCertificateData } from "@/lib/api";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Share2,
  RefreshCw,
  Lock,
  ExternalLink
} from "lucide-react";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certNumber = params.certificateNumber as string;

  const [cert, setCert] = useState<ExamCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCert() {
      if (!certNumber) return;
      setLoading(true);
      setError(null);
      try {
        const data = await api.verifyCertificate(certNumber);
        setCert(data);
      } catch (err: any) {
        setError(err.message || "Certificate could not be verified.");
      } finally {
        setLoading(false);
      }
    }
    loadCert();
  }, [certNumber]);

  const handleCopy = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere variant="explore" />
      <Navbar />

      <main className="relative z-10 flex-1 py-12 sm:py-16 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full space-y-6">

          <Link href="/examinations" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Examination Hub</span>
          </Link>

          {loading ? (
            <Card className="p-12 text-center bg-white border border-slate-200 space-y-3">
              <RefreshCw className="h-8 w-8 text-unnati-indigo animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-600">Verifying cryptographic credential hash...</p>
            </Card>
          ) : error || !cert ? (
            <Card className="p-10 text-center bg-white border border-rose-200 space-y-4">
              <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
              <p className="text-sm text-slate-500">{error || "This certificate credential is invalid or has expired."}</p>
              <Link href="/examinations">
                <Button variant="outline" size="sm">Browse Verified Programs</Button>
              </Link>
            </Card>
          ) : (
            <div className="rounded-3xl bg-white border-2 border-amber-200/90 shadow-soft-xl overflow-hidden text-center relative">
              {/* Decorative Accent Ribbon */}
              <div className="h-3 bg-gradient-to-r from-unnati-indigo via-unnati-saffron to-unnati-indigo w-full" />

              <div className="p-8 sm:p-12 space-y-6">
                {/* Brand Logo & Verification Pill */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <Image src="/logo.png" alt="UNNATI" width={32} height={32} className="object-contain" priority />
                    <span className="font-heading text-lg font-black text-unnati-indigo">UNNATI</span>
                  </div>

                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Cryptographically Verified</span>
                  </span>
                </div>

                {/* Certificate Title & Recipient */}
                <div className="space-y-2 py-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    This certifies that
                  </span>
                  <h1 className="font-heading text-3xl sm:text-4xl font-black text-slate-900">
                    {cert.recipient_name}
                  </h1>
                  <span className="text-xs text-slate-500 block pt-1">
                    has successfully satisfied all rigorous competency requirements for
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-unnati-indigo mt-2">
                    {cert.title}
                  </h2>
                  <p className="text-xs font-bold text-unnati-saffron">
                    {cert.course_name}
                  </p>
                </div>

                {/* Score & Issue Details */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Verified Score</span>
                    <span className="font-heading text-xl font-black text-emerald-600 mt-0.5 block">
                      {cert.score_percentage}% Pass
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Issuance</span>
                    <span className="font-bold text-slate-800 text-sm mt-1 block">
                      {new Date(cert.issued_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Hash */}
                <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-left font-mono text-[10.5px] text-slate-600 break-all space-y-1">
                  <span className="font-bold text-unnati-indigo block uppercase tracking-wider text-[9.5px]">
                    Tamper-Evident SHA-256 Credential Hash:
                  </span>
                  <span>{cert.credential_hash}</span>
                </div>

                {/* Share Button */}
                <div className="pt-4 flex items-center justify-center gap-3">
                  <Button
                    variant="saffron"
                    size="sm"
                    onClick={handleCopy}
                    className="font-bold text-xs h-10 px-6 rounded-xl text-white shadow-glow-saffron"
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1.5" />
                    <span>{copied ? "Link Copied!" : "Share Credential"}</span>
                  </Button>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
