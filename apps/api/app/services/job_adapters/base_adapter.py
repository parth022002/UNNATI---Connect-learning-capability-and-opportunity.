import re
import hashlib
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field


@dataclass
class NormalizedJobPayload:
    source_code: str
    external_job_id: str
    external_url: str
    portal_name: str
    title: str
    company_name: str
    company_logo_url: Optional[str]
    description_raw: str
    description_clean: str
    responsibilities: List[str]
    required_skills: List[str]
    preferred_skills: List[str]
    min_qualifications: Optional[str]
    experience_min_years: float
    experience_max_years: Optional[float]
    experience_level: str # ENTRY, MID, SENIOR, LEAD, EXECUTIVE, INTERNSHIP
    salary_min: Optional[float]
    salary_max: Optional[float]
    salary_currency: str
    salary_period: str
    employment_type: str # FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP
    workplace_type: str # REMOTE, HYBRID, ONSITE
    city: Optional[str]
    state_region: Optional[str]
    country: str
    category: str
    industry: Optional[str]
    is_direct_employer: bool
    posted_at: datetime
    expires_at: Optional[datetime] = None
    raw_metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def canonical_hash(self) -> str:
        """Computes deterministic deduplication hash."""
        norm_co = normalize_company_name(self.company_name)
        norm_ti = normalize_job_title(self.title)
        norm_loc = (self.city or "remote").lower().strip()
        work_type = self.workplace_type.upper().strip()
        raw_key = f"{norm_co}::{norm_ti}::{norm_loc}::{work_type}"
        return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()


def normalize_company_name(name: str) -> str:
    """Standardizes corporate suffixes and removes punctuation."""
    if not name:
        return "unknown"
    clean = name.lower().strip()
    # Remove common corporate suffixes
    clean = re.sub(r"\b(pvt\.?|private|ltd\.?|limited|inc\.?|llc\.?|corp\.?|corporation|technologies|solutions|services|group)\b", "", clean)
    clean = re.sub(r"[^\w\s]", "", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean or name.lower().strip()


def normalize_job_title(title: str) -> str:
    """Standardizes job titles for fuzzy clustering."""
    if not title:
        return "role"
    clean = title.lower().strip()
    clean = re.sub(r"\b(sr\.?|senior)\b", "senior", clean)
    clean = re.sub(r"\bjr\.?|junior\b", "junior", clean)
    clean = re.sub(r"\bsde\s*[-_]?\s*1\b|\bsde\s*i\b", "software development engineer i", clean)
    clean = re.sub(r"\bsde\s*[-_]?\s*2\b|\bsde\s*ii\b", "software development engineer ii", clean)
    clean = re.sub(r"\bfe\b|\bfront\s*end\b", "frontend", clean)
    clean = re.sub(r"\bbe\b|\bback\s*end\b", "backend", clean)
    clean = re.sub(r"\bapm\b", "associate product manager", clean)
    clean = re.sub(r"\bpm\b", "product manager", clean)
    clean = re.sub(r"\bba\b", "business analyst", clean)
    clean = re.sub(r"\bds\b", "data scientist", clean)
    clean = re.sub(r"[^\w\s]", "", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean


def normalize_city_name(city: Optional[str]) -> Optional[str]:
    """Standardizes Indian and global tech hub city names."""
    if not city:
        return None
    c = city.strip()
    c_lower = c.lower()
    if any(k in c_lower for k in ["bengaluru", "bangalore", "blr"]):
        return "Bengaluru"
    if any(k in c_lower for k in ["mumbai", "bombay"]):
        return "Mumbai"
    if any(k in c_lower for k in ["hyderabad", "hyd"]):
        return "Hyderabad"
    if any(k in c_lower for k in ["delhi", "new delhi", "ncr", "gurgaon", "gurugram", "noida"]):
        return "Delhi NCR"
    if any(k in c_lower for k in ["pune"]):
        return "Pune"
    if any(k in c_lower for k in ["chennai", "madras"]):
        return "Chennai"
    if any(k in c_lower for k in ["kolkata", "calcutta"]):
        return "Kolkata"
    if any(k in c_lower for k in ["ahmedabad"]):
        return "Ahmedabad"
    return c.title()


class BaseJobSourceAdapter(ABC):
    """Abstract source connector contract."""

    @property
    @abstractmethod
    def source_code(self) -> str:
        pass

    @property
    @abstractmethod
    def source_name(self) -> str:
        pass

    @property
    @abstractmethod
    def source_type(self) -> str:
        pass

    @property
    @abstractmethod
    def region(self) -> str:
        pass

    @property
    @abstractmethod
    def integration_method(self) -> str:
        pass

    @property
    @abstractmethod
    def compliance_notes(self) -> str:
        pass

    @abstractmethod
    def fetch_jobs(self, limit: int = 50) -> List[NormalizedJobPayload]:
        """Fetches and normalizes incoming job listings."""
        pass

