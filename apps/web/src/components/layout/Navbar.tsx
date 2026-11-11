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
  Layers,
  Award
} from "lucide-react";

interface NavbarProps {
  onOpenCompanion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCompanion }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { href: "/examinations", label: "Examinations", icon: Award },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills Check", icon: FileCheck2 },
  ];

  // Public visitor navigation items (Preserved items: How It Works, Career Pathways, Skills Check, FAQ)
  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works", icon: Briefcase },
    { href: "/explore", label: "Career Pathways", icon: Compass },
    { href: "/assessments", label: "Skills Check", icon: FileCheck2 },
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
    <header className="relative z-30 w-full brand-surface-bookend border-b border-slate-200/80 shadow-soft-sm">
      <div className="mx-auto flex h-[72px] sm:h-[76px] max-w-7xl items-center justify-between px-3.5 sm:px-6 lg:px-8">
        
        {/* ========================================================
            GROUP A: BRAND IDENTITY (Strong Left Visual Anchor)
           ======================================================== */}
        <Link 
          href="/" 
          className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet rounded-2xl shrink-0 whitespace-nowrap min-w-[155px]"
          aria-label="UNNATI Home"
        >
          {/* Authentic Logo Mark Container (Shared Brand Token) */}
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

          {/* Wordmark Stack with High Readability */}
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
            GROUP B: PRIMARY NAVIGATION (Single-Line Text Enforced, Clutter-Free)
           ======================================================== */}
        <nav 
          className="hidden lg:flex items-center gap-1 xl:gap-2 shrink-0 whitespace-nowrap"
          aria-label="Main Navigation"
        >
          {currentLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`px-3 xl:px-4 py-2 rounded-xl text-[14px] xl:text-[14.5px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-unnati-violet ${
                  active
                    ? "bg-purple-100/90 text-unnati-indigo border border-purple-200 shadow-soft-sm font-bold"
                    : "text-slate-700 hover:text-unnati-indigo hover:bg-purple-50/80"
                }`}
              >
                <span className="whitespace-nowrap shrink-0">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* ========================================================
            GROUP C: ACCOUNT & CONVERSION ACTIONS (Sign In + Get Started)
           ======================================================== */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3 shrink-0 whitespace-nowrap">
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
                  className="text-xs sm:text-[13px] font-bold text-slate-600 hover:text-slate-900 h-9.5 px-3.5 shrink-0 whitespace-nowrap"
                >
                  <span className="whitespace-nowrap">Sign In</span>
                </Button>
              </Link>
              
              {/* Prominent Primary Conversion Button (Saffron Accent: Get Started) */}
              <Link href="/onboarding" className="hidden sm:inline-flex shrink-0">
                <Button 
                  variant="saffron" 
                  size="sm" 
                  className="btn-shimmer text-xs sm:text-[13px] py-2 px-3.5 sm:px-4 xl:px-5 shadow-soft-md font-bold whitespace-nowrap shrink-0 h-9.5 xl:h-10 rounded-xl shadow-glow-saffron text-white"
                >
                  <span className="whitespace-nowrap">Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 hidden xs:inline shrink-0" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="hidden sm:block h-9.5 w-24 bg-slate-100 rounded-xl animate-pulse shrink-0" />
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

      {/* Shared Brand Accent Line (Border Boundary between Header and Main Body) */}
      <div className="brand-accent-line w-full" />

      {/* ========================================================
          MOBILE & TABLET NAVIGATION DRAWER (Full Overlay, Accessible)
         ======================================================== */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-x-0 top-[72px] sm:top-[76px] bg-slate-900/40 backdrop-blur-sm z-40 h-[calc(100vh-72px)] sm:h-[calc(100vh-76px)] overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="bg-white border-b border-slate-200 px-5 pt-5 pb-8 shadow-2xl space-y-4 animate-in slide-in-from-top-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Nav Links Stack (How It Works, Career Pathways, Skills Check, FAQ) */}
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
            </div>

            {/* Mobile Auth & CTA Row (Sign In + Get Started) */}
            {!isSignedIn && (
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full"
                >
                  <Button 
                    variant="saffron" 
                    className="w-full justify-center text-sm font-bold py-3.5 rounded-2xl shadow-glow-saffron btn-shimmer text-white"
                  >
                    <span>Get Started</span>
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
                    className="w-full justify-center text-sm font-bold py-3 rounded-2xl text-slate-700 hover:bg-slate-50"
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
