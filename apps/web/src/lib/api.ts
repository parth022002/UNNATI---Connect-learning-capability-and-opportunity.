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

  // ============================================================================
  // RESUME INTELLIGENCE, ATS & JOB DESCRIPTION MATCHING APIS
  // ============================================================================

  async getResumes(token: string): Promise<ResumeListItem[]> {
    return request<ResumeListItem[]>("/api/v1/resumes", { method: "GET" }, token);
  },

  async createResume(
    token: string,
    data: { title: string; target_role?: string; template_id?: string; import_from_profile?: boolean }
  ): Promise<ResumeDetail> {
    return request<ResumeDetail>("/api/v1/resumes", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  },

  async uploadAndParseResume(
    token: string,
    file: File,
    title?: string,
    targetRole?: string,
    templateId?: string
  ): Promise<ResumeDetail> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (targetRole) formData.append("target_role", targetRole);
    if (templateId) formData.append("template_id", templateId);

    const res = await fetch(`${API_BASE_URL}/api/v1/resumes/upload-and-parse`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to upload and parse resume.");
    }
    return res.json();
  },

  async getResumeDetail(token: string, resumeId: string): Promise<ResumeDetail> {
    return request<ResumeDetail>(`/api/v1/resumes/${resumeId}`, { method: "GET" }, token);
  },

  async updateResume(
    token: string,
    resumeId: string,
    data: { title?: string; target_role?: string; template_id?: string; is_primary?: boolean }
  ): Promise<ResumeListItem> {
    return request<ResumeListItem>(`/api/v1/resumes/${resumeId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token);
  },

  async deleteResume(token: string, resumeId: string): Promise<void> {
    return request<void>(`/api/v1/resumes/${resumeId}`, { method: "DELETE" }, token);
  },

  async duplicateResume(token: string, resumeId: string): Promise<ResumeDetail> {
    return request<ResumeDetail>(`/api/v1/resumes/${resumeId}/duplicate`, { method: "POST" }, token);
  },

  async saveResumeVersion(token: string, resumeId: string, versionData: any): Promise<ResumeVersionData> {
    return request<ResumeVersionData>(`/api/v1/resumes/${resumeId}/versions`, {
      method: "POST",
      body: JSON.stringify(versionData),
    }, token);
  },

  async runResumeATSCheck(token: string, resumeId: string): Promise<ATSReportData> {
    return request<ATSReportData>(`/api/v1/resumes/${resumeId}/ats-check`, { method: "POST" }, token);
  },

  async getResumeATSReports(token: string, resumeId: string): Promise<ATSReportData[]> {
    return request<ATSReportData[]>(`/api/v1/resumes/${resumeId}/ats-reports`, { method: "GET" }, token);
  },

  async getAIAssistance(
    token: string,
    data: { action_type: string; context_text: string; role_or_target?: string }
  ): Promise<{ action_type: string; original: string; enhanced: string; explanation: string; metrics_introduced: boolean }> {
    return request<{ action_type: string; original: string; enhanced: string; explanation: string; metrics_introduced: boolean }>(
      "/api/v1/resumes/ai-assist",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async getJobDescriptions(token: string): Promise<JobDescriptionItem[]> {
    return request<JobDescriptionItem[]>("/api/v1/resumes/job-descriptions", { method: "GET" }, token);
  },

  async createJobDescription(
    token: string,
    data: { title: string; company?: string; location?: string; raw_text: string; experience_requirement_years?: number }
  ): Promise<JobDescriptionItem> {
    return request<JobDescriptionItem>("/api/v1/resumes/job-descriptions", {
      method: "POST",
      body: JSON.stringify(data),
    }, token);
  },

  async uploadJobDescription(
    token: string,
    file: File,
    title?: string,
    company?: string
  ): Promise<JobDescriptionItem> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (company) formData.append("company", company);

    const res = await fetch(`${API_BASE_URL}/api/v1/resumes/job-descriptions/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Failed to upload and parse job description.");
    }
    return res.json();
  },

  async deleteJobDescription(token: string, jdId: string): Promise<void> {
    return request<void>(`/api/v1/resumes/job-descriptions/${jdId}`, { method: "DELETE" }, token);
  },

  async matchResumeWithJD(token: string, resumeId: string, jdId: string): Promise<ResumeJDMatchData> {
    return request<ResumeJDMatchData>(`/api/v1/resumes/${resumeId}/match-jd/${jdId}`, { method: "POST" }, token);
  },

  async compareResumeMultipleJDs(token: string, resumeId: string): Promise<ResumeCompareMatrixData> {
    return request<ResumeCompareMatrixData>(`/api/v1/resumes/${resumeId}/compare-jds`, { method: "POST" }, token);
  },

  getResumeExportUrl(resumeId: string, format: "pdf" | "docx"): string {
    return `${API_BASE_URL}/api/v1/resumes/${resumeId}/export/${format}`;
  },

  // ============================================================================
  // AI INTERVIEW PREPARATION & REALISTIC SIMULATION STUDIO APIS
  // ============================================================================

  async getInterviewDashboard(token: string): Promise<InterviewStudioDashboardData> {
    return request<InterviewStudioDashboardData>("/api/v1/interviews/studio/dashboard", { method: "GET" }, token);
  },

  async createInterviewSession(
    token: string,
    data: {
      target_role: string;
      interview_mode: string;
      difficulty_level?: string;
      target_duration_minutes?: number;
      voice_mode_enabled?: boolean;
      resume_id?: string;
      job_description_id?: string;
      custom_focus_areas?: string[];
    }
  ): Promise<InterviewSessionDetail> {
    return request<InterviewSessionDetail>(
      "/api/v1/interviews/sessions",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async getInterviewSession(token: string, sessionId: string): Promise<InterviewSessionDetail> {
    return request<InterviewSessionDetail>(`/api/v1/interviews/sessions/${sessionId}`, { method: "GET" }, token);
  },

  async submitInterviewAnswer(
    token: string,
    sessionId: string,
    questionId: string,
    data: {
      candidate_response: string;
      turn_type?: string;
      input_mode?: string;
      response_duration_seconds?: number;
    }
  ): Promise<InterviewTurnItem> {
    return request<InterviewTurnItem>(
      `/api/v1/interviews/sessions/${sessionId}/questions/${questionId}/answer`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      token
    );
  },

  async finishInterviewSession(token: string, sessionId: string): Promise<InterviewReportData> {
    return request<InterviewReportData>(
      `/api/v1/interviews/sessions/${sessionId}/finish`,
      {
        method: "POST",
      },
      token
    );
  },

  async getInterviewReport(token: string, sessionId: string): Promise<InterviewReportData> {
    return request<InterviewReportData>(
      `/api/v1/interviews/sessions/${sessionId}/report`,
      {
        method: "GET",
      },
      token
    );
  },

  async deleteInterviewSession(token: string, sessionId: string): Promise<void> {
    return request<void>(`/api/v1/interviews/sessions/${sessionId}`, { method: "DELETE" }, token);
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

export interface ResumeListItem {
  id: string;
  user_id: string;
  title: string;
  target_role?: string | null;
  is_primary: boolean;
  template_id: string;
  latest_ats_score?: number | null;
  version_count: number;
  created_at: string;
  updated_at: string;
}

export interface PersonalInfoData {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
}

export interface WorkExperienceData {
  id?: string;
  company: string;
  role: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  highlights: string[];
}

export interface EducationData {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  start_year?: number;
  end_year?: number;
  grade?: string;
}

export interface ProjectData {
  id?: string;
  title: string;
  role?: string;
  description: string;
  technologies: string[];
  link?: string;
  highlights: string[];
}

export interface CertificationData {
  id?: string;
  name: string;
  issuer?: string;
  issue_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface InternshipData {
  id?: string;
  company: string;
  role: string;
  duration?: string;
  highlights: string[];
}

export interface ResumeVersionData {
  id: string;
  resume_id: string;
  version_number: number;
  version_label: string;
  template_id: string;
  personal_info: PersonalInfoData;
  professional_summary?: string | null;
  headline?: string | null;
  work_experience: WorkExperienceData[];
  education: EducationData[];
  technical_skills: string[];
  business_skills: string[];
  projects: ProjectData[];
  internships: InternshipData[];
  certifications: CertificationData[];
  achievements: string[];
  publications: Record<string, any>[];
  leadership: Record<string, any>[];
  languages: { language: string; proficiency: string }[];
  section_config: Record<string, any>;
  latest_ats_score?: number | null;
  is_published: boolean;
  created_at: string;
}

export interface ResumeDetail {
  id: string;
  user_id: string;
  title: string;
  target_role?: string | null;
  is_primary: boolean;
  template_id: string;
  current_version?: ResumeVersionData | null;
  versions: ResumeVersionData[];
  latest_ats_score?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ATSReportData {
  id: string;
  resume_id: string;
  resume_version_id?: string | null;
  overall_score: number;
  readiness_level: "Exceptional" | "Competitive" | "Needs Improvement" | "Critical Issues";
  dimension_scores: Record<string, number>;
  formatting_warnings: { severity: "low" | "medium" | "high"; message: string }[];
  missing_sections: string[];
  weak_bullet_points: { original: string; section: string; context?: string; issue: string; suggestion: string }[];
  grammar_spelling_issues: Record<string, any>[];
  recommended_keywords: string[];
  actionable_recommendations: { title: string; description: string }[];
  created_at: string;
}

export interface JobDescriptionItem {
  id: string;
  user_id: string;
  title: string;
  company?: string | null;
  location?: string | null;
  employment_type?: string | null;
  experience_requirement_years?: number | null;
  source_url?: string | null;
  raw_text: string;
  extracted_intelligence: {
    mandatory_skills?: string[];
    preferred_skills?: string[];
    tools_technologies?: string[];
    domain_knowledge?: string[];
    seniority_level?: string;
    education_requirement?: string;
    key_responsibilities?: string[];
  };
  created_at: string;
}

export interface ResumeJDMatchData {
  id: string;
  resume_id: string;
  resume_version_id: string;
  job_description_id: string;
  job_title: string;
  company?: string | null;
  overall_match_score: number;
  skill_alignment_score: number;
  experience_alignment_score: number;
  education_alignment_score: number;
  project_relevance_score: number;
  keyword_coverage_score: number;
  matched_skills: { name: string; evidence_type: "DIRECT_EXPERIENCE" | "PROJECT" | "INFERRED"; evidence_label: string; is_mandatory: boolean; confidence: number }[];
  partially_matched_skills: { name: string; matched_as?: string; reason: string; is_mandatory: boolean }[];
  missing_skills: { name: string; is_mandatory: boolean; category: string }[];
  mandatory_gaps: string[];
  preferred_gaps: string[];
  improvement_suggestions: { section: string; context?: string; original: string; suggested: string; reason: string; expected_impact: string }[];
  learning_recommendations: { skill: string; module_name: string; roadmap_action: string; urgency: string; estimated_hours: number }[];
  created_at: string;
}

export interface MultipleJDCompareItem {
  job_id: string;
  job_title: string;
  company?: string | null;
  overall_match_score: number;
  strongest_area: string;
  main_gap: string;
  mandatory_unmet_count: number;
}

export interface ResumeCompareMatrixData {
  resume_id: string;
  resume_title: string;
  target_role?: string | null;
  comparisons: MultipleJDCompareItem[];
}

// ============================================================================
// AI INTERVIEW SIMULATION STUDIO TYPES
// ============================================================================

export interface InterviewSessionListItem {
  id: string;
  user_id: string;
  target_role: string;
  interview_mode: string;
  difficulty_level: string;
  target_duration_minutes: number;
  status: string;
  overall_score?: number | null;
  readiness_tier?: string | null;
  question_count: number;
  created_at: string;
  completed_at?: string | null;
}

export interface InterviewTurnItem {
  id: string;
  question_id: string;
  turn_type: string;
  input_mode: string;
  candidate_response: string;
  score?: number | null;
  score_rationale?: string | null;
  dimension_scores?: {
    technical_depth: number;
    communication_clarity: number;
    problem_solving: number;
    role_competency: number;
    star_rigor: number;
  } | null;
  strengths?: string[] | null;
  improvement_areas?: string[] | null;
  star_analysis?: {
    situation_present: boolean;
    task_present: boolean;
    action_present: boolean;
    result_quantified: boolean;
    feedback: string;
  } | null;
  suggested_follow_up?: string | null;
  ideal_refinement?: string | null;
  created_at: string;
}

export interface InterviewQuestionItem {
  id: string;
  session_id: string;
  order_index: number;
  question_text: string;
  question_type: string;
  category: string;
  target_competency: string;
  difficulty: string;
  ideal_approach?: string | null;
  rubric_criteria?: string[] | null;
  is_answered: boolean;
  created_at: string;
  turns: InterviewTurnItem[];
}

export interface InterviewSessionDetail {
  id: string;
  user_id: string;
  target_role: string;
  interview_mode: string;
  difficulty_level: string;
  target_duration_minutes: number;
  status: string;
  overall_score?: number | null;
  readiness_tier?: string | null;
  technical_score?: number | null;
  hr_score?: number | null;
  voice_mode_enabled: boolean;
  grounded_resume_id?: string | null;
  grounded_jd_id?: string | null;
  questions: InterviewQuestionItem[];
  performance_report?: any | null;
  created_at: string;
  completed_at?: string | null;
}

export interface CompetencyBreakdownItem {
  competency: string;
  category: string;
  score: number;
  level: string;
  feedback: string;
}

export interface StarRigorSummary {
  situation_adherence: number;
  task_clarity: number;
  action_depth: number;
  metric_quantification: number;
  summary: string;
}

export interface RoadmapRecommendationItem {
  competency: string;
  target_role: string;
  suggested_module: string;
  action_type: string;
  urgency: string;
}

export interface QuestionReviewItem {
  question_id: string;
  order_index: number;
  question_text: string;
  question_type: string;
  category: string;
  target_competency: string;
  candidate_response: string;
  score: number;
  dimension_scores: Record<string, number>;
  strengths: string[];
  improvement_areas: string[];
  star_analysis: any;
  follow_up_prompt?: string | null;
  follow_up_response?: string | null;
  ideal_refinement?: string | null;
}

export interface InterviewReportData {
  session_id: string;
  target_role: string;
  interview_mode: string;
  difficulty_level: string;
  overall_score: number;
  readiness_tier: string;
  technical_score: number;
  hr_score: number;
  total_questions_answered: number;
  dimension_averages: Record<string, number>;
  executive_summary: string;
  top_strengths: string[];
  priority_improvements: string[];
  competency_breakdown: CompetencyBreakdownItem[];
  star_rigor_summary: StarRigorSummary;
  roadmap_recommendations: RoadmapRecommendationItem[];
  question_reviews: QuestionReviewItem[];
  completed_at: string;
}

export interface InterviewStudioDashboardData {
  total_interviews_completed: number;
  average_readiness_score: number;
  overall_readiness_tier: string;
  technical_readiness_average: number;
  hr_readiness_average: number;
  competencies_mastered_count: number;
  recent_sessions: InterviewSessionListItem[];
  recommended_practice: {
    role: string;
    mode: string;
    priority_reason: string;
    recommended_difficulty: string;
  }[];
  active_session?: InterviewSessionListItem | null;
}

