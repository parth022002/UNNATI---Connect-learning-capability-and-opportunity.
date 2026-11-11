from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.users import router as users_router
from app.api.routes.skills import router as skills_router
from app.api.routes.documents import router as documents_router
from app.api.routes.roadmaps import router as roadmaps_router
from app.api.routes.webhooks import router as webhooks_router
from app.api.routes.assessments import router as assessments_router
from app.api.routes.ai import router as ai_router
from app.api.routes.ecosystem import router as ecosystem_router
from app.api.routes.examinations import router as examinations_router
from app.api.routes.resumes import router as resumes_router

app = FastAPI(
    title="UNNATI (उन्नति) API",
    description="AI-powered career growth and talent intelligence platform API",
    version="1.0.0",
)

origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OWASP Security Headers Middleware (SEC-004)
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# Core Routers
app.include_router(health_router)
app.include_router(users_router)
app.include_router(skills_router)
app.include_router(documents_router)
app.include_router(roadmaps_router)
app.include_router(assessments_router)
app.include_router(ai_router)
app.include_router(webhooks_router)
app.include_router(ecosystem_router)
app.include_router(examinations_router)
app.include_router(resumes_router)

@app.get("/")
async def root():
    return {
        "name": "UNNATI (उन्नति) API",
        "tagline": "Your Growth Companion",
        "docs": "/docs",
        "health": "/health",
        "version": "1.0.0"
    }
