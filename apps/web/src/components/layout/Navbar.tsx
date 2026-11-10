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
      setIsScrolled(window.scrollY > 20);
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
    { href: "/explore", label: "Explore Careers", icon: Compass },
    { href: "/assessments", label: "Skill Checks", icon: FileCheck2 },
  ];

  // Public visitor navigation items (Target destinations)
  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works", icon: Briefcase },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills Check", icon: FileCheck2 },
    { href: "/#showcase", label: "Showcase", icon: Layers },
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
          ? "bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-soft-md" 
          : "bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-soft-sm"
      }`}
    >
      <div className="mx-auto flex h-[76px] sm:h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================
            LEFT: BRAND GROUP (Logo, Wordmark, Tagline)
           ======================================================== */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 sm:gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl shrink-0"
          aria-label="UNNATI Home"
        >
          {/* Logo Mark Container (Crisp 48–52px) */}
          <div className="relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-50 p-1 border-2 border-purple-200/85 shadow-soft-md transition-all duration-300 group-hover:border-unnati-violet group-hover:shadow-glow-violet shrink-0">
            <Image 
              src="/logo.png" 
              alt="UNNATI Official Logo" 
              width={46} 
              height={46} 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain" 
              priority
            />
          </div>

          {/* Wordmark Stack */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-unnati-indigo group-hover:text-unnati-violet transition-colors">
                UNNATI
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-purple-700 font-sans">
                (उन्नति)
              </span>
              <span className="inline-block h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-wide text-slate-500 uppercase mt-0.5">
              Your Growth Companion
            </span>
          </div>
        </Link>

        {/* ========================================================
            CENTRE: PRIMARY NAVIGATION (Consistent Typography & Spacing)
           ======================================================== */}
        <nav 
          className="hidden md:flex items-center gap-2 lg:gap-3 pl-2"
          aria-label="Main Navigation"
        >
          {currentLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-2 px-3 lg:px-3.5 py-2 rounded-xl text-[14px] lg:text-[15px] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet ${
                  active
                    ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? "text-unnati-saffron" : "text-slate-400 group-hover:text-slate-600"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ========================================================
            RIGHT: ACCOUNT & CONVERSION ACTIONS
           ======================================================== */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* AI Career Mentor Trigger */}
          <button
            onClick={handleOpenCompanion}
            className="group relative hidden sm:flex items-center gap-2 rounded-xl border border-purple-200/90 bg-purple-50/90 px-3.5 py-2 text-xs sm:text-sm font-bold text-unnati-indigo shadow-soft-sm hover:border-purple-300 hover:bg-purple-100 transition-all cursor-pointer h-10 sm:h-11 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet"
            title="Open 24/7 AI Career Mentor"
            aria-label="Open AI Career Mentor"
          >
            <Sparkles className="h-4 w-4 text-unnati-saffron animate-pulse" />
            <span>Ask AI Mentor</span>
            <span className="rounded-full bg-orange-100 border border-orange-200 px-1.5 py-0.2 text-[10px] font-bold text-orange-800">
              Free
            </span>
          </button>

          {/* User Authentication Status */}
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
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
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden sm:inline-flex text-xs sm:text-sm font-bold h-10 sm:h-11 px-3.5"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button 
                  variant="saffron" 
                  size="sm" 
                  className="btn-shimmer text-xs sm:text-sm py-2 px-3.5 sm:px-5 shadow-soft-md font-bold whitespace-nowrap h-10 sm:h-11 shadow-glow-saffron"
                >
                  <span>Start Journey</span>
                  <ArrowRight className="h-4 w-4 ml-1.5 hidden xs:inline" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-10 w-24 bg-slate-100 rounded-xl animate-pulse" />
          )}

          {/* Mobile Menu Toggle Button (Touch target >= 44px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2.5 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet min-h-[44px] min-w-[44px] items-center justify-center cursor-pointer"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ========================================================
          MOBILE NAVIGATION DRAWER (Full Overlay, Accessible)
         ======================================================== */}
      {mobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-x-0 top-[76px] bg-slate-900/40 backdrop-blur-sm z-40 h-[calc(100vh-76px)] overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white border-b border-slate-200 px-5 pt-4 pb-8 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-300"
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
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold min-h-[48px] transition-all ${
                      active
                        ? "bg-purple-50 text-unnati-indigo border border-purple-200 font-bold"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 text-unnati-violet shrink-0" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
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
