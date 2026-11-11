/**
 * UNNATI - Client API Service
 * Centralized HTTP client connecting Next.js to FastAPI backend with Clerk JWT auth.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Retrieves a JWT from Clerk targeting the 'unnati-api' template,
 * with automatic fallback to the standard session token.
 */
export async function getClerkApiToken(
  getToken: (options?: { template?: string }) => Promise<string | null>
): Promise<string | null> {
  try {
    const token = await getToken({ template: "unnati-api" });
    if (token) return token;
  } catch {
    // Fallback if custom JWT template is not configured in Clerk Dashboard yet
  }
  return await getToken();
}

export interface UserProfile {
  id: string;
  headline?: string | null;
  bio?: string | null;
  target_role?: string | null;
  location?: string | null;
  profile_completeness_score: number;
}

export interface EducationRecord {
  id: string;
  institution_name: string;
  degree: string;
  field_of_study?: string | null;
  start_year: number;
  end_year?: number | null;
}

export interface ExperienceRecord {
  id: string;
  company_name: string;
  job_title: string;
  employment_type?: string | null;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
}

export interface UserDetail {
  id: string;
  email: string;
  full_name?: string | null;
  role: string;
  is_active: boolean;
  profile?: UserProfile | null;
  education_records: EducationRecord[];
  experience_records: ExperienceRecord[];
}

export interface CanonicalSkill {
  id: string;
  name: string;
  slug: string;
  category: string;
  description?: string | null;
}

export interface CandidateSkill {
  id: string;
  skill_name: string;
  category: string;
  state: string; // CLAIMED, INFERRED, ASSESSED, VERIFIED
  proficiency: number;
  confidence: number;
  evidence_count: number;
  last_evidence_at?: string | null;
}

export interface CandidateDocumentSummary {
  id: string;
  filename: string;
  document_type: string;
  file_size_bytes: number;
  mime_type: string;
  status: string;
  created_at: string;
}

export interface CandidateDocumentDetail {
  id: string;
  filename: string;
  document_type: string;
  file_size_bytes: number;
  mime_type: string;
  status: string;
  raw_text?: string | null;
  parsed_payload?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    headline?: string | null;
    summary?: string | null;
    target_role?: string | null;
    location?: string | null;
    education?: Array<{
      institution_name: string;
      degree: string;
      field_of_study?: string | null;
      start_year?: number | null;
      end_year?: number | null;
    }>;
    experience?: Array<{
      company_name: string;
      job_title: string;
      employment_type?: string | null;
      start_date?: string | null;
      end_date?: string | null;
      is_current?: boolean;
      description?: string | null;
    }>;
    skills?: Array<{
      name: string;
      category?: string;
      proficiency_hint?: number;
      source_context?: string | null;
    }>;
    projects?: any[];
    certifications?: any[];
  } | null;
  error_message?: string | null;
  created_at: string;
}

export interface SkillGapItem {
  skill_name: string;
  target_proficiency: number;
  current_proficiency: number;
  gap: number;
  state: string;
  confidence: number;
  weight: number;
  prerequisites: string[];
  is_met: boolean;
}

export interface GapAnalysisResponse {
  target_role: string;
  readiness_score: number;
  total_skills_required: number;
  skills_met_count: number;
  skills_breakdown: SkillGapItem[];
}

export interface RoadmapMilestone {
  id: string;
  phase_number: number;
  title: string;
  description?: string | null;
  order_index: number;
  status: string;
  estimated_weeks: number;
  target_skills: string[];
  learning_modules: Array<{
    title: string;
    duration_hours: number;
    type: string;
    completed?: boolean;
  }>;
  project_deliverable?: {
    title: string;
    description: string;
    rubric: string[];
  } | null;
}

export interface MilestoneProgressResponse {
  roadmap_id: string;
  milestone_id: string;
  phase_number: number;
  milestone_status: string;
  completed_modules_count: number;
  total_modules_count: number;
  milestone_completion_percentage: number;
  overall_roadmap_progress_percentage: number;
  learning_modules: Array<{
    title: string;
    duration_hours: number;
    type: string;
    completed?: boolean;
  }>;
}

export interface AssessmentQuestion {
  id: number;
  track: string;
  skill: string;
  difficulty: string;
  prompt: string;
  scenario?: string | null;
  options: Array<{
    id: string;
    text: string;
  }>;
  estimated_minutes: number;
}

