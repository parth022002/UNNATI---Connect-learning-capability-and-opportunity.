"use client";

import React, { useState, useEffect } from "react";
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
  Layers
} from "lucide-react";

interface NavbarProps {
  onOpenCompanion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCompanion }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navbar elevation & frosted glass transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard accessibility: Escape key closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Authenticated navigation items
  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/roadmap", label: "My Roadmap", icon: MapPin },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills Check", icon: FileCheck2 },
    { href: "/#showcase", label: "Platform", icon: Layers },
  ];

  // Public visitor navigation items (Single-line, restrained, calm)
  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works", icon: Briefcase },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills Check", icon: FileCheck2 },
    { href: "/#showcase", label: "Platform", icon: Layers },
    { href: "/#faq", label: "FAQ", icon: HelpCircle },
  ];

  const currentLinks = isSignedIn ? authenticatedLinks : publicLinks;

  const isActive = (href: string) => {
    if (href.startsWith("/#")) return false;
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  };

  const handleOpenCompanion = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-unnati-companion"));
    }
    onOpenCompanion?.();
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-soft-md py-0" 
          : "bg-white/85 backdrop-blur-md border-b border-slate-200/60 shadow-soft-sm py-1"
      }`}
    >
      <div className="mx-auto flex h-[76px] sm:h-[82px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        
        {/* ========================================================
            GROUP A: BRAND IDENTITY (Strong Left Visual Anchor)
           ======================================================== */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl shrink-0 whitespace-nowrap"
          aria-label="UNNATI Home"
        >
          {/* Authentic Logo Mark Container (48–56px) */}
          <div className="relative flex h-11 w-11 sm:h-13 sm:w-13 md:h-14 md:w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100/90 via-white to-orange-50/80 p-1.5 border-2 border-purple-200/90 shadow-soft-md transition-all duration-300 group-hover:border-unnati-violet group-hover:shadow-glow-violet shrink-0">
            <Image 
              src="/logo.png" 
              alt="UNNATI Official Logo" 
              width={52} 
              height={52} 
              className="h-8 w-8 sm:h-10 sm:w-10 md:h-11 md:w-11 object-contain transition-transform duration-300 group-hover:scale-105" 
              priority
            />
          </div>

          {/* Wordmark Stack with High Readability */}
          <div className="flex flex-col shrink-0">
            <div className="flex items-center gap-1.5 sm:gap-2 leading-none whitespace-nowrap">
              <span className="font-heading text-xl sm:text-2xl lg:text-[25px] font-black tracking-tight text-unnati-indigo group-hover:text-unnati-violet transition-colors whitespace-nowrap">
                UNNATI
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-purple-700 font-sans tracking-normal whitespace-nowrap">
                (उन्नति)
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-unnati-saffron animate-pulse shrink-0" />
            </div>
            <span className="hidden xs:block text-[10px] sm:text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-0.5 sm:mt-1 whitespace-nowrap">
              Your Growth Companion
            </span>
          </div>
        </Link>

        {/* ========================================================
            GROUP B: PRIMARY NAVIGATION (Single-Line Text Enforced)
           ======================================================== */}
        <nav 
          className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 whitespace-nowrap"
          aria-label="Main Navigation"
        >
          {currentLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-1.5 xl:gap-2 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-[13px] xl:text-[14px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet ${
                  active
                    ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                    : "text-slate-600 hover:text-unnati-indigo hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 transition-colors ${active ? "text-unnati-saffron" : "text-slate-400 group-hover:text-unnati-indigo"}`} />
                <span className="whitespace-nowrap shrink-0">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ========================================================
            GROUP C: ACCOUNT & CONVERSION ACTIONS (Single-Line Enforced)
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0 whitespace-nowrap">
          
          {/* Distinctive Secondary Action: AI Career Mentor Trigger */}
          <button
            onClick={handleOpenCompanion}
            className="group relative hidden xl:flex items-center gap-2 rounded-xl border border-purple-200/90 bg-purple-50/90 hover:bg-purple-100 px-3 py-1.5 text-xs xl:text-[13px] font-bold text-unnati-indigo shadow-soft-sm hover:border-purple-300 transition-all cursor-pointer h-10 xl:h-11 shrink-0 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet"
            title="Open 24/7 AI Career Mentor"
            aria-label="Open AI Career Mentor"
          >
            <Sparkles className="h-3.5 w-3.5 text-unnati-saffron animate-pulse shrink-0" />
            <span className="whitespace-nowrap shrink-0">Ask AI Mentor</span>
            <span className="rounded-full bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-800 tracking-wide shrink-0">
              24/7
            </span>
          </button>

          {/* User Authentication Status */}
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 shrink-0">
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
            <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
              {/* Quiet Sign In Link */}
              <Link href="/sign-in" className="hidden sm:inline-flex shrink-0">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs sm:text-[13px] font-bold text-slate-600 hover:text-slate-900 h-10 px-3 shrink-0 whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">Sign In</span>
                </Button>
              </Link>
              
              {/* Prominent Primary Conversion Button (Saffron Accent) */}
              <Link href="/onboarding" className="hidden sm:inline-flex shrink-0">
                <Button 
                  variant="saffron" 
                  size="sm" 
                  className="btn-shimmer text-xs sm:text-[13px] py-2 px-3.5 sm:px-4 xl:px-5 shadow-soft-md font-bold whitespace-nowrap shrink-0 h-10 xl:h-11 rounded-xl shadow-glow-saffron text-white"
                >
                  <span className="whitespace-nowrap">Start Journey</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 hidden xs:inline shrink-0" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:block h-10 w-24 bg-slate-100 rounded-xl animate-pulse shrink-0" />
          )}

          {/* Mobile & Tablet Menu Toggle Button (Touch target >= 48px, active on < lg) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex lg:hidden p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet min-h-[48px] min-w-[48px] items-center justify-center cursor-pointer shrink-0"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          MOBILE & TABLET NAVIGATION DRAWER (Full Overlay, Accessible)
         ======================================================== */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-x-0 top-[76px] sm:top-[82px] bg-slate-900/40 backdrop-blur-sm z-40 h-[calc(100vh-76px)] sm:h-[calc(100vh-82px)] overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white border-b border-slate-200 px-5 pt-5 pb-8 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav Links Stack */}
            <div className="flex flex-col space-y-1.5">
              {currentLinks.map((link) => {
                const active = isActive(link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold min-h-[48px] transition-all ${
                      active
                        ? "bg-purple-50 text-unnati-indigo border border-purple-200 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-unnati-violet shrink-0" />
                    <span className="whitespace-nowrap">{link.label}</span>
                  </Link>
                );
              })}
              {/* Additional Deep Route Links in Mobile Drawer */}
              <Link
                href="/#showcase"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[15px] font-semibold min-h-[48px] text-slate-700 hover:bg-slate-50 transition-all"
              >
                <Layers className="h-5 w-5 text-unnati-violet shrink-0" />
                <span className="whitespace-nowrap">Platform Tour</span>
              </Link>
            </div>

            {/* Mobile AI Mentor Trigger */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenCompanion();
              }}
              className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl border-2 border-purple-200 bg-gradient-to-r from-purple-50 via-white to-orange-50/50 text-unnati-indigo text-sm font-bold min-h-[48px] shadow-soft-sm cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-unnati-saffron animate-pulse" />
                <span>Ask UNNATI AI Mentor</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </button>

            {/* Mobile Auth & CTA Row */}
            {!isSignedIn && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button 
                    variant="saffron" 
                    className="w-full justify-center text-sm font-bold py-3.5 rounded-2xl shadow-glow-saffron btn-shimmer"
                  >
                    <span>Start Free Journey</span>
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </Link>
                <Link
                  href="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-sm font-bold py-3 rounded-2xl text-slate-700"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
