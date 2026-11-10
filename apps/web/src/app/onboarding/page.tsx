"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { 
  Compass, 
  GraduationCap, 
  Briefcase, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Search,
  Plus,
  X,
  Clock,
  Target,
  Palette,
  PieChart,
  Code2,
  TrendingUp,
  Building2
} from "lucide-react";
import { api, getClerkApiToken, CanonicalSkill } from "@/lib/api";

const PERSONAS = [
  {
    id: "student",
    title: "Student / Graduate",
    subtitle: "Undergraduate, Postgraduate, or Fresher",
    description: "Explore career paths across disciplines, understand market readiness, build real projects, and secure top placements.",
    icon: GraduationCap,
  },
  {
    id: "early_career",
    title: "Early-Career Professional",
    subtitle: "0 – 2 years in industry",
    description: "Accelerate your career trajectory, bridge real-world skill gaps, and transition to higher-impact roles.",
    icon: Briefcase,
  },
  {
    id: "working_pro",
    title: "Working Professional",
    subtitle: "3+ years experience",
    description: "Upskill in strategic domains (Product, Management, Analytics, AI, Cloud), lead initiatives, or earn advanced credentials.",
    icon: Compass,
  },
  {
    id: "career_switcher",
    title: "Career Switcher",
    subtitle: "Transitioning disciplines",
    description: "Map your transferable skills, pinpoint prerequisite bridges, and pivot confidently into a new high-growth career.",
    icon: Sparkles,
  },
];

const TARGET_ROLES = [
  "Associate Product Manager (APM)",
  "Business & Data Analyst",
  "Financial Analyst & Valuation Associate",
  "Product & UI/UX Designer",
  "Operations & Project Lead",
  "Marketing & Growth Strategist",
  "Full-Stack Software Engineer",
  "Generative AI & Machine Learning Engineer",
  "Cloud & Infrastructure Engineer",
];

