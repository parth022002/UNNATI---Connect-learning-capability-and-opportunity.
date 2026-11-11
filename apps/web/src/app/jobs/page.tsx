"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  Briefcase,
  Search,
  Filter,
  Sparkles,
  MapPin,
  Building2,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Award,
  Globe,
  Layers,
  ArrowRight,
  RefreshCw,
  Send,
  Sliders,
  Check,
  X,
  FileText
} from "lucide-react";
import {
  api,
  getClerkApiToken,
  CanonicalJobListItem,
  JobDiscoveryDashboardData,
  JobSearchResponse,
  SavedJobItem,
  JobApplicationActivityItem
} from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import BackgroundAtmosphere from "@/components/layout/BackgroundAtmosphere";

const NATURAL_LANGUAGE_EXAMPLES = [
  "Entry-level data analyst jobs in Bengaluru",
  "Associate Product Manager jobs in India",
  "Remote software engineer roles above 15 LPA",
  "Frontend developer React jobs in Pune",
  "Freshers software engineer internships"
];

function JobDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getToken, isSignedIn, isLoaded } = useAuth();

  const [activeTab, setActiveTab] = useState<"personalized" | "search" | "saved" | "tracker">(
    (searchParams.get("tab") as any) || "personalized"
  );

  // Search & Filter State
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [selectedWorkplaceTypes, setSelectedWorkplaceTypes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");

  // Data State
  const [dashboard, setDashboard] = useState<JobDiscoveryDashboardData | null>(null);
  const [searchResults, setSearchResults] = useState<JobSearchResponse | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [applications, setApplications] = useState<JobApplicationActivityItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const [dash, saved, apps] = await Promise.all([
        api.getJobDashboard(token),
        api.getSavedJobs(token).catch(() => []),
        api.getJobApplications(token).catch(() => [])
      ]);

      setDashboard(dash);
      setSavedJobs(saved);
      setSavedJobIds(new Set(saved.map((s) => s.canonical_job_id)));
      setApplications(apps);
    } catch (err: any) {
      console.error("Failed to load job discovery hub:", err);
      setError(err.message || "Failed to load job opportunities.");
    } finally {
      setLoading(false);
    }
  };

  // Execute Search
  const executeSearch = async (overrideQuery?: string) => {
    try {
      setSearchLoading(true);
      setError(null);
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      const filterPayload = {
        q: overrideQuery !== undefined ? overrideQuery : query,
        cities: selectedCities.length > 0 ? selectedCities : undefined,
        workplace_types: selectedWorkplaceTypes.length > 0 ? selectedWorkplaceTypes : undefined,
        experience_levels: selectedExperienceLevels.length > 0 ? selectedExperienceLevels : undefined,
        category: selectedCategory || undefined,
        sort_by: sortBy,
        page: 1,
        limit: 20
      };

      const res = await api.searchJobs(token, filterPayload);
      setSearchResults(res);
      setActiveTab("search");
    } catch (err: any) {
      console.error("Job search error:", err);
      setError(err.message || "Search failed.");
    } finally {
      setSearchLoading(false);
    }
  };

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadDashboard();
      if (searchParams.get("q")) {
        executeSearch(searchParams.get("q") || "");
      }
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
    }
  }, [isLoaded, isSignedIn]);

  // Toggle Bookmark
  const handleToggleSave = async (jobId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) return;

      if (savedJobIds.has(jobId)) {
        await api.removeSavedJob(token, jobId);
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          next.delete(jobId);
          return next;
        });
        setSavedJobs((prev) => prev.filter((s) => s.canonical_job_id !== jobId));
      } else {
        await api.saveJob(token, jobId);
        setSavedJobIds((prev) => new Set(prev).add(jobId));
        // Refresh saved list
        const updatedSaved = await api.getSavedJobs(token);
        setSavedJobs(updatedSaved);
      }
    } catch (err: any) {
      alert("Failed to update bookmark: " + err.message);
    }
  };

  // Format Salary
  const formatSalary = (min?: number | null, max?: number | null, currency: string = "INR") => {
    if (!min && !max) return "Competitive Compensation";
    if (currency === "INR") {
      const minLPA = min ? (min / 100000).toFixed(1) : null;
      const maxLPA = max ? (max / 100000).toFixed(1) : null;
      if (minLPA && maxLPA) return `₹${minLPA} – ₹${maxLPA} LPA`;
      if (minLPA) return `From ₹${minLPA} LPA`;
      if (maxLPA) return `Up to ₹${maxLPA} LPA`;
    }
    return `${currency} ${min?.toLocaleString() || ""} – ${max?.toLocaleString() || ""}`;
  };

  return (
    <div className="relative min-h-screen text-slate-900 pb-20">
      <BackgroundAtmosphere />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* ========================================================
            HERO SEARCH & DISCOVERY BAR
           ======================================================== */}
        <div className="bg-gradient-to-br from-purple-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-soft-lg relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge variant="saffron" className="px-3 py-1 text-xs">
                <Globe className="h-3.5 w-3.5 mr-1" />
                Aggregated Indian &amp; Global Opportunities
              </Badge>
              <span className="text-xs text-purple-200">
                Grounded in your Resume, Skills &amp; Career Roadmap
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-white">
              Discover verified opportunities. Apply with confidence.
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Unified opportunities from Naukri, Instahyre, Cutshort, National Career Service, and global remote boards. Evaluated across 10 explainable matching dimensions with direct application links.
            </p>

            {/* Natural Language Search Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch();
              }}
              className="mt-6 flex flex-col sm:flex-row gap-2.5"
            >
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Find entry-level software engineer jobs in Bengaluru above 12 LPA"
                  className="w-full rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 font-medium"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={searchLoading}
                className="py-3 px-6 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0 shadow-soft-md"
              >
                {searchLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Search className="h-4 w-4" /> Search Opportunities
                  </>
                )}
              </Button>
            </form>

            {/* Quick Natural Language Queries */}
            <div className="mt-3.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-purple-300 font-semibold flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-unnati-saffron" /> Try asking:
              </span>
              {NATURAL_LANGUAGE_EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setQuery(ex);
                    executeSearch(ex);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-[11px] border border-white/10 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================
            NAVIGATION TABS
           ======================================================== */}
        <div className="flex border-b border-slate-200 text-sm font-bold gap-6 overflow-x-auto">
          {[
            { id: "personalized", label: "Recommended For You", badge: dashboard?.best_matches?.length },
            { id: "search", label: "Browse & Search All", badge: searchResults?.total },
            { id: "saved", label: "Saved Jobs", badge: savedJobs.length },
            { id: "tracker", label: "Application Pipeline", badge: applications.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 flex items-center gap-2 transition-colors relative whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-unnati-indigo border-b-2 border-unnati-indigo font-black"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-unnati-indigo text-xs">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ========================================================
            TAB 1: PERSONALIZED RECOMMENDATION CAROUSELS
           ======================================================== */}
        {activeTab === "personalized" && (
          <div className="space-y-12">
            {/* Section A: Best Matches */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Award className="h-5 w-5 text-unnati-indigo" />
                    Top Personalized Recommendations
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Highest alignment with your skills, target role ({dashboard?.user_target_role || "Selected Pathway"}), and resume.
                  </p>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-unnati-indigo mb-2" />
                  Evaluating job matches against your candidate inventory...
                </div>
              ) : !dashboard || dashboard.best_matches.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300">
                  No direct recommendations yet. Complete your career roadmap or search above!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {dashboard.best_matches.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onToggleSave={(e) => handleToggleSave(job.id, e)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Section B: Opportunities Matching Skills You Are Learning */}
            {dashboard?.skills_in_learning_opportunities && dashboard.skills_in_learning_opportunities.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-orange-50/40 rounded-3xl p-6 sm:p-8 border border-purple-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Badge variant="violet" className="text-xs mb-1.5">
                      <TrendingUp className="h-3.5 w-3.5 mr-1" /> Roadmap Synergy
                    </Badge>
                    <h2 className="font-heading text-xl font-bold text-slate-900">
                      Opportunities Requiring Skills You Are Learning
                    </h2>
                    <p className="text-xs text-slate-600 mt-0.5">
                      These roles require technologies actively covered in your in-progress Career Roadmap milestones.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                  {dashboard.skills_in_learning_opportunities.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onToggleSave={(e) => handleToggleSave(job.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section C: Entry-Level & Fresh Graduate Opportunities */}
            {dashboard?.entry_level_opportunities && dashboard.entry_level_opportunities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-unnati-saffron" />
                      Entry-Level &amp; Graduate Opportunities (0–2 Years)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Verified roles with accessible entry barriers in Indian tech ecosystems.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {dashboard.entry_level_opportunities.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onToggleSave={(e) => handleToggleSave(job.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Section D: Global & Remote Opportunities */}
            {dashboard?.remote_opportunities && dashboard.remote_opportunities.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="h-5 w-5 text-sky-600" />
                      Global &amp; Fully Remote Opportunities
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      High-autonomy remote roles accepting candidates from India and worldwide.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {dashboard.remote_opportunities.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onToggleSave={(e) => handleToggleSave(job.id, e)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 2: BROWSE & FILTER SEARCH RESULTS (2-COLUMN)
           ======================================================== */}
        {activeTab === "search" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Left Column: Filter Sidebar */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-soft-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-unnati-indigo" /> Filters
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCities([]);
                    setSelectedWorkplaceTypes([]);
                    setSelectedExperienceLevels([]);
                    setSelectedCategory("");
                    executeSearch("");
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-unnati-indigo"
                >
                  Reset All
                </button>
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Indian Tech Hubs
                </label>
                <div className="space-y-2">
                  {["Bengaluru", "Mumbai", "Pune", "Hyderabad", "Delhi NCR"].map((city) => (
                    <label key={city} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCities.includes(city)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedCities([...selectedCities, city]);
                          else setSelectedCities(selectedCities.filter((c) => c !== city));
                        }}
                        className="rounded border-slate-300 text-unnati-indigo focus:ring-purple-200"
                      />
                      <span>{city}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Workplace Arrangement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Workplace Type
                </label>
                <div className="space-y-2">
                  {[
                    { id: "REMOTE", label: "Remote (Work From Home)" },
                    { id: "HYBRID", label: "Hybrid" },
                    { id: "ONSITE", label: "Onsite" }
                  ].map((w) => (
                    <label key={w.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWorkplaceTypes.includes(w.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedWorkplaceTypes([...selectedWorkplaceTypes, w.id]);
                          else setSelectedWorkplaceTypes(selectedWorkplaceTypes.filter((x) => x !== w.id));
                        }}
                        className="rounded border-slate-300 text-unnati-indigo focus:ring-purple-200"
                      />
                      <span>{w.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Experience Tier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Experience Tier
                </label>
                <div className="space-y-2">
                  {[
                    { id: "ENTRY", label: "Entry-Level / Fresher (0–2 yrs)" },
                    { id: "INTERNSHIP", label: "Internship" },
                    { id: "MID", label: "Mid-Level Professional (2–5 yrs)" },
                    { id: "SENIOR", label: "Senior Specialist (5+ yrs)" }
                  ].map((exp) => (
                    <label key={exp.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedExperienceLevels.includes(exp.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedExperienceLevels([...selectedExperienceLevels, exp.id]);
                          else setSelectedExperienceLevels(selectedExperienceLevels.filter((x) => x !== exp.id));
                        }}
                        className="rounded border-slate-300 text-unnati-indigo focus:ring-purple-200"
                      />
                      <span>{exp.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => executeSearch()}
                className="w-full text-xs font-bold py-2 shadow-soft-sm"
              >
                Apply Filters
              </Button>
            </div>

            {/* Right Column: Results List */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <span>Showing <strong>{searchResults?.total || 0}</strong> verified opportunities</span>
                <div className="flex items-center gap-2">
                  <span>Sort by:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      executeSearch();
                    }}
                    className="border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold text-slate-700 bg-white"
                  >
                    <option value="relevance">Most Relevant</option>
                    <option value="match_score">Match Score (High to Low)</option>
                    <option value="date">Most Recent</option>
                    <option value="salary_high">Salary (High to Low)</option>
                  </select>
                </div>
              </div>

              {searchLoading ? (
                <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
                  <RefreshCw className="h-6 w-6 animate-spin mx-auto text-unnati-indigo mb-2" />
                  Searching canonical job index...
                </div>
              ) : !searchResults || searchResults.jobs.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
                  <Briefcase className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-800 text-base">No Matching Opportunities</h3>
                  <p className="text-xs text-slate-500 mt-1">Try broadening your keyword or clearing location filters.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {searchResults.jobs.map((job) => (
                    <JobCardHorizontal
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.has(job.id)}
                      onToggleSave={(e) => handleToggleSave(job.id, e)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 3: SAVED JOBS (BOOKMARKS)
           ======================================================== */}
        {activeTab === "saved" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  Saved Job Bookmarks ({savedJobs.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Opportunities you have flagged for comparison and application prep.
                </p>
              </div>
            </div>

            {savedJobs.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
                <Bookmark className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Saved Jobs Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Click the bookmark icon on any opportunity card to save it here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedJobs.map((item) => (
                  <JobCard
                    key={item.id}
                    job={item.job}
                    isSaved={true}
                    notes={item.notes}
                    onToggleSave={(e) => handleToggleSave(item.canonical_job_id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 4: APPLICATION PIPELINE TRACKER
           ======================================================== */}
        {activeTab === "tracker" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">
                Application Pipeline &amp; Activity Tracker
              </h2>
              <p className="text-xs text-slate-500">
                Transparently monitor external apply links opened and track your hiring progression manually.
              </p>
            </div>

            {applications.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-dashed border-slate-300">
                <Send className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <h3 className="font-bold text-slate-800 text-base">No Application Activity Recorded</h3>
                <p className="text-xs text-slate-500 mt-1">
                  When you proceed to an external employer portal via UNNATI, it will appear here for tracking.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="h-11 w-11 rounded-xl bg-purple-50 text-unnati-indigo font-bold flex items-center justify-center shrink-0 border border-purple-200/60">
                        {app.job.company_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/jobs/${app.canonical_job_id}`}>
                          <h4 className="font-heading font-bold text-base text-slate-900 hover:text-unnati-indigo transition-colors">
                            {app.job.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {app.job.company_name} • {app.job.city || "Remote"} • Source: {app.source_name}
                        </p>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          Activity recorded {new Date(app.last_status_change_at).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <Badge
                        variant={
                          app.status === "OFFER"
                            ? "success"
                            : app.status === "INTERVIEW"
                            ? "violet"
                            : app.status === "APPLIED"
                            ? "sky"
                            : "outline"
                        }
                        className="text-xs font-bold capitalize"
                      >
                        {app.status.replace("_", " ")}
                      </Badge>
                      <Link href={`/jobs/${app.canonical_job_id}`}>
                        <Button variant="outline" className="text-xs font-bold py-1.5 px-3">
                          View Job Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ==============================================================================
// REUSABLE JOB CARD (GRID)
// ==============================================================================
function JobCard({
  job,
  isSaved,
  notes,
  onToggleSave
}: {
  job: CanonicalJobListItem;
  isSaved: boolean;
  notes?: string | null;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-soft-sm hover:border-purple-300 hover:shadow-soft-md transition-all cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-unnati-indigo font-bold flex items-center justify-center shrink-0 border border-purple-200/60 text-sm">
              {job.company_name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <span className="font-semibold text-xs text-slate-600 block">{job.company_name}</span>
              <Badge variant="outline" className="text-[10px] text-slate-500 py-0">
                via {job.primary_source_name}
              </Badge>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleSave}
            className={`p-2 rounded-xl transition-colors ${
              isSaved ? "text-unnati-saffron bg-orange-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
            title={isSaved ? "Remove from bookmarks" : "Save job"}
          >
            {isSaved ? <BookmarkCheck className="h-4 w-4 fill-unnati-saffron" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>

        <h3 className="font-heading font-bold text-base text-slate-900 leading-snug hover:text-unnati-indigo transition-colors line-clamp-2">
          {job.title}
        </h3>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2 font-medium">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.city || (job.workplace_type === "REMOTE" ? "Remote" : "India")}
          </span>
          <span>•</span>
          <span>{job.workplace_type}</span>
          <span>•</span>
          <span className="capitalize">{job.experience_level}</span>
        </div>

        {/* Salary */}
        <div className="mt-3 text-xs font-bold text-slate-800">
          {job.salary_min || job.salary_max ? (
            <span className="text-emerald-700">
              ₹{(job.salary_min ? job.salary_min / 100000 : 0).toFixed(1)} – ₹{(job.salary_max ? job.salary_max / 100000 : 0).toFixed(1)} LPA
            </span>
          ) : (
            <span className="text-slate-500">Competitive Compensation</span>
          )}
        </div>

        {/* Key skills pills */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.required_skills.slice(0, 4).map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-semibold">
              {s}
            </span>
          ))}
          {job.required_skills.length > 4 && (
            <span className="text-[10px] text-slate-400 py-0.5">+{job.required_skills.length - 4} more</span>
          )}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
        {job.match_score !== null && job.match_score !== undefined ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-unnati-indigo">{job.match_score.toFixed(0)}% Match</span>
            <span className="text-[10px] text-slate-400">(AI Alignment)</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">Verified Opportunity</span>
        )}

        <span className="text-xs font-bold text-unnati-indigo flex items-center gap-1 hover:underline">
          View Details <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

// ==============================================================================
// REUSABLE JOB CARD (HORIZONTAL LIST FOR SEARCH)
// ==============================================================================
function JobCardHorizontal({
  job,
  isSaved,
  onToggleSave
}: {
  job: CanonicalJobListItem;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent) => void;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-soft-sm hover:border-purple-300 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-purple-50 text-unnati-indigo font-bold flex items-center justify-center shrink-0 border border-purple-200/60 text-sm">
          {job.company_name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-heading font-bold text-base text-slate-900 hover:text-unnati-indigo transition-colors">
              {job.title}
            </h4>
            <Badge variant="outline" className="text-[10px]">
              {job.primary_source_name}
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            <strong>{job.company_name}</strong> • {job.city || "Remote"} • {job.workplace_type} • {job.experience_level}
          </p>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {job.required_skills.slice(0, 5).map((s) => (
              <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
        {job.match_score !== null && job.match_score !== undefined && (
          <div className="text-right">
            <span className="text-sm font-black text-unnati-indigo block">{job.match_score.toFixed(0)}%</span>
            <span className="text-[10px] text-slate-400">Match</span>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleSave}
          className={`p-2 rounded-xl transition-colors ${
            isSaved ? "text-unnati-saffron bg-orange-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
          }`}
        >
          {isSaved ? <BookmarkCheck className="h-4 w-4 fill-unnati-saffron" /> : <Bookmark className="h-4 w-4" />}
        </button>

        <Button variant="outline" className="text-xs font-bold py-1.5 px-3">
          Details
        </Button>
      </div>
    </div>
  );
}

export default function JobDiscoveryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500">Loading Job Discovery...</div>}>
      <JobDiscoveryContent />
    </Suspense>
  );
}

