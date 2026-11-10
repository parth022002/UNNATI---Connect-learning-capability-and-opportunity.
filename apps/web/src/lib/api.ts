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
  }>;
  project_deliverable?: {
    title: string;
    description: string;
    rubric: string[];
  } | null;
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
};
