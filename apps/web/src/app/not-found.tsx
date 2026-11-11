"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CountUpNumber, StaggerContainer, StaggerItem } from "@/components/motion";
import {
  Compass,
  Home,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Search,
  HelpCircle
} from "lucide-react";

export default function NotFound() {
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere variant="not-found" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl w-full text-center space-y-8 bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-xl shadow-purple-950/5">
          {/* Badge */}
          <div className="flex justify-center">
            <Badge variant="violet" className="text-xs font-semibold px-3 py-1">
              <Compass className="h-3.5 w-3.5 mr-1.5 text-purple-700 animate-spin-slow" />
              404 • Path Off-Course
            </Badge>
          </div>

          {/* Large Error Stat */}
          <div className="space-y-3">
            <div className="font-heading text-7xl sm:text-8xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-800 via-indigo-700 to-amber-600">
              <CountUpNumber value={404} durationMs={800} />
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Career Direction Not Found
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              Just like every meaningful career journey, unexpected turns happen. The page or resource you are looking for has been moved, renamed, or does not exist.
            </p>
          </div>

          {/* Primary Action Buttons */}
          <StaggerContainer delayStepMs={80} className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <StaggerItem index={0} direction="up" className="w-full sm:w-auto">
              <Link href="/" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto font-semibold shadow-md shadow-purple-900/10">
                  <Home className="h-4 w-4 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </StaggerItem>
            <StaggerItem index={1} direction="up" className="w-full sm:w-auto">
              <Link href="/explore" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold border-slate-300 hover:bg-slate-50">
                  <Compass className="h-4 w-4 mr-2 text-purple-700" />
                  Explore Career Pathways
                </Button>
              </Link>
            </StaggerItem>
          </StaggerContainer>

          {/* Quick Shortcuts */}
          <div className="pt-6 border-t border-slate-200/80 text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center sm:text-left">
              Popular Destinations &amp; Tools:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <Link
                href="/assessments"
                className="group p-3 rounded-xl border border-slate-200/70 bg-white/50 hover:bg-white hover:border-purple-300 hover:shadow-sm transition-all text-xs font-medium text-slate-700 hover:text-purple-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <FileCheck2 className="h-4 w-4 text-purple-600" />
                  Skills Assessment
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-purple-600 transition-all" />
              </Link>
              <Link
                href="/onboarding"
                className="group p-3 rounded-xl border border-slate-200/70 bg-white/50 hover:bg-white hover:border-amber-300 hover:shadow-sm transition-all text-xs font-medium text-slate-700 hover:text-amber-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  Career Diagnostic
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-amber-600 transition-all" />
              </Link>
              <Link
                href="/privacy"
                className="group p-3 rounded-xl border border-slate-200/70 bg-white/50 hover:bg-white hover:border-emerald-300 hover:shadow-sm transition-all text-xs font-medium text-slate-700 hover:text-emerald-900 flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-600" />
                  Trust &amp; Privacy
                </span>
                <ArrowRight className="h-3 w-3 text-slate-400 group-hover:translate-x-0.5 group-hover:text-emerald-600 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <CareerCompanionDrawer
        isOpen={isCompanionOpen}
        onClose={() => setIsCompanionOpen(false)}
      />
    </div>
  );
}

