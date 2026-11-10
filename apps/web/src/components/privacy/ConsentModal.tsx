"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-violet-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div className="flex items-center space-x-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-900 text-white font-bold text-sm">
              उ
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {lang === "en" ? "Data Protection & Privacy Notice" : "डेटा सुरक्षा एवं गोपनीयता सूचना"}
              </h2>
              <p className="text-xs text-gray-500">
                DPDP Act (India) 2025 & EU AI Act Formative Guidance Compliance
              </p>
            </div>
          </div>
          {/* Language Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-semibold">
            <button
              onClick={() => setLang("en")}
              className={`rounded-md px-2.5 py-1 transition ${lang === "en" ? "bg-white text-violet-900 shadow-sm" : "text-gray-600 hover:text-black"}`}
            >
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`rounded-md px-2.5 py-1 transition ${lang === "hi" ? "bg-white text-violet-900 shadow-sm" : "text-gray-600 hover:text-black"}`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-4 space-y-4 text-sm text-gray-700 leading-relaxed">
          {lang === "en" ? (
            <>
              <p>
                Welcome to <strong>UNNATI (उन्नति)</strong> — <em>Your Growth Companion</em>. Pursuant to Section 5 of the Digital Personal Data Protection (DPDP) Act, India, we provide you with this prior notice regarding how your data is handled:
              </p>
              <div className="rounded-xl bg-violet-50/60 p-3.5 border border-violet-100/80 space-y-2 text-xs text-gray-800">
                <p><strong>🎯 Specified Purpose:</strong> Your academic records, resume, and skills are processed strictly for formative career guidance, skill evaluation diagnostics, and topological roadmap generation. We do <em>not</em> sell or rent your personal data to third-party brokers.</p>
                <p><strong>🛡️ 72-Hour Right-to-Erasure:</strong> You retain the statutory right to withdraw consent or request complete erasure of your profile and uploaded resumes at any time. When requested, all files are permanently crypto-shredded from private storage.</p>
                <p><strong>⏳ 2-Year Retention:</strong> Inactive candidate accounts are retained for a rolling period of 2 years from last activity before automated archiving.</p>
                <p><strong>⚖️ Grievance Redressal:</strong> Grievance Redressal Officer (GRO) reachable at <span className="text-violet-900 font-mono font-medium">gro@unnati.dev</span> (24h acknowledgement SLA, 15-day statutory resolution).</p>
              </div>
            </>
          ) : (
            <>
              <p>
                <strong>UNNATI (उन्नति)</strong> में आपका स्वागत है। डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम, भारत की धारा 5 के अनुसार, हम आपके व्यक्तिगत डेटा के उपयोग के संबंध में यह स्पष्ट पूर्व-सूचना प्रदान करते हैं:
              </p>
              <div className="rounded-xl bg-violet-50/60 p-3.5 border border-violet-100/80 space-y-2 text-xs text-gray-800">
                <p><strong>🎯 निर्दिष्ट उद्देश्य:</strong> आपके शैक्षणिक विवरण, रिज्यूमे और कौशलों का उपयोग केवल करियर मार्गदर्शन, कौशल विश्लेषण और व्यक्तिगत अध्ययन रोडमैप तैयार करने के लिए किया जाता है। हम आपका डेटा किसी भी तीसरे पक्ष को नहीं बेचते हैं।</p>
                <p><strong>🛡️ 72-घंटे में डेटा मिटाने का अधिकार:</strong> आपको किसी भी समय अपनी सहमति वापस लेने और अपना खाता व अपलोड किए गए दस्तावेज़ पूर्णतः हटाने का कानूनी अधिकार है। अनुरोध पर सभी फाइलें सुरक्षित रूप से स्थायी रूप से हटा दी जाती हैं।</p>
                <p><strong>⏳ 2-वर्षीय डेटा अवधि:</strong> 2 वर्ष तक निष्क्रिय रहने वाले खातों को स्वचालित रूप से संग्रहीत अथवा सुरक्षित रूप से हटा दिया जाता है।</p>
                <p><strong>⚖️ शिकायत निवारण अधिकारी (GRO):</strong> आप शिकायत हेतु <span className="text-violet-900 font-mono font-medium">gro@unnati.dev</span> पर संपर्क कर सकते हैं (24 घंटे में प्राप्ति सूचना, 15 दिनों में समाधान)।</p>
              </div>
            </>
          )}

          {/* Consent Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={purposeConsent}
                onChange={(e) => setPurposeConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-800 focus:ring-violet-700"
              />
              <span className="text-xs text-gray-800">
                {lang === "en"
                  ? "I hereby grant explicit, affirmative consent to UNNATI to process my academic, resume, and skill data solely for formative career roadmap and skill gap evaluation."
                  : "मैं एतद्द्वारा UNNATI को केवल करियर रोडमैप और कौशल मूल्यांकन के लिए मेरे शैक्षणिक और रिज्यूमे डेटा को संसाधित करने हेतु स्पष्ट सहमति देता/देती हूँ।"}
              </span>
            </label>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={ageAffirmation}
                onChange={(e) => setAgeAffirmation(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-800 focus:ring-violet-700"
              />
              <span className="text-xs text-gray-800">
                {lang === "en"
                  ? "I confirm that I am at least 18 years of age (or registering under lawful guardian supervision) and acknowledge my statutory right to withdraw consent at any time."
                  : "मैं पुष्टि करता/करती हूँ कि मेरी आयु कम से कम 18 वर्ष है (अथवा अभिभावक के मार्गदर्शन में पंजीकृत हूँ) तथा अपनी सहमति कभी भी वापस लेने के अधिकार से अवगत हूँ।"}
              </span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <Link
            href="/privacy"
            target="_blank"
            className="text-xs text-violet-800 hover:text-violet-950 underline font-medium"
          >
            {lang === "en" ? "Read Full Privacy Policy & Rights →" : "पूर्ण गोपनीयता नीति पढ़ें →"}
          </Link>

          <button
            onClick={handleAccept}
            disabled={!purposeConsent || !ageAffirmation}
            className={`rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition ${
              purposeConsent && ageAffirmation
                ? "bg-gradient-to-r from-violet-900 to-violet-700 hover:from-violet-800 hover:to-violet-600 shadow-md shadow-violet-900/20"
                : "bg-gray-300 cursor-not-allowed text-gray-500"
            }`}
          >
            {lang === "en" ? "Confirm & Proceed" : "सहमति दें और आगे बढ़ें"}
          </button>
        </div>
      </div>
    </div>
  );
}
