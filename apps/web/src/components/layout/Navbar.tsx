"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";
import { 
  Sparkles, 
  Compass, 
  MapPin, 
  LayoutDashboard, 
  FileCheck2, 
  Menu, 
  X, 
  ArrowRight, 
  HelpCircle, 
  Briefcase,
  Layers,
  Award,
  FileText,
  Video,
  ChevronDown,
  GraduationCap,
  Target,
  ExternalLink
} from "lucide-react";

interface NavbarProps {
  onOpenCompanion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCompanion }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveDropdown(null);
        if (mobileMenuOpen) setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, [pathname]);

  const handleOpenCompanion = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
    onOpenCompanion?.();
  };

  // Grouped SaaS Navigation Structure (Authenticated)
  const navGroups = [
    {
      id: "career",
      label: "Career",
      icon: Compass,
      isActive: pathname?.startsWith("/explore") || pathname?.startsWith("/roadmap"),
      items: [
        { href: "/explore", label: "Career Explorer", description: "Discover high-growth roles, market CTCs & emerging competencies", icon: Compass },
        { href: "/roadmap", label: "Career Roadmap", description: "Personalised milestone progression & skill gap bridges", icon: MapPin },
        { href: "/dashboard#skills", label: "Skills Inventory", description: "Bayesian calibrated competency matrix (Claimed to Verified)", icon: Target }
      ]
    },
    {
      id: "learn",
      label: "Learn",
      icon: GraduationCap,
      isActive: pathname?.startsWith("/assessments") || pathname?.startsWith("/examinations"),
      items: [
        { href: "/assessments", label: "Learning Hub & Assessments", description: "Curated Free & Paid courses, 4-stage pathways & diagnostic checks", icon: FileCheck2 },
        { href: "/examinations", label: "Formal Examinations", description: "AI-proctored formal examinations, certificates & capstone audits", icon: Award }
      ]
    },
    {
      id: "prepare",
      label: "Prepare",
      icon: Video,
      isActive: pathname?.startsWith("/interviews") || pathname?.startsWith("/resumes"),
      items: [
        { href: "/interviews", label: "AI Interview Studio", description: "Technical & HR realistic practice, STAR feedback & rubrics", icon: Video },
        { href: "/resumes", label: "AI Resume & ATS Studio", description: "Multi-template builder, ATS compatibility checks & JD matching", icon: FileText }
      ]
    }
  ];

  // Public visitor navigation links
  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works", icon: Briefcase },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills & Learning", icon: FileCheck2 },
    { href: "/jobs", label: "Job Discovery", icon: Briefcase },
    { href: "/#faq", label: "FAQ", icon: HelpCircle },
  ];

  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  };

  return (
    <header className="relative z-30 w-full brand-surface-bookend border-b border-slate-200/80 shadow-soft-sm">
      <div className="mx-auto flex h-[72px] sm:h-[76px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        
        {/* ========================================================
            GROUP A: BRAND IDENTITY
           ======================================================== */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl shrink-0 whitespace-nowrap min-w-[155px]"
          aria-label="UNNATI Home"
        >
          <div className="brand-logo-container relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl p-1 transition-all duration-300 group-hover:scale-105 shrink-0">
            <Image 
              src="/logo.png" 
              alt="UNNATI Official Logo" 
              width={36} 
              height={36} 
              className="h-7.5 w-7.5 sm:h-8.5 sm:w-8.5 object-contain transition-transform duration-300" 
              priority
            />
          </div>

          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 leading-none whitespace-nowrap">
              <span className="font-heading text-xl sm:text-[22px] lg:text-[23px] font-black tracking-tight text-unnati-indigo group-hover:text-unnati-violet transition-colors whitespace-nowrap">
                UNNATI
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-purple-700 font-sans tracking-normal whitespace-nowrap">
                (उन्नति)
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-unnati-saffron animate-pulse shrink-0" />
            </div>
            <span className="hidden xs:block text-[10px] sm:text-[10.5px] font-bold tracking-wider text-slate-500 uppercase mt-0.5 whitespace-nowrap">
              Your Growth Companion
            </span>
          </div>
        </Link>

        {/* ========================================================
            GROUP B: PRIMARY NAVIGATION (Authenticated vs Public)
           ======================================================== */}
        <div ref={navRef} className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
          {isLoaded && isSignedIn ? (
            /* Authenticated Grouped Navigation */
            <nav className="flex items-center gap-1" aria-label="Main Application Navigation">
              {/* 1. Dashboard (Direct) */}
              <Link
                href="/dashboard"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isLinkActive("/dashboard")
                    ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                    : "text-slate-700 hover:text-unnati-indigo hover:bg-purple-50/80"
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-purple-600" />
                <span>Dashboard</span>
              </Link>

              {/* 2. Grouped Dropdowns: Career, Learn, Prepare */}
              {navGroups.map((group) => {
                const isOpen = activeDropdown === group.id;
                const GroupIcon = group.icon;
                return (
                  <div key={group.id} className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : group.id)}
                      className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                        group.isActive || isOpen
                          ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                          : "text-slate-700 hover:text-unnati-indigo hover:bg-purple-50/80"
                      }`}
                      aria-expanded={isOpen}
                    >
                      <GroupIcon className="h-4 w-4 text-purple-600" />
                      <span>{group.label}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180 text-purple-600" : ""}`} />
                    </button>

                    {/* Popover Menu */}
                    {isOpen && (
                      <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-soft-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="space-y-1">
                          {group.items.map((item) => {
                            const ItemIcon = item.icon;
                            const isCurrent = pathname === item.href;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setActiveDropdown(null)}
                                className={`flex items-start gap-3 p-2.5 rounded-xl transition-colors ${
                                  isCurrent ? "bg-purple-50 text-unnati-indigo" : "hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <div className="p-2 rounded-lg bg-purple-100 text-unnati-indigo shrink-0 mt-0.5">
                                  <ItemIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                    {item.label}
                                    {isCurrent && <span className="h-1.5 w-1.5 rounded-full bg-unnati-indigo" />}
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                    {item.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 3. Opportunities / Jobs (Direct) */}
              <Link
                href="/jobs"
                className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isLinkActive("/jobs")
                    ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                    : "text-slate-700 hover:text-unnati-indigo hover:bg-purple-50/80"
                }`}
              >
                <Briefcase className="h-4 w-4 text-purple-600" />
                <span>Job Discovery</span>
              </Link>
            </nav>
          ) : (
            /* Public Visitor Links */
            <nav className="flex items-center gap-1 xl:gap-2" aria-label="Public Navigation">
              {publicLinks.map((link) => {
                const active = isLinkActive(link.href);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`px-3 xl:px-4 py-2 rounded-xl text-xs xl:text-[14px] font-semibold transition-all duration-200 ${
                      active
                        ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                        : "text-slate-700 hover:text-unnati-indigo hover:bg-purple-50/80"
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* ========================================================
            GROUP C: ACTIONS (AI Companion Pill + Auth Buttons)
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Ask AI Companion Button (Quick Drawer Launch) */}
          <button
            type="button"
            onClick={handleOpenCompanion}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-unnati-indigo to-unnati-violet hover:opacity-95 shadow-soft-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-400 group"
            title="Open UNNATI AI Career Companion"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse group-hover:rotate-12 transition-transform" />
            <span className="hidden sm:inline">AI Companion</span>
          </button>

          {/* User Auth Status */}
          {isLoaded && isSignedIn ? (
            <div className="flex items-center pl-1.5 sm:pl-2 border-l border-slate-200 shrink-0">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-9 w-9 sm:h-10 sm:w-10 ring-2 ring-purple-300 hover:ring-purple-500 transition-all",
                    userButtonPopoverCard: "bg-white border border-slate-200 text-slate-900 shadow-2xl"
                  }
                }}
              />
            </div>
          ) : isLoaded && !isSignedIn ? (
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/sign-in" className="hidden sm:inline-flex">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 h-9 px-3"
                >
                  Sign In
                </Button>
              </Link>
              
              <Link href="/onboarding" className="inline-flex">
                <Button 
                  variant="saffron" 
                  size="sm" 
                  className="text-xs py-1.5 px-3.5 sm:px-4 font-bold rounded-xl shadow-soft-md text-white h-9"
                >
                  <span>Start Free</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 hidden xs:inline" />
                </Button>
              </Link>
            </div>
          ) : null}

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-300 ml-1"
            aria-label="Toggle Mobile Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

      </div>

      {/* ========================================================
          MOBILE NAVIGATION SLIDE-OVER DRAWER
         ======================================================== */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-4 shadow-soft-xl animate-in fade-in slide-in-from-top-3 duration-200">
          {isLoaded && isSignedIn ? (
            <div className="space-y-4 text-xs">
              {/* Overview */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Overview</span>
                <div className="mt-1 space-y-0.5">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo"
                  >
                    <LayoutDashboard className="h-4 w-4 text-purple-600" />
                    Dashboard
                  </Link>
                </div>
              </div>

              {/* Career Group */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Career Intelligence</span>
                <div className="mt-1 space-y-0.5">
                  <Link href="/explore" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <Compass className="h-4 w-4 text-purple-600" /> Career Explorer
                  </Link>
                  <Link href="/roadmap" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <MapPin className="h-4 w-4 text-purple-600" /> Career Roadmap
                  </Link>
                </div>
              </div>

              {/* Learn & Assess Group */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Learn & Demonstrate</span>
                <div className="mt-1 space-y-0.5">
                  <Link href="/assessments" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <FileCheck2 className="h-4 w-4 text-purple-600" /> Learning Hub & Assessments
                  </Link>
                  <Link href="/examinations" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <Award className="h-4 w-4 text-purple-600" /> Formal Examinations
                  </Link>
                </div>
              </div>

              {/* Prepare Group */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Interview & Resume</span>
                <div className="mt-1 space-y-0.5">
                  <Link href="/interviews" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <Video className="h-4 w-4 text-purple-600" /> AI Interview Studio
                  </Link>
                  <Link href="/resumes" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <FileText className="h-4 w-4 text-purple-600" /> AI Resume Studio & ATS
                  </Link>
                </div>
              </div>

              {/* Opportunities */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2">Opportunities</span>
                <div className="mt-1 space-y-0.5">
                  <Link href="/jobs" className="flex items-center gap-2.5 p-2 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo">
                    <Briefcase className="h-4 w-4 text-purple-600" /> Job Discovery
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-xs">
              {publicLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-2 p-2.5 rounded-xl text-slate-800 font-semibold hover:bg-purple-50 hover:text-unnati-indigo"
                >
                  <link.icon className="h-4 w-4 text-purple-600" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <Link href="/sign-in" className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full text-xs font-bold">Sign In</Button>
                </Link>
                <Link href="/onboarding" className="flex-1">
                  <Button variant="saffron" size="sm" className="w-full text-xs font-bold text-white">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
