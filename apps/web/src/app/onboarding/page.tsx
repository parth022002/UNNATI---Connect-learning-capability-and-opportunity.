"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Link from "next/link";
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
    title: "Student",
    subtitle: "Undergraduate, Postgraduate, or School",
    description: "Explore career paths, understand market readiness, build real-world projects, and secure placements.",
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
    description: "Upskill in cutting-edge technologies (AI, Cloud, System Architecture), lead teams, or earn certifications.",
    icon: Compass,
  },
  {
    id: "career_switcher",
    title: "Career Switcher",
    subtitle: "Transitioning disciplines",
    description: "Map your transferable skills, pinpoint prerequisite bridges, and pivot confidently into tech or product.",
    icon: Sparkles,
  },
];

const TARGET_ROLES = [
  "Full-Stack Software Engineer",
  "AI / Machine Learning Engineer",
  "Frontend Engineer (React/Next.js)",
  "Backend Systems Engineer (Python/Go)",
  "Data Scientist & Analytics Engineer",
  "Cloud & DevOps Engineer",
  "Product Manager (Tech)",
  "Cybersecurity Analyst",
];

const POPULAR_SKILLS = [
  { name: "Python", category: "language" },
  { name: "JavaScript", category: "language" },
  { name: "TypeScript", category: "language" },
  { name: "React", category: "frontend" },
  { name: "Next.js", category: "frontend" },
  { name: "FastAPI", category: "backend" },
  { name: "Node.js", category: "backend" },
  { name: "PostgreSQL", category: "database" },
  { name: "Docker", category: "devops" },
  { name: "Machine Learning", category: "ai" },
  { name: "Data Structures & Algorithms", category: "core" },
  { name: "System Design & Architecture", category: "core" },
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
  const [primaryGoal, setPrimaryGoal] = useState("Land a high-impact internship or job");

  // Sync initial user details when signed in
  useEffect(() => {
    if (user?.fullName && !headline) {
      setHeadline(`Aspiring ${targetRole}`);
    }
  }, [user, targetRole, headline]);

  // Skill search
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

      // 1. Sync User with role
      await api.syncUser(token, selectedPersona);

      // 2. Update Profile
      await api.updateProfile(token, {
        headline: headline.trim() || `Aspiring ${finalTargetRole}`,
        target_role: finalTargetRole,
        location: location.trim() || "India",
        bio: `${selectedPersona.toUpperCase()} actively preparing for ${finalTargetRole} opportunities through UNNATI.`,
      });

      // 3. Add Education if provided
      if (institutionName.trim()) {
        await api.addEducation(token, {
          institution_name: institutionName.trim(),
          degree: degree.trim(),
          field_of_study: fieldOfStudy.trim(),
          start_year: gradYear - 4,
          end_year: gradYear,
        });
      }

      // 4. Claim Skills
      for (const sk of selectedSkills) {
        await api.claimSkill(token, {
          skill_name: sk.name,
          category: sk.category,
          proficiency: sk.proficiency,
        });
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Onboarding failed:", err);
      setError(err.message || "Failed to save profile. Please try again.");
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-unnati-cloud">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-unnati-violet border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-unnati-midnight">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-black tracking-tight text-unnati-indigo">
            UNNATI<span className="text-unnati-saffron">.</span>
          </Link>
          <div className="text-sm font-semibold text-slate-500">
            Step {step} of 5
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="h-1.5 w-full bg-slate-200">
        <div
          className="h-full bg-gradient-to-r from-unnati-indigo via-unnati-violet to-unnati-saffron transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      <main className="mx-auto max-w-3xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">
            {error}
          </div>
        )}

        {/* STEP 1: Persona Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                Step 1: Your Profile
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-unnati-midnight">
                Which persona best describes you?
              </h1>
              <p className="mt-1 text-slate-600">
                UNNATI personalizes your learning journey, skill assessments, and career recommendations based on your background.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {PERSONAS.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPersona(p.id)}
                    className={`flex flex-col text-left rounded-2xl border-2 p-5 transition-all ${
                      isSelected
                        ? "border-unnati-violet bg-violet-50/50 shadow-md shadow-violet-100 ring-2 ring-violet-500/20"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${isSelected ? "bg-unnati-violet text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      {isSelected && <CheckCircle2 className="h-6 w-6 text-unnati-violet" />}
                    </div>
                    <h3 className="mt-4 font-bold text-unnati-indigo text-lg">{p.title}</h3>
                    <p className="text-xs font-semibold text-unnati-saffron">{p.subtitle}</p>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Career Direction & Role */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                Step 2: Direction
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-unnati-midnight">
                What is your target career direction?
              </h1>
              <p className="mt-1 text-slate-600">
                Choose the role you want to aim for. We will analyze your prerequisite gap and build your personalized roadmap.
              </p>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Target Role</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {TARGET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setCustomTargetRole("");
                    }}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                      targetRole === role && !customTargetRole
                        ? "border-unnati-violet bg-violet-50 text-unnati-violet font-bold"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
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
                  placeholder="e.g. MLOps Engineer, Quantitative Analyst"
                  value={customTargetRole}
                  onChange={(e) => setCustomTargetRole(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Headline</label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="e.g. Aspiring Full-Stack Engineer"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bengaluru, India or Remote"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Education Background */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                Step 3: Academic Background
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-unnati-midnight">
                Tell us about your education
              </h1>
              <p className="mt-1 text-slate-600">
                Helps us evaluate curriculum alignment and match verified university programs.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">College / University Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. Indian Institute of Technology or Delhi University"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Degree</label>
                  <select
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                  >
                    <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                    <option value="B.S. / B.Sc">B.S. / B.Sc</option>
                    <option value="BCA">BCA</option>
                    <option value="M.Tech / M.E.">M.Tech / M.E.</option>
                    <option value="M.S. / M.Sc">M.S. / M.Sc</option>
                    <option value="MCA">MCA</option>
                    <option value="MBA">MBA</option>
                    <option value="High School">High School (12th)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Field of Study</label>
                  <input
                    type="text"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    placeholder="e.g. Computer Science, Information Technology"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Graduation Year</label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full sm:w-1/2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
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
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                Step 4: Skill Mapping
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-unnati-midnight">
                Select your existing skills
              </h1>
              <p className="mt-1 text-slate-600">
                Claim what you currently know. These will form your baseline inventory for gap analysis.
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search canonical skills (e.g. Python, React, Docker)..."
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm outline-none focus:border-unnati-violet"
              />
              {canonicalResults.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                  {canonicalResults.map((skill) => {
                    const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === skill.name.toLowerCase());
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          toggleSkill(skill.name, skill.category);
                          setSkillSearchQuery("");
                        }}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-violet-50"
                      >
                        <span className="font-semibold text-slate-800">{skill.name}</span>
                        <span className="text-xs text-slate-400">{skill.category}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Popular Skills Quick-Pills */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Suggested Skills</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((item) => {
                  const isSelected = selectedSkills.some((s) => s.name.toLowerCase() === item.name.toLowerCase());
                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => toggleSkill(item.name, item.category)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? "bg-unnati-indigo text-white shadow-sm"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {isSelected ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Skills List with Proficiency */}
            {selectedSkills.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="font-bold text-unnati-indigo text-sm mb-3">
                  Selected Skills ({selectedSkills.length}) — Rate your proficiency:
                </h3>
                <div className="space-y-3">
                  {selectedSkills.map((sk) => (
                    <div key={sk.name} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSkill(sk.name)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="font-semibold text-slate-800 text-sm">{sk.name}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-500">
                          {sk.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        {[
                          { label: "Beginner", val: 0.3 },
                          { label: "Intermediate", val: 0.6 },
                          { label: "Proficient", val: 0.85 },
                        ].map((tier) => (
                          <button
                            key={tier.label}
                            type="button"
                            onClick={() => updateSkillProficiency(sk.name, tier.val)}
                            className={`rounded-full px-2.5 py-1 font-semibold transition ${
                              Math.abs(sk.proficiency - tier.val) < 0.1
                                ? "bg-unnati-violet text-white"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
          <div className="space-y-6">
            <div>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-unnati-violet">
                Step 5: Execution Plan
              </span>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-unnati-midnight">
                Set your commitment pace
              </h1>
              <p className="mt-1 text-slate-600">
                UNNATI calibrates roadmap milestones, weekly targets, and reminders to match your available time.
              </p>
            </div>

            <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-unnati-violet" />
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
                      className={`rounded-xl border p-4 text-left transition ${
                        weeklyCommitmentHours === tier.hrs
                          ? "border-unnati-violet bg-violet-50 font-bold"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="text-sm font-bold text-unnati-indigo">{tier.label}</p>
                      <p className="text-xs text-slate-500 mt-1">{tier.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4 text-unnati-saffron" />
                  Primary Milestone Objective
                </label>
                <div className="space-y-2">
                  {[
                    "Land a high-impact internship or job",
                    "Build an industry-grade portfolio of full-stack projects",
                    "Upskill for promotion or transition to a senior role",
                    "Prepare for technical interviews (DSA & System Design)",
                  ].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setPrimaryGoal(goal)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                        primaryGoal === goal
                          ? "border-unnati-saffron bg-orange-50/50 font-bold text-slate-900"
                          : "border-slate-200 bg-white hover:border-slate-300"
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
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <Link
              href="/"
              className="text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </Link>
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-unnati-indigo px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-violet-200 hover:bg-unnati-violet"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleComplete}
              className="inline-flex items-center gap-2 rounded-full bg-unnati-saffron px-8 py-3 text-sm font-black text-white shadow-lg shadow-orange-200 hover:brightness-95 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Generating Your Growth Path...
                </>
              ) : (
                <>
                  Complete & Open Dashboard
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

