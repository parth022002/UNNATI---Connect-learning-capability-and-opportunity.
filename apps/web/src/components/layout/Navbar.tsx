"use client";

import React, { useState } from "react";
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
  Briefcase
} from "lucide-react";

interface NavbarProps {
  onOpenCompanion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCompanion }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Authenticated navigation items
  const authenticatedLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/roadmap", label: "My Roadmap", icon: MapPin },
    { href: "/explore", label: "Explore Careers", icon: Compass },
    { href: "/assessments", label: "Skill Checks", icon: FileCheck2 },
  ];

  // Public visitor navigation items
  const publicLinks = [
    { href: "/#how-it-works", label: "How It Works", icon: Briefcase },
    { href: "/#showcase", label: "Showcase", icon: LayoutDashboard },
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
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/90 bg-white/90 backdrop-blur-md shadow-soft-sm transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Wordmark (Large, High Visibility) */}
        <Link href="/" className="group flex items-center gap-2.5 sm:gap-3.5 focus:outline-none shrink-0">
          <div className="relative flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100 to-orange-50 p-1 border-2 border-purple-200/80 shadow-soft-md transition-all duration-300 group-hover:border-unnati-violet group-hover:shadow-glow-violet shrink-0">
            <Image 
              src="/logo.png" 
              alt="UNNATI Official Logo" 
              width={44} 
              height={44} 
              className="h-8 w-8 sm:h-10 sm:w-10 object-contain" 
              priority
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-unnati-indigo group-hover:text-unnati-violet transition-colors">
                UNNATI
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-purple-700 font-sans">
                (उन्नति)
              </span>
              <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-unnati-saffron animate-pulse" />
            </div>
            <span className="text-[9px] sm:text-[11px] font-semibold tracking-wide text-slate-500 uppercase mt-0.5">
              Your Growth Companion
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 pl-4">
          {currentLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-purple-100 text-unnati-indigo border border-purple-200 shadow-soft-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? "text-unnati-saffron" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* AI Career Mentor Trigger */}
          <button
            onClick={handleOpenCompanion}
            className="group relative hidden sm:flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/80 px-3.5 py-2 text-xs font-bold text-unnati-indigo shadow-soft-sm hover:border-purple-300 hover:bg-purple-100 transition-all cursor-pointer"
            title="Open AI Career Mentor"
          >
            <Sparkles className="h-4 w-4 text-unnati-saffron" />
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
                    userButtonAvatarBox: "h-9 w-9 ring-2 ring-purple-300 hover:ring-purple-500 transition-all",
                    userButtonPopoverCard: "bg-white border border-slate-200 text-slate-900 shadow-2xl"
                  }
                }}
              />
            </div>
          ) : isLoaded && !isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs font-bold">
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="saffron" size="sm" className="btn-shimmer text-xs py-2 px-3 sm:px-4 shadow-soft-sm font-bold whitespace-nowrap">
                  <span>Start Journey</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1 hidden xs:inline" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-9 w-20 bg-slate-100 rounded-xl animate-pulse" />
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/95 px-5 pt-3 pb-6 shadow-xl">
          <div className="flex flex-col space-y-2">
            {currentLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                    active
                      ? "bg-purple-50 text-unnati-indigo border border-purple-200"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4 text-unnati-violet" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleOpenCompanion();
              }}
              className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-purple-200 bg-purple-50 text-unnati-indigo text-sm font-bold mt-2"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-unnati-saffron" />
                <span>Ask UNNATI AI Mentor</span>
              </div>
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
