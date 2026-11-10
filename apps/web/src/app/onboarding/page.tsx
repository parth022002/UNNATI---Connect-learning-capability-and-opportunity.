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
  Target
} from "lucide-react";
import { api, getClerkApiToken, CanonicalSkill } from "@/lib/api";

const PERSONAS = [
  {
    id: "student",
    title: "Student / Graduate",
    subtitle: "Undergraduate, Postgraduate, or Fresher",
    description: "Explore career paths, understand market readiness, build real-world projects, and secure top-tier placements.",
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
    description: "Upskill in cutting-edge technologies (AI, Cloud, System Architecture), lead teams, or earn advanced credentials.",
    icon: Compass,
  },
  {
    id: "career_switcher",
    title: "Career Switcher",
    subtitle: "Transitioning disciplines",
    description: "Map your transferable skills, pinpoint prerequisite bridges, and pivot confidently into tech or data engineering.",
    icon: Sparkles,
  },
];

const TARGET_ROLES = [
  "Senior Full-Stack Engineer",
  "Generative AI & Agentic Systems Engineer",
  "Modern Data Platform Engineer",
  "Cloud & Platform Infrastructure Engineer",
  "Cloud Security & DevSecOps Specialist",
  "Cross-Platform Mobile Engineer",
];

const POPULAR_SKILLS = [
  { name: "Python", category: "language" },
  { name: "JavaScript", category: "language" },
  { name: "TypeScript", category: "language" },
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "FastAPI", category: "backend" },
  { name: "PostgreSQL", category: "database" },
  { name: "Docker", category: "devops" },
  { name: "Data Structures & Algorithms", category: "core" },
  { name: "System Design", category: "core" },
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
    { name: "Python", category: "language", proficiency: 0.6 },
    { name: "Data Structures & Algorithms", category: "core", proficiency: 0.5 },
  ]);
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [canonicalResults, setCanonicalResults] = useState<CanonicalSkill[]>([]);

  const [weeklyCommitmentHours, setWeeklyCommitmentHours] = useState(10);
  const [primaryGoal, setPrimaryGoal] = useState("Land a high-impact engineering placement");

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

  const toggleSkill = (skillName: string, category: string = "technical") => {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <BackgroundAtmosphere />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent shadow-glow-violet" />
          <p className="text-sm font-semibold text-purple-200">Preparing Onboarding Journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      <BackgroundAtmosphere />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-900/60 p-1 ring-1 ring-white/20">
              <Image src="/logo.png" alt="UNNATI" width={28} height={28} className="object-contain" priority />
            </div>
            <span className="font-heading font-black text-lg text-white">
              UNNATI<span className="text-unnati-saffron">.</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-300">
              Step {step} of 5
            </span>
            <div className="w-24 h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-unnati-saffron transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 mx-auto max-w-3xl w-full px-4 sm:px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-rose-500/40 bg-rose-950/40 p-4 text-xs font-medium text-rose-200 backdrop-blur-md">
            {error}
          </div>
        )}

        {/* STEP 1: Persona Selection */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <Badge variant="violet" className="text-xs mb-2">
                Step 1: Profile Classification
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Which persona best describes you?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
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
                    className={`flex flex-col text-left rounded-3xl border p-5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-purple-500 bg-purple-950/40 shadow-glow-violet ring-1 ring-purple-500"
                        : "border-white/10 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900/80"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isSelected ? "bg-purple-600 text-white" : "bg-white/5 text-purple-300 border border-white/5"
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {isSelected && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                    </div>
                    <h3 className="font-heading font-bold text-white text-base">{p.title}</h3>
                    <p className="text-[11px] font-semibold text-orange-400 mt-0.5">{p.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-400">{p.description}</p>
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
              <Badge variant="violet" className="text-xs mb-2">
                Step 2: Target Trajectory
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                What is your target career direction?
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Choose the target trajectory you want to master. We will analyze your prerequisite gaps and build your personalized milestone roadmap.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Select Target Role</label>
              <div className="grid gap-2.5 sm:grid-cols-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setCustomTargetRole("");
                    }}
                    className={`rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      targetRole === role && !customTargetRole
                        ? "border-purple-500 bg-purple-950/40 text-purple-200 shadow-glow-violet font-bold"
                        : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Or enter a custom role title</label>
                <input
                  type="text"
                  placeholder="e.g. MLOps Engineer, Quantitative Analyst"
                  value={customTargetRole}
                  onChange={(e) => setCustomTargetRole(e.target.value)}
                  className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Aspiring Full-Stack Engineer"
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India or Remote"
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
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
              <Badge variant="violet" className="text-xs mb-2">
                Step 3: Academic Foundations
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Tell us about your education
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Helps us evaluate curriculum alignment and match verified university programs.
              </p>
            </div>

            <div className="space-y-4 rounded-3xl border border-white/10 glass-panel p-6 sm:p-7">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">College / University Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology or Delhi University"
                  className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white focus:outline-none"
                  >
                    <option value="B.Tech / B.E." className="bg-slate-900">B.Tech / B.E.</option>
                    <option value="B.S. / B.Sc" className="bg-slate-900">B.S. / B.Sc</option>
                    <option value="BCA" className="bg-slate-900">BCA</option>
                    <option value="M.Tech / M.E." className="bg-slate-900">M.Tech / M.E.</option>
                    <option value="M.S. / M.Sc" className="bg-slate-900">M.S. / M.Sc</option>
                    <option value="MCA" className="bg-slate-900">MCA</option>
                    <option value="MBA" className="bg-slate-900">MBA</option>
                    <option value="Other" className="bg-slate-900">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science, Information Technology"
                    className="w-full rounded-xl glass-input px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Graduation Year</label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full sm:w-1/2 rounded-xl glass-input px-4 py-2.5 text-xs text-white focus:outline-none"
                >
                  {[2028, 2027, 2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
                    <option key={yr} value={yr} className="bg-slate-900">{yr}</option>
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
              <Badge variant="violet" className="text-xs mb-2">
                Step 4: Skill Mapping
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Select your existing capabilities
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Claim what you currently know. These will form your baseline inventory for Algorithm B gap diagnostics.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search canonical skills (e.g. Python, React, Docker)..."
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl glass-input text-white placeholder-slate-400 focus:outline-none"
              />
              {canonicalResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/10 bg-slate-900 p-2 shadow-xl">
                  {canonicalResults.map((skill) => (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => {
                        toggleSkill(skill.name, skill.category);
                        setSkillSearchQuery("");
                      }}
                      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs hover:bg-white/10 text-slate-200"
                    >
                      <span className="font-semibold">{skill.name}</span>
                      <span className="text-[10px] text-slate-400">{skill.category}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Popular Skills Quick-Pills */}
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggested Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILLS.map((item) => {
                  const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleSkill(item.name, item.category)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                        isSelected
                          ? "bg-purple-600 text-white shadow-glow-violet border border-purple-400/40"
                          : "border border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20"
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
              <div className="rounded-3xl border border-white/10 glass-panel p-5">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3">
                  Selected Capabilities ({selectedSkills.length}) — Rate your proficiency:
                </h3>
                <div className="space-y-3">
                  {selectedSkills.map((sk) => (
                    <div key={sk.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSkill(sk.name)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-semibold text-white text-xs">{sk.name}</span>
                        <span className="rounded bg-white/5 border border-white/10 px-1.5 py-0.5 text-[9px] uppercase font-bold text-slate-400">
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
                                ? "bg-purple-600 text-white shadow-sm"
                                : "bg-white/5 text-slate-400 hover:text-white"
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
              <Badge variant="violet" className="text-xs mb-2">
                Step 5: Execution Plan
              </Badge>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Set your commitment pace
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-400 leading-relaxed">
                UNNATI calibrates roadmap milestones, weekly targets, and reminders to match your available time.
              </p>
            </div>

            <div className="space-y-5 rounded-3xl border border-white/10 glass-panel p-6 sm:p-7">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-purple-400" />
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
                      className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                        weeklyCommitmentHours === tier.hrs
                          ? "border-purple-500 bg-purple-950/40 shadow-glow-violet text-white font-bold"
                          : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20"
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{tier.label}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  Primary Milestone Objective
                </label>
                <div className="space-y-2">
                  {[
                    "Land a high-impact engineering placement or job",
                    "Build an industry-grade portfolio of full-stack projects",
                    "Upskill for promotion or transition to a senior role",
                    "Prepare for technical interviews (DSA & System Design)",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`w-full rounded-2xl border px-4 py-3 text-left text-xs sm:text-sm font-medium transition cursor-pointer ${
                        primaryGoal === goal
                          ? "border-orange-500 bg-orange-950/40 shadow-glow-saffron font-bold text-white"
                          : "border-white/10 bg-slate-900/60 text-slate-300 hover:border-white/20"
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
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
          {step > 1 ? (
            <Button
              variant="outline"
              size="md"
              onClick={() => setStep(step - 1)}
              className="text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
            </Button>
          ) : (
            <Link href="/" className="text-xs text-slate-400 hover:text-white">
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
              className="btn-shimmer text-xs font-bold shadow-glow-saffron"
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
