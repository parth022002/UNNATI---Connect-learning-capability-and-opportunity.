from app.db.base import Base
from app.models.user import User, UserProfile, EducationRecord, ExperienceRecord, ClerkWebhookEvent
from app.models.skill import CanonicalSkill, SkillAlias, CandidateSkill
from app.models.document import CandidateDocument
from app.models.roadmap import CareerRoadmap, RoadmapMilestone
from app.models.ecosystem import Institution, Cohort, CohortMember, Employer, Opportunity
from app.models.examination import (
    Examination,
    ExamQuestion,
    ExamAttempt,
    ExamAttemptAnswer,
    ExamProctoringEvent,
    ExamCertificate,
)
from app.models.resume import (
    Resume,
    ResumeVersion,
    ResumeATSReport,
    JobDescription,
    ResumeJDMatch,
)
from app.models.interview import (
    InterviewSession,
    InterviewQuestion,
    InterviewTurn,
)
from app.models.job import (
    JobSource,
    CanonicalJob,
    ExternalJobReference,
    JobSyncLog,
    UserJobPreferences,
    SavedJob,
    JobApplicationActivity,
    UserJobSearchHistory,
)
from app.models.learning import (
    LearningResource,
    UserLearningProgress,
    AssessmentReadinessLog,
)

__all__ = [
    "Base",
    "User",
    "UserProfile",
    "EducationRecord",
    "ExperienceRecord",
    "ClerkWebhookEvent",
    "CanonicalSkill",
    "SkillAlias",
    "CandidateSkill",
    "CandidateDocument",
    "CareerRoadmap",
    "RoadmapMilestone",
    "Institution",
    "Cohort",
    "CohortMember",
    "Employer",
    "Opportunity",
    "Examination",
    "ExamQuestion",
    "ExamAttempt",
    "ExamAttemptAnswer",
    "ExamProctoringEvent",
    "ExamCertificate",
    "Resume",
    "ResumeVersion",
    "ResumeATSReport",
    "JobDescription",
    "ResumeJDMatch",
    "InterviewSession",
    "InterviewQuestion",
    "InterviewTurn",
    "JobSource",
    "CanonicalJob",
    "ExternalJobReference",
    "JobSyncLog",
    "UserJobPreferences",
    "SavedJob",
    "JobApplicationActivity",
    "UserJobSearchHistory",
    "LearningResource",
    "UserLearningProgress",
    "AssessmentReadinessLog",
]

