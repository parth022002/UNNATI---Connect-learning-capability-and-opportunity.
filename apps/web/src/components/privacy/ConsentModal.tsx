"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, CheckSquare, Square, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface ConsentModalProps {
  onConsentGiven?: () => void;
  forceShow?: boolean;
}

export default function ConsentModal({ onConsentGiven, forceShow = false }: ConsentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<"en" | "hi">("en");
  const [purposeConsent, setPurposeConsent] = useState(false);
  const [ageAffirmation, setAgeAffirmation] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setIsOpen(true);
      return;
    }
    const hasConsented = localStorage.getItem("unnati_dpdp_consent");
    if (!hasConsented) {
      setIsOpen(true);
    }
  }, [forceShow]);

  const handleAccept = () => {
    if (!purposeConsent || !ageAffirmation) return;
    localStorage.setItem("unnati_dpdp_consent", JSON.stringify({
      consentedAt: new Date().toISOString(),
      dpdpVersion: "2025.1",
      lang
    }));
    setIsOpen(false);
    if (onConsentGiven) onConsentGiven();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl bg-slate-950/95 border border-white/15 p-6 sm:p-7 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto text-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900/60 p-1.5 ring-1 ring-white/20">
              <Image src="/logo.png" alt="UNNATI" width={28} height={28} className="object-contain" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                  {lang === "en" ? "Data Protection & Privacy Notice" : "डेटा सुरक्षा एवं गोपनीयता सूचना"}
                </h2>
                <Badge variant="violet" className="text-[10px] py-0">DPDP 2026</Badge>
              </div>
              <p className="text-[11px] text-slate-400">
                Digital Personal Data Protection Act (India) &amp; EU AI Act Formative Guidance
              </p>
            </div>
          </div>

          {/* Language Toggle */}
          <div className="flex rounded-xl bg-white/5 border border-white/10 p-0.5 text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                lang === "en" ? "bg-purple-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                lang === "hi" ? "bg-purple-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Notice Body */}
        <div className="mt-4 space-y-3.5 text-xs text-slate-300 leading-relaxed">
          {lang === "en" ? (
            <>
              <p>
                Welcome to <strong>UNNATI (उन्नति) — Your Growth Companion</strong>. We respect your autonomy and privacy rights under the <em>Digital Personal Data Protection (DPDP) Act, 2025/2026 (India)</em>.
              </p>
              
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <h4 className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  Purpose-Specific Data Fiduciary Notice
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                  <li><strong>Formative Use Only:</strong> Data is utilized solely to compute skill gap diagnostics, generate learning roadmaps, and power formative mentoring.</li>
                  <li><strong>Non-Annex III Status:</strong> UNNATI does not perform automated employment filtering or punitive ranking.</li>
                  <li><strong>Cryptographic Shredding:</strong> You maintain the unconditional right to erasure. Profile deletions trigger automated 72-hour crypto-shredding across all Neon DB records and Cloudflare R2 files.</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400">
                Grievance Redressal Officer (GRO): <strong className="text-slate-300">privacy@unnati.example</strong> (72-hour statutory response window).
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>UNNATI (उन्नति) — आपके विकास का साथी</strong> में आपका स्वागत है। हम <em>डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, 2025/2026 (भारत)</em> के तहत आपकी स्वायत्तता और गोपनीयता का सम्मान करते हैं।
              </p>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                <h4 className="font-bold text-purple-200 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  उद्देश्य-विशिष्ट डेटा ट्रस्टी सूचना
                </h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                  <li><strong>केवल विकासात्मक उपयोग:</strong> आपका डेटा केवल कौशल अंतर विश्लेषण, शिक्षण रोडमैप निर्माण और करियर मार्गदर्शन हेतु प्रयुक्त होता है।</li>
                  <li><strong>गैर-दंडात्मक प्रणाली:</strong> UNNATI किसी भी प्रकार की स्वचालित भर्ती अस्वीकृति या रोजगार प्रतिबंध नहीं लगाता है।</li>
                  <li><strong>डेटा विलोपन का अधिकार:</strong> खाता हटाने पर 72 घंटों के भीतर आपके सभी डेटा और दस्तावेजों का क्रिप्टोग्राफ़िक विलोपन सुनिश्चित किया जाता है।</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400">
                शिकायत निवारण अधिकारी (GRO): <strong className="text-slate-300">privacy@unnati.example</strong> (72 घंटे में समाधान)।
              </p>
            </>
          )}
        </div>

        {/* Affirmations */}
        <div className="mt-5 space-y-2.5 pt-4 border-t border-white/10 text-xs">
          <label className="flex items-start gap-2.5 cursor-pointer group">
            <button
              type="button"
              onClick={() => setPurposeConsent(!purposeConsent)}
              className="mt-0.5 text-purple-400 hover:text-purple-300"
            >
              {purposeConsent ? (
                <CheckSquare className="h-4 w-4 text-emerald-400" />
              ) : (
                <Square className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <span className="text-slate-300 group-hover:text-white leading-snug">
              {lang === "en"
                ? "I consent to the collection and processing of my academic, resume, and skill data exclusively for formative growth guidance."
                : "मैं अपने शैक्षणिक, बायोडाटा और कौशल डेटा के विकासात्मक उपयोग हेतु सहमति देता/देती हूँ।"}
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer group">
            <button
              type="button"
              onClick={() => setAgeAffirmation(!ageAffirmation)}
              className="mt-0.5 text-purple-400 hover:text-purple-300"
            >
              {ageAffirmation ? (
                <CheckSquare className="h-4 w-4 text-emerald-400" />
              ) : (
                <Square className="h-4 w-4 text-slate-500" />
              )}
            </button>
            <span className="text-slate-300 group-hover:text-white leading-snug">
              {lang === "en"
                ? "I affirm that I am 18 years of age or older (or have verified parental/guardian authorization under DPDP Act provisions)."
                : "मैं पुष्टि करता/करती हूँ कि मेरी आयु 18 वर्ष या उससे अधिक है (या अभिभावक की अनुमति प्राप्त है)।"}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/10">
          <Link
            href="/privacy"
            onClick={() => setIsOpen(false)}
            className="text-[11px] text-purple-300 hover:text-purple-200 underline"
          >
            {lang === "en" ? "Read Complete DPDP Privacy Policy" : "संपूर्ण DPDP गोपनीयता नीति पढ़ें"}
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="saffron"
              size="md"
              disabled={!purposeConsent || !ageAffirmation}
              onClick={handleAccept}
              className="btn-shimmer w-full sm:w-auto text-xs font-bold"
            >
              {lang === "en" ? "Accept & Continue" : "स्वीकार करें और आगे बढ़ें"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