export interface AssessmentSubmissionResponse {
  question_id: number;
  is_correct: boolean;
  correct_option_id: string;
  score: number;
  explanation: string;
  practical_takeaway: string;
  skill_update?: {
    skill_name: string;
    category: string;
    state: string;
    proficiency: number;
    confidence: number;
    evidence_count: number;
  } | null;
}

export interface InterviewPrepQuestion {
  id: number;
  role: string;
  track: string;
  category: string;
  question: string;
  scenario?: string | null;
  evaluation_rubric: string[];
  sample_approach: string;
  tips: string[];
}

export interface CompanionChatResponse {
  reply: string;
  sources: string[];
  suggested_action?: {
    label: string;
    href: string;
  } | null;
  suggested_prompts: string[];
  learner_context_used?: any;
}

export interface CareerRoadmap {
  id: string;
  target_role: string;
  title: string;
  description?: string | null;
  overall_readiness_score: number;
  total_estimated_weeks: number;
  weekly_hours: number;
  status: string;
  summary_metadata?: any;
  milestones: RoadmapMilestone[];
  created_at: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorBody);
      errorMessage = parsed.detail || errorMessage;
    } catch {
      // Keep raw fallback
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // User Management
  async syncUser(token: string, requestedRole: string = "student"): Promise<UserDetail> {
    return request<UserDetail>(
      "/api/v1/users/sync",
      {
        method: "POST",
        body: JSON.stringify({ role: requestedRole }),
      },
      token
    );
  },

  async getCurrentUser(token: string): Promise<UserDetail> {
    return request<UserDetail>("/api/v1/users/me", { method: "GET" }, token);
  },

  async updateProfile(
    token: string,
    data: {
      headline?: string;
      bio?: string;
      target_role?: string;
      location?: string;
    }
  ): Promise<UserProfile> {
    return request<UserProfile>(
      "/api/v1/users/me/profile",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async addEducation(
    token: string,
    data: {
      institution_name: string;
      degree: string;
      field_of_study?: string;
      start_year: number;
      end_year?: number;
    }
  ): Promise<EducationRecord> {
    return request<EducationRecord>(
      "/api/v1/users/me/education",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async addExperience(
    token: string,
    data: {
      company_name: string;
      job_title: string;
      employment_type?: string;
      start_date: string;
      end_date?: string;
      is_current?: boolean;
      description?: string;
    }
  ): Promise<ExperienceRecord> {
    return request<ExperienceRecord>(
      "/api/v1/users/me/experience",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  // Skills Taxonomy & Claiming
  async searchCanonicalSkills(q?: string, category?: string): Promise<CanonicalSkill[]> {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<CanonicalSkill[]>(`/api/v1/skills/canonical${queryStr}`, {
      method: "GET",
    });
  },

  async getMySkills(token: string): Promise<CandidateSkill[]> {
    return request<CandidateSkill[]>("/api/v1/skills/me", { method: "GET" }, token);
  },

  async claimSkill(
    token: string,
    data: {
      skill_name: string;
      category?: string;
      proficiency: number;
    }
  ): Promise<CandidateSkill> {
    return request<CandidateSkill>(
      "/api/v1/skills/me/claim",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async assessSkill(
    token: string,
    data: {
      skill_name: string;
      category?: string;
      score: number;
    }
  ): Promise<CandidateSkill> {
    return request<CandidateSkill>(
      "/api/v1/skills/me/assess",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  // Document Management & Resume Parsing
  async uploadDocument(
    token: string,
    file: File,
    documentType: string = "RESUME"
  ): Promise<CandidateDocumentDetail> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    const headers = new Headers();
    headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(`${API_BASE_URL}/api/v1/documents/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      let parsedMsg = err;
      try {
        parsedMsg = JSON.parse(err).detail || err;
      } catch {}
      throw new Error(parsedMsg || "Failed to upload document");
    }
    return res.json();
  },

  async getMyDocuments(token: string): Promise<CandidateDocumentSummary[]> {
    return request<CandidateDocumentSummary[]>("/api/v1/documents/me", { method: "GET" }, token);
  },

  async getDocumentDetails(token: string, docId: string): Promise<CandidateDocumentDetail> {
    return request<CandidateDocumentDetail>(`/api/v1/documents/${docId}`, { method: "GET" }, token);
  },

  async applyDocument(
    token: string,
    docId: string,
    options: {
      apply_profile?: boolean;
      apply_education?: boolean;
      apply_experience?: boolean;
      apply_skills?: boolean;
    } = { apply_profile: true, apply_education: true, apply_experience: true, apply_skills: true }
  ): Promise<{
    status: string;
    added_education: number;
    added_experience: number;
    inferred_skills: number;
    new_completeness_score: number;
  }> {
    return request(
      `/api/v1/documents/${docId}/apply`,
      {
        method: "POST",
        body: JSON.stringify(options),
      },
      token
    );
  },

  // Gap Analysis & Roadmaps
  async getGapAnalysis(token: string, targetRole?: string): Promise<GapAnalysisResponse> {
    const params = new URLSearchParams();
    if (targetRole) params.set("target_role", targetRole);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<GapAnalysisResponse>(`/api/v1/roadmaps/gap-analysis${queryStr}`, { method: "GET" }, token);
  },

  async generateRoadmap(
    token: string,
    data: { target_role?: string; weekly_hours?: number } = {}
  ): Promise<CareerRoadmap> {
    return request<CareerRoadmap>(
      "/api/v1/roadmaps/generate",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async getMyActiveRoadmap(token: string): Promise<CareerRoadmap | null> {
    return request<CareerRoadmap | null>("/api/v1/roadmaps/me", { method: "GET" }, token);
  },

  async getRoadmapById(token: string, roadmapId: string): Promise<CareerRoadmap> {
    return request<CareerRoadmap>(`/api/v1/roadmaps/${roadmapId}`, { method: "GET" }, token);
  },

  async updateMilestoneStatus(
    token: string,
    roadmapId: string,
    milestoneId: string,
    status: string
  ): Promise<RoadmapMilestone> {
    return request<RoadmapMilestone>(
      `/api/v1/roadmaps/${roadmapId}/milestones/${milestoneId}`,
      {
        method: "PATCH",
        body: JSON.stringify({ status }),
      },
      token
    );
  },

  async toggleModuleProgress(
    token: string,
    roadmapId: string,
    milestoneId: string,
    moduleIndex: number,
    completed?: boolean
  ): Promise<MilestoneProgressResponse> {
    return request<MilestoneProgressResponse>(
      `/api/v1/roadmaps/${roadmapId}/milestones/${milestoneId}/modules/${moduleIndex}/toggle`,
      {
        method: "POST",
        body: JSON.stringify({ completed }),
      },
      token
    );
  },

  // Assessments & Evidence Capture (Phase 4)
  async getAssessmentQuestions(track?: string, difficulty?: string): Promise<AssessmentQuestion[]> {
    const params = new URLSearchParams();
    if (track && track !== "all") params.set("track", track);
    if (difficulty) params.set("difficulty", difficulty);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<AssessmentQuestion[]>(`/api/v1/assessments/questions${queryStr}`, { method: "GET" });
  },

  async submitAssessmentQuestion(
    token: string,
    data: {
      question_id: number;
      selected_option_id: string;
      time_taken_seconds?: number;
    }
  ): Promise<AssessmentSubmissionResponse> {
    return request<AssessmentSubmissionResponse>(
      "/api/v1/assessments/submit",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async getInterviewPrep(role?: string, track?: string): Promise<InterviewPrepQuestion[]> {
    const params = new URLSearchParams();
    if (role) params.set("role", role);
    if (track && track !== "all") params.set("track", track);
    const queryStr = params.toString() ? `?${params.toString()}` : "";
    return request<InterviewPrepQuestion[]>(`/api/v1/assessments/interview-prep${queryStr}`, { method: "GET" });
  },

  // Formative RAG Career Companion AI (Phase 4)
  async chatWithAI(
    message: string,
    category?: string,
    token?: string | null,
    targetRole?: string
  ): Promise<CompanionChatResponse> {
    return request<CompanionChatResponse>(
      "/api/v1/ai/chat",
      {
        method: "POST",
        body: JSON.stringify({
          message,
          category: category || "all",
          target_role: targetRole,
        }),
      },
      token
    );
  },

  // Institution & Campus Analytics (Phase 5.1)
  async getInstitutionSummary(): Promise<InstitutionSummary> {
    return request<InstitutionSummary>("/api/v1/institution/summary", { method: "GET" });
  },

  async getCohortAnalytics(cohortId: string): Promise<CohortAnalytics> {
    return request<CohortAnalytics>(`/api/v1/institution/cohorts/${cohortId}/analytics`, { method: "GET" });
  },

  // Employer Talent Discovery & Opportunities (Phase 5.2)
  async searchTalentPool(filter: {
    target_role?: string;
    required_skills?: string[];
    min_readiness_score?: number;
    has_capstone?: boolean;
    limit?: number;
  }): Promise<TalentSearchResponse> {
    return request<TalentSearchResponse>("/api/v1/talent/candidates/search", {
      method: "POST",
      body: JSON.stringify(filter),
    });
  },

  async getOpportunities(sector?: string): Promise<OpportunityItem[]> {
    const query = sector && sector !== "all" ? `?sector=${encodeURIComponent(sector)}` : "";
    return request<OpportunityItem[]>(`/api/v1/talent/opportunities${query}`, { method: "GET" });
  },

  // Labor Market Intelligence (Phase 5.3)
  async getMarketIntelligence(sector: string = "technology"): Promise<MarketIntelligence> {
    return request<MarketIntelligence>(`/api/v1/analytics/market-intelligence?sector=${encodeURIComponent(sector)}`, { method: "GET" });
  },

  // Examination & Assessment Integrity System
  async getExaminations(track?: string, category?: string, token?: string | null): Promise<ExaminationSummary[]> {
    const params = new URLSearchParams();
    if (track && track !== "all") params.set("track", track);
    if (category && category !== "all") params.set("category", category);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<ExaminationSummary[]>(`/api/v1/examinations${query}`, { method: "GET" }, token || undefined);
  },

  async getExaminationDetail(examId: string, token?: string | null): Promise<ExaminationSummary> {
    return request<ExaminationSummary>(`/api/v1/examinations/${examId}`, { method: "GET" }, token || undefined);
  },

  async startExamination(
    token: string,
    examId: string,
    data: { proctoring_consent: boolean; device_info?: Record<string, any> }
  ): Promise<ExamSessionResponse> {
    return request<ExamSessionResponse>(
      `/api/v1/examinations/${examId}/start`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async saveExamAnswer(
    token: string,
    attemptId: string,
    data: {
      question_id: string;
      selected_options?: string[];
      text_response?: string;
      is_marked_for_review?: boolean;
    }
  ): Promise<{ success: boolean; question_id: string; saved_at: string }> {
    return request<{ success: boolean; question_id: string; saved_at: string }>(
      `/api/v1/examinations/attempts/${attemptId}/answers`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async recordProctoringEvent(
    token: string,
    attemptId: string,
    data: {
      event_type: string;
      severity?: string;
      metadata_payload?: Record<string, any>;
      client_timestamp?: string;
    }
  ): Promise<ProctoringEventItem> {
    return request<ProctoringEventItem>(
      `/api/v1/examinations/attempts/${attemptId}/proctoring-events`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async submitExamination(
    token: string,
    attemptId: string,
    feedbackNotes?: string
  ): Promise<ExamResultDetail> {
    return request<ExamResultDetail>(
      `/api/v1/examinations/attempts/${attemptId}/submit`,
      {
        method: "POST",
        body: JSON.stringify({ feedback_notes: feedbackNotes }),
      },
      token
    );
  },

  async getExamResults(token: string, attemptId: string): Promise<ExamResultDetail> {
    return request<ExamResultDetail>(`/api/v1/examinations/attempts/${attemptId}/results`, { method: "GET" }, token);
  },

  async verifyCertificate(certificateNumber: string): Promise<ExamCertificateData> {
    return request<ExamCertificateData>(`/api/v1/examinations/certificates/${certificateNumber}`, { method: "GET" });
  },

  async getAdminReviews(token: string, risk?: string, status?: string): Promise<AdminReviewItem[]> {
    const params = new URLSearchParams();
    if (risk && risk !== "all") params.set("risk", risk);
    if (status && status !== "all") params.set("status", status);
    const query = params.toString() ? `?${params.toString()}` : "";
    return request<AdminReviewItem[]>(`/api/v1/examinations/admin/reviews${query}`, { method: "GET" }, token);
  },

  async getAdminReviewDetail(token: string, attemptId: string): Promise<AdminReviewDetail> {
    return request<AdminReviewDetail>(`/api/v1/examinations/admin/reviews/${attemptId}`, { method: "GET" }, token);
  },

  async recordAdminDecision(
    token: string,
    attemptId: string,
    data: { decision: string; reviewer_notes: string }
  ): Promise<AdminReviewDetail> {
    return request<AdminReviewDetail>(
      `/api/v1/examinations/admin/reviews/${attemptId}/decision`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async getAdminExamAnalytics(token: string): Promise<ExamAnalyticsData> {
    return request<ExamAnalyticsData>("/api/v1/examinations/admin/analytics", { method: "GET" }, token);
  },
};

export interface CohortSummary {
  id: string;
  name: string;
  department: string;
  target_degree: string;
  graduation_year: number;
  total_students: number;
  average_readiness_score: number;
}

export interface InstitutionSummary {
  id: string;
  name: string;
  code: string;
  institution_type: string;
  domain?: string | null;
  location?: string | null;
  is_verified: boolean;
  contact_email?: string | null;
  cohorts: CohortSummary[];
}

export interface CohortDistributionTier {
  tier: string;
  count: number;
  percentage: number;
}

export interface CurriculumGapItem {
  skill_name: string;
  category: string;
  importance: string;
  affected_students_count: number;
  gap_percentage: number;
  recommended_action: string;
}

export interface CohortAnalytics {
  cohort_id: string;
  cohort_name: string;
  department: string;
  total_learners: number;
  average_readiness_score: number;
  job_ready_percentage: number;
  active_roadmaps_count: number;
  distribution: CohortDistributionTier[];
  top_curriculum_gaps: CurriculumGapItem[];
  top_target_roles: { role: string; interested_percentage: number }[];
}

export interface CandidateTalentProfile {
  candidate_id: string;
  anonymized_identifier: string;
  target_role: string;
  headline?: string | null;
  readiness_score: number;
  experience_years: number;
  verified_skills: string[];
  assessed_skills: string[];
  inferred_skills: string[];
  match_percentage: number;
  capstone_completed: boolean;
  dpdp_consent_verified: boolean;
}

export interface TalentSearchResponse {
  total_matches: number;
  filter_criteria: Record<string, any>;
  candidates: CandidateTalentProfile[];
}

export interface OpportunityItem {
  id: string;
  title: string;
  role_category: string;
  location: string;
  employment_type: string;
  min_readiness_score: number;
  required_skills: string[];
  description?: string | null;
  salary_range?: string | null;
  company_name: string;
  is_verified_company: boolean;
  status: string;
  created_at: string;
  matched_candidates_count: number;
}

export interface MarketSkillTrend {
  skill_name: string;
  category: string;
  industry_demand_index: number;
  supply_in_cohorts: number;
  market_gap: number;
  trend_direction: string;
}

export interface MarketIntelligence {
  sector: string;
  top_demanded_roles: { role: string; growth_yoy: string; median_ctc: string }[];
  surging_skills: MarketSkillTrend[];
  curriculum_blind_spots: { blind_spot: string; curriculum_gap: string; impact: string }[];
  quarterly_insight: string;
}

// Examination & Assessment Integrity System Types
export interface ExaminationSummary {
  id: string;
  title: string;
  description?: string | null;
  course_id?: string | null;
  course_name: string;
  module_name: string;
  track: string;
  category: "PRACTICE_QUIZ" | "MODULE_ASSESSMENT" | "FORMAL_EXAM" | "CERTIFICATION";
  difficulty: "Foundational" | "Intermediate" | "Advanced";
  total_marks: number;
  passing_percentage: number;
  duration_minutes: number;
  max_attempts: number;
  negative_marking_percentage: number;
  proctoring_enabled: boolean;
  proctoring_config: {
    require_webcam: boolean;
    require_microphone: boolean;
    require_fullscreen: boolean;
    block_tab_switch: boolean;
    block_copy_paste: boolean;
    max_tab_switches_warning?: number;
    record_audio_spikes?: boolean;
  };
  certificate_eligible: boolean;
  question_count: number;
  user_attempts_count?: number;
  user_best_score?: number | null;
  user_has_passed?: boolean;
}

export interface ExamQuestionOptionItem {
  id: string;
  text: string;
}

export interface ExamQuestionItem {
  id: string;
  question_number: number;
  question_type: "MCQ" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "DESCRIPTIVE" | "SCENARIO" | "CASE_STUDY" | "NUMERICAL" | "CODE";
  prompt: string;
  scenario?: string | null;
  code_snippet?: string | null;
  options?: ExamQuestionOptionItem[] | null;
  marks: number;
  competency_tag: string;
  topic: string;
}

export interface SavedAnswerState {
  question_id: string;
  selected_options: string[];
  text_response?: string | null;
  is_marked_for_review: boolean;
}

export interface ExamSessionResponse {
  attempt_id: string;
  examination_id: string;
  examination_title: string;
  course_name: string;
  attempt_number: number;
  status: string;
  started_at: string;
  expires_at: string;
  server_time: string;
  time_remaining_seconds: number;
  duration_minutes: number;
  proctoring_enabled: boolean;
  proctoring_config: Record<string, any>;
  questions: ExamQuestionItem[];
  saved_answers: Record<string, SavedAnswerState>;
}

export interface ProctoringEventItem {
  id: string;
  event_type: string;
  severity: string;
  timestamp: string;
  metadata_payload: Record<string, any>;
}

export interface QuestionResultItem {
  question_id: string;
  question_number: number;
  prompt: string;
  question_type: string;
  marks: number;
  marks_awarded: number;
  is_correct?: boolean | null;
  selected_options: string[];
  correct_answers: string[];
  explanation?: string | null;
  ai_feedback?: string | null;
  competency_tag: string;
  topic: string;
}

export interface CompetencyPerformanceItem {
  competency_tag: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  proficiency_level: "Mastered" | "Proficient" | "Developing" | "Needs Focus";
}

export interface ExamResultDetail {
  attempt_id: string;
  examination_id: string;
  title: string;
  course_name: string;
  module_name: string;
  track: string;
  attempt_number: number;
  total_marks: number;
  score_obtained: number;
  percentage: number;
  is_passed: boolean;
  passing_percentage: number;
  status: string;
  started_at: string;
  submitted_at: string;
  time_taken_seconds: number;
  question_breakdown: QuestionResultItem[];
  competency_performance: CompetencyPerformanceItem[];
  knowledge_gaps: string[];
  strengths: string[];
  ai_learning_recommendations?: {
    status: string;
    weak_areas: string[];
    strong_areas: string[];
    recommended_modules: {
      competency: string;
      title: string;
      recommended_action: string;
      estimated_hours: number;
    }[];
    practice_actions: string[];
    revision_schedule: string;
    suggest_retake: boolean;
  } | null;
  certificate_id?: string | null;
  certificate_number?: string | null;
  can_retake: boolean;
  attempts_remaining: number;
}

export interface ExamCertificateData {
  certificate_id: string;
  certificate_number: string;
  title: string;
  recipient_name: string;
  course_name: string;
  score_percentage: number;
  issued_at: string;
  credential_hash: string;
  verification_url: string;
}

export interface AdminReviewItem {
  attempt_id: string;
  user_id: string;
  candidate_name: string;
  candidate_email: string;
  examination_title: string;
  course_name: string;
  attempt_number: number;
  started_at: string;
  submitted_at?: string | null;
  score_obtained: number;
  total_marks: number;
  percentage: number;
  is_passed: boolean;
  status: string;
  integrity_risk_category: "NORMAL" | "LOW" | "MODERATE" | "HIGH" | "INCONCLUSIVE";
  event_count: number;
  reviewer_decision: string;
}

export interface AdminReviewDetail {
  attempt_id: string;
  user_id: string;
  candidate_name: string;
  candidate_email: string;
  examination_title: string;
  course_name: string;
  attempt_number: number;
  status: string;
  score_obtained: number;
  percentage: number;
  is_passed: boolean;
  integrity_risk_category: string;
  integrity_summary?: Record<string, any> | null;
  events: ProctoringEventItem[];
  reviewer_decision: string;
  reviewer_notes?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
}

export interface ExamAnalyticsData {
  total_examinations: number;
  total_attempts: number;
  completion_rate: number;
  pass_rate: number;
  average_score_percentage: number;
  integrity_risk_distribution: Record<string, number>;
  top_knowledge_gaps: { skill: string; frequency: number; track: string }[];
  recent_flagged_count: number;
}