const POPULAR_SKILLS = [
  { name: "Product Roadmapping", category: "management" },
  { name: "Data Analysis (SQL)", category: "data" },
  { name: "Financial Modeling (Excel)", category: "finance" },
  { name: "UI/UX & Figma", category: "design" },
  { name: "Agile & Scrum", category: "management" },
  { name: "Business Communication", category: "core" },
  { name: "Python", category: "language" },
  { name: "React / Next.js", category: "frontend" },
  { name: "Process Optimization (Lean)", category: "operations" },
  { name: "Digital Marketing & Growth", category: "marketing" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [selectedPersona, setSelectedPersona] = useState("student");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [customTargetRole, setCustomTargetRole] = useState("");
  const [headline, setHeadline] = useState("");
  const [location, setLocation] = useState("");

  const [institutionName, setInstitutionName] = useState("");
  const [degree, setDegree] = useState("B.Tech / B.E.");
  const [fieldOfStudy, setFieldOfStudy] = useState("Computer Science & Engineering");
  const [gradYear, setGradYear] = useState<number>(2025);

  const [selectedSkills, setSelectedSkills] = useState<Array<{ name: string; category: string; proficiency: number }>>([
    { name: "Product Roadmapping", category: "management", proficiency: 0.6 },
    { name: "Data Analysis (SQL)", category: "data", proficiency: 0.6 },
  ]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [canonicalResults, setCanonicalResults] = useState<CanonicalSkill[]>([]);

  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState(10);
  const [primaryGoal, setPrimaryGoal] = useState("Land a high-growth job or placement in my chosen domain");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const personaParam = params.get("persona");
      if (personaParam) {
        if (personaParam === "student") setSelectedPersona("student");
        else if (personaParam === "graduate") setSelectedPersona("student");
        else if (personaParam === "professional") setSelectedPersona("working_pro");
        else if (personaParam === "switcher") setSelectedPersona("career_switcher");
      }
    }
  }, []);

  useEffect(() => {
    if (user?.fullName && !headline) {
      setHeadline(`Aspiring ${targetRole}`);
    }
  }, [user, targetRole, headline]);

  useEffect(() => {
    if (skillSearchQuery.trim().length > 1) {
      api.searchCanonicalSkills(skillSearchQuery)
        .then((skills) => setCanonicalResults(skills))
        .catch(() => setCanonicalResults([]));
    } else {
      setCanonicalResults([]);
    }
  }, [skillSearchQuery]);

  const toggleSkill = (skillName: string, category: string = "general") => {
    if (selectedSkills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) {
      setSelectedSkills(selectedSkills.filter((s) => s.name.toLowerCase() !== skillName.toLowerCase()));
    } else {
      setSelectedSkills([...selectedSkills, { name: skillName, category, proficiency: 0.6 }]);
    }
  };

  const updateSkillProficiency = (skillName: string, proficiency: number) => {
    setSelectedSkills(
      selectedSkills.map((s) => (s.name === skillName ? { ...s, proficiency } : s))
    );
  };

  const handleComplete = async () => {
    if (!isSignedIn) {
      setError("Please sign in to complete onboarding.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getClerkApiToken(getToken);
      if (!token) {
        throw new Error("Unable to retrieve authorization token. Please sign in again.");
      }

      const finalTargetRole = customTargetRole.trim() || targetRole;

      await api.syncUser(token, selectedPersona);

      await api.updateProfile(token, {
        headline: headline.trim() || `Aspiring ${finalTargetRole}`,
        target_role: finalTargetRole,
        location: location.trim() || "India",
        bio: `${selectedPersona.toUpperCase()} actively preparing for ${finalTargetRole} opportunities through UNNATI.`,
      });

      if (institutionName.trim()) {
        await api.addEducation(token, {
          institution_name: institutionName.trim(),
          degree: degree.trim(),
          field_of_study: fieldOfStudy.trim(),
          start_year: gradYear - 4,
          end_year: gradYear,
        });
      }

      for (const sk of selectedSkills) {
        await api.claimSkill(token, {
          skill_name: sk.name,
          category: sk.category,
          proficiency: sk.proficiency,
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setError(err.message || "Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-warm-pattern text-slate-900">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-800 border-t-transparent shadow-md" />
          <p className="text-sm font-semibold text-purple-900">Preparing Onboarding Journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-warm-pattern text-slate-900 flex flex-col font-sans selection:bg-purple-200 selection:text-purple-900">
      <BackgroundAtmosphere />

      {/* Header with High-Visibility Logo */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="group flex items-center gap-3.5 focus:outline-none">
            <div className="relative flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-100/90 via-white to-orange-50/80 p-1.5 border-2 border-purple-200/90 shadow-soft-md transition-all duration-300 group-hover:border-unnati-violet">
              <Image 
                src="/logo.png" 
                alt="UNNATI" 
                width={52} 
                height={52} 
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105" 
                priority 
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2 leading-none">
                <span className="font-heading text-2xl font-black tracking-tight text-unnati-indigo group-hover:text-unnati-violet transition-colors">
                  UNNATI
                </span>
                <span className="text-[13px] font-bold text-purple-700 font-sans">
                  (उन्नति)
                </span>
                <span className="inline-block h-2 w-2 rounded-full bg-unnati-saffron animate-pulse" />
              </div>
              <span className="text-[11px] font-bold tracking-wider text-slate-500 uppercase mt-1">
                Your Growth Companion
              </span>
            </div>
          </Link>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-purple-900">
              Step {step} of 5
            </span>
            <div className="w-28 h-2 rounded-full bg-slate-200 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-800 to-orange-500 transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-900 shadow-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Persona Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2 font-semibold">
                Step 1: Profile Classification
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Which describes you best?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                UNNATI personalizes your learning journey, skill assessments, and career recommendations based on your background.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p.id)}
                    className={`flex flex-col text-left rounded-3xl border p-5 transition-all cursor-pointer shadow-sm ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/80 ring-2 ring-purple-600/20"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isSelected ? "bg-purple-900 text-white" : "bg-purple-100 text-purple-800"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                    </div>
                    <h3 className="font-heading font-bold text-slate-900 text-base">{p.title}</h3>
                    <p className="text-[11px] font-semibold text-orange-600 mt-0.5">{p.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Career Direction & Target Role */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2 font-semibold">
                Step 2: Target Direction
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                What is your target career direction?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Choose the role you want to pursue. We will map your prerequisite gaps and build your personalized milestone roadmap.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Select Target Role</label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setCustomTargetRole("");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm ${
                      targetRole === role && !customTargetRole
                        ? "border-purple-600 bg-purple-50 text-purple-950 font-bold ring-2 ring-purple-600/20"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Or enter a custom role title</label>
                <input
                  type="text"
                  placeholder="e.g. MLOps Engineer, Brand Manager, Quantitative Analyst"
                  value={customTargetRole}
                  onChange={(e) => setCustomTargetRole(e.target.value)}
                  className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Professional Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Aspiring Product Manager"
                    className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, Mumbai, Delhi or Remote"
                    className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Academic Background */}
        {step === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2 font-semibold">
                Step 3: Background
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Tell us about your education
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Helps us calibrate foundation topics and align with university curriculum standards.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl clean-card p-6 sm:p-7">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">College / University Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Delhi University, IIT, BITS, Mumbai University"
                  className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 bg-white"
                  >
                    <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                    <option value="B.Com / BBA">B.Com / BBA</option>
                    <option value="B.A. / B.Sc">B.A. / B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="MBA / PGDM">MBA / PGDM</option>
                    <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                    <option value="MCA / M.Sc">MCA / M.Sc</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Management, Commerce, Computer Science, Economics"
                    className="w-full rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Graduation Year</label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full sm:w-1/2 rounded-xl clean-input px-4 py-2.5 text-xs text-slate-900 bg-white"
                >
                  {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Skills Inventory */}
        {step === 4 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2 font-semibold">
                Step 4: Skill Mapping
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Select your existing capabilities
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Claim what you currently know. These will form your baseline inventory for personalized gap diagnostics.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills (e.g. Product Strategy, SQL, Financial Modeling, Python)..."
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl clean-input text-slate-900 placeholder:text-slate-400"
              />
              {canonicalResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  {canonicalResults.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        toggleSkill(skill.name, skill.category);
                        setSkillSearchQuery("");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-slate-50 text-slate-800"
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="text-[10px] text-slate-500">{skill.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Suggested Skills Quick-Pills */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">Suggested Skills Across Domains</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((item) => {
                  const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleSkill(item.name, item.category)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-purple-900 text-white"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Skills List with Proficiency */}
            {selectedSkills.length > 0 && (
              <div className="rounded-3xl clean-card p-5">
                <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                  Selected Capabilities ({selectedSkills.length}) — Rate your proficiency:
                </h3>
                <div className="space-y-3">
                  {selectedSkills.map((sk) => (
                    <div key={sk.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSkill(sk.name)}
                          className="text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-semibold text-slate-900 text-xs">{sk.name}</span>
                        <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] uppercase font-bold text-slate-500">
                          {sk.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px]">
                        {[
                          { label: "Beginner", val: 0.3 },
                          { label: "Intermediate", val: 0.6 },
                          { label: "Advanced", val: 0.85 },
                        ].map((tier) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => updateSkillProficiency(sk.name, tier.val)}
                            className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer ${
                              Math.abs(sk.proficiency - tier.val) < 0.1
                                ? "bg-purple-900 text-white shadow-sm"
                                : "bg-slate-100 text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {tier.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Commitment & Goals */}
        {step === 5 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2 font-semibold">
                Step 5: Goals &amp; Pace
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Set your commitment pace
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed">
                UNNATI calibrates roadmap milestones and weekly targets to match your available study hours.
              </p>
            </div>

            <div className="space-y-5 rounded-3xl clean-card p-6 sm:p-7">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-700" />
                  Weekly Time Commitment
                </label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { hrs: 5, label: "Casual (5 hrs/wk)", desc: "~45 min/day" },
                    { hrs: 10, label: "Standard (10 hrs/wk)", desc: "~1.5 hrs/day" },
                    { hrs: 20, label: "Intensive (20 hrs/wk)", desc: "~3 hrs/day" },
                  ].map((tier) => (
                    <button
                      key={tier.hrs}
                      type="button"
                      onClick={() => setWeeklyCommitmentHours(tier.hrs)}
                      className={`rounded-2xl border p-4 text-left transition cursor-pointer shadow-sm ${
                        weeklyCommitmentHours === tier.hrs
                          ? "border-purple-600 bg-purple-50 text-slate-900 font-bold ring-2 ring-purple-600/20"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900">{tier.label}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-600" />
                  Primary Milestone Objective
                </label>
                <div className="space-y-2">
                  {[
                    "Land a high-growth job or placement in my chosen domain",
                    "Build a verified portfolio of real-world projects and case studies",
                    "Accelerate career growth or transition into a high-demand discipline",
                    "Close key skill gaps through guided, step-by-step milestones",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm font-semibold transition cursor-pointer shadow-sm ${
                        primaryGoal === goal
                          ? "border-orange-500 bg-orange-50 text-orange-950 font-bold ring-2 ring-orange-500/20"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
              className="text-xs font-semibold"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
          ) : (
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800">
              Cancel
            </Link>
          )}

          {step < 5 ? (
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(step + 1)}
              className="text-xs font-bold"
            >
              Next Step <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="saffron"
              size="lg"
              disabled={loading}
              onClick={handleComplete}
              className="btn-shimmer text-xs font-bold shadow-md"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Synthesizing Roadmap...
                </>
              ) : (
                <>
                  Complete &amp; Launch Dashboard
                  <Sparkles className="h-3.5 w-3.5 ml-1.5" />
                </>
              )}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
