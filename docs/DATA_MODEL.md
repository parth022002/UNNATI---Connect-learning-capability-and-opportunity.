# Initial data model

Core relational entities (initial design; implement migrations before production):
- User, UserProfile, ConsentRecord
- EducationRecord, Institution, Program, Course
- Document, DocumentVersion, ExtractionJob, ExtractedFact, ReviewDecision
- Skill, SkillAlias, SkillCategory, SkillEvidence
- CourseSkill, SkillPrerequisite
- CareerRole, RoleSkillRequirement, Sector, Company
- CareerGoal, SkillGap, Roadmap, RoadmapStep
- LearningResource, Project, Assessment, AssessmentAttempt
- ProgressEvent, Recommendation, AuditEvent

Graph relationships:
- (Course)-[:TEACHES]->(Skill)
- (Skill)-[:REQUIRES]->(Skill)
- (CareerRole)-[:REQUIRES {level, importance}]->(Skill)
- (Skill)-[:USED_IN]->(Sector)
- (LearningResource)-[:DEVELOPS]->(Skill)
- (Project)-[:DEMONSTRATES]->(Skill)

Store source evidence and provenance for extracted or inferred relationships.
