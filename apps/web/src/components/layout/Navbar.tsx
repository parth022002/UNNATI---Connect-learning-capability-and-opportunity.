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
  ShieldCheck
} from "lucide-react";

interface NavbarProps {
  onOpenCompanion?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCompanion }) => {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/roadmap", label: "My Roadmap", icon: MapPin },
    { href: "/explore", label: "Explore Roles", icon: Compass },
    { href: "/assessments", label: "Skills Quiz", icon: FileCheck2 },
  ];

  const isActive = (href: string) => {
    return pathname === href || (href !== "/" && pathname?.startsWith(href));
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-900 to-slate-900 p-1.5 shadow-md ring-1 ring-white/20 transition-all duration-300 group-hover:ring-purple-400/50 group-hover:shadow-glow-violet">
              <Image 
                src="/logo.png" 
                alt="UNNATI Logo" 
                width={32} 
                height={32} 
                className="object-contain" 
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center font-heading text-lg font-extrabold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                UNNATI
                <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-unnati-saffron animate-pulse" />
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                Your Growth Companion
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-white/10">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    active
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30 shadow-xs"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${active ? "text-unnati-saffron" : "text-slate-400"}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* AI Career Companion Trigger */}
          <button
            onClick={onOpenCompanion}
            className="group relative hidden sm:flex items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-200 shadow-sm backdrop-blur-md transition-all hover:border-purple-400 hover:bg-purple-900/60 hover:shadow-glow-violet cursor-pointer"
            title="Open AI Career Companion"
          >
            <Sparkles className="h-3.5 w-3.5 text-unnati-saffron animate-pulse" />
            <span>Ask UNNATI AI</span>
            <span className="rounded-full bg-unnati-saffron/20 px-1.5 py-0.2 text-[9px] font-bold text-unnati-saffron">
              Live
            </span>
          </button>

          {/* User Authentication Status */}
          {isLoaded && isSignedIn ? (
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8 ring-2 ring-purple-500/40 hover:ring-purple-400 transition-all",
                    userButtonPopoverCard: "bg-slate-900 border border-white/10 text-white shadow-2xl backdrop-blur-xl"
                  }
                }}
              />
            </div>
          ) : isLoaded && !isSignedIn ? (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/onboarding">
                <Button variant="saffron" size="sm" className="btn-shimmer text-xs py-1.5 px-3.5">
                  Get Started
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="h-8 w-16 bg-white/5 rounded-xl animate-pulse" />
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/95 px-4 pt-3 pb-5 backdrop-blur-2xl">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                    active
                      ? "bg-purple-600/20 text-purple-200 border border-purple-500/30"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 text-purple-400" />
                  {link.label}
                </Link>
              );
            })}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCompanion?.();
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl border border-purple-500/30 bg-purple-950/40 text-purple-200 text-sm font-medium mt-2"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-unnati-saffron" />
                <span>Ask UNNATI AI Companion</span>
              </div>
              <span className="text-[10px] bg-unnati-saffron/20 text-unnati-saffron px-2 py-0.5 rounded-full font-bold">
                Online
              </span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
