import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col justify-between py-10 px-4 sm:px-6">
      <BackgroundAtmosphere />

      {/* Top Brand Nav */}
      <div className="relative z-10 mx-auto max-w-md w-full flex items-center justify-between mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Link>
        <span className="text-[11px] font-semibold text-purple-900">
          Learn. Build. Grow. Succeed.
        </span>
      </div>

      {/* Center Auth Card with Prominent Logo */}
      <div className="relative z-10 mx-auto max-w-md w-full flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100/90 via-white to-orange-50/80 p-1.5 border-2 border-purple-200/90 shadow-soft-md mb-3">
            <Image 
              src="/logo.png" 
              alt="UNNATI" 
              width={52} 
              height={52} 
              className="h-10 w-10 object-contain" 
              priority 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-2xl font-black tracking-tight text-unnati-indigo">
              UNNATI
            </span>
            <span className="text-[13px] font-bold text-purple-700 font-sans">
              (उन्नति)
            </span>
            <span className="h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
            Your Growth Companion
          </p>
        </div>

        <div className="w-full flex justify-center">
          <Suspense fallback={<div className="h-96 w-full animate-pulse rounded-3xl bg-white/60" />}>
            <SignIn 
              appearance={{
                elements: {
                  card: "rounded-3xl shadow-xl border border-slate-200 bg-white",
                  headerTitle: "font-heading font-black text-slate-900",
                  headerSubtitle: "text-xs text-slate-500",
                  socialButtonsBlockButton: "rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold",
                  formButtonPrimary: "rounded-xl bg-purple-900 hover:bg-purple-950 text-xs font-bold py-2.5",
                  footerActionLink: "text-purple-800 hover:text-purple-950 font-bold",
                }
              }}
            />
          </Suspense>
        </div>
      </div>

      {/* Subtle Bottom Trust Notice */}
      <div className="relative z-10 mx-auto max-w-md w-full text-center text-[11px] text-slate-400 mt-8">
        Governed under DPDP Act 2025/2026. Zero automated candidate rejection.
      </div>
    </div>
  );
}
