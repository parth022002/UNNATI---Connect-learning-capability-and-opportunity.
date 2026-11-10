import logging
from typing import Optional, List
import resend
from app.core.config import settings

logger = logging.getLogger(__name__)

def is_email_configured() -> bool:
    """Checks whether the Resend API key is registered."""
    return bool(settings.resend_api_key and settings.resend_api_key.startswith("re_"))

def send_email(
    to: str | List[str],
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> bool:
    """
    Sends a transactional email via Resend API.
    Returns True if sent successfully, False otherwise.
    Never raises an uncaught exception to caller.
    """
    if not is_email_configured():
        logger.info(f"[MOCK EMAIL] To: {to} | Subject: {subject}")
        return True

    resend.api_key = settings.resend_api_key

    try:
        to_list = [to] if isinstance(to, str) else to
        params: resend.Emails.SendParams = {
            "from": settings.email_from,
            "to": to_list,
            "subject": subject,
            "html": html_content,
        }
        if text_content:
            params["text"] = text_content

        response = resend.Emails.send(params)
        email_id = response.get("id") if isinstance(response, dict) else getattr(response, "id", None)
        logger.info(f"Transactional email sent successfully via Resend. ID: {email_id} to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to deliver email via Resend to {to}: {e}")
        return False

def send_welcome_email(to_email: str, candidate_name: str) -> bool:
    """Sends a branded welcome email to newly onboarded candidates."""
    subject = "Welcome to UNNATI — Learn. Build. Grow. Succeed."
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Welcome to UNNATI</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; color: #1e293b; }}
        .card {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }}
        .header {{ background: linear-gradient(135deg, #4C1D95 0%, #6D28D9 100%); padding: 32px 24px; text-align: center; color: #ffffff; }}
        .logo {{ font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }}
        .tagline {{ font-size: 14px; color: #cbd5e1; margin-top: 6px; }}
        .content {{ padding: 32px 24px; font-size: 15px; line-height: 1.6; }}
        .btn {{ display: inline-block; background-color: #EA580C; color: #ffffff !important; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0; }}
        .footer {{ padding: 20px 24px; background: #f1f5f9; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="logo">UNNATI (उन्नति)</h1>
          <div class="tagline">Your Growth Companion — Learn. Build. Grow. Succeed.</div>
        </div>
        <div class="content">
          <p>Hello <strong>{candidate_name}</strong>,</p>
          <p>Welcome to <strong>UNNATI</strong>! Your personalized career intelligence journey is now live.</p>
          <p>Here is what you can do next:</p>
          <ul>
            <li><strong>Complete your 5-step Profile:</strong> Map your education and academic background.</li>
            <li><strong>Upload your Resume:</strong> Let our AI extract your verified skills with 1-click application.</li>
            <li><strong>Unlock your Career Roadmap:</strong> Discover precise skill gap diagnostics and personalized milestones.</li>
          </ul>
          <div style="text-align: center;">
            <a href="https://unnati.vercel.app/dashboard" class="btn">Explore Your Dashboard</a>
          </div>
          <p style="color: #64748b; font-size: 13px;">If you have any questions, our support team is always here to help you succeed.</p>
        </div>
        <div class="footer">
          &copy; 2026 UNNATI. Built for ambitious learners.
        </div>
      </div>
    </body>
    </html>
    """
    text_content = f"Hello {candidate_name},\n\nWelcome to UNNATI — Your Growth Companion.\nVisit your dashboard to get started: https://unnati.vercel.app/dashboard"
    return send_email(to_email, subject, html_content, text_content)

def send_roadmap_ready_email(to_email: str, candidate_name: str, target_role: str, milestone_count: int) -> bool:
    """Notifies candidate that their Algorithm C learning roadmap has been generated."""
    subject = f"Your Learning Roadmap for {target_role} is Ready!"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: sans-serif; background: #f8fafc; padding: 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #fff; padding: 28px; border-radius: 8px; border: 1px solid #e2e8f0;">
        <h2 style="color: #6D28D9; margin-top: 0;">UNNATI Roadmap Ready</h2>
        <p>Hi <strong>{candidate_name}</strong>,</p>
        <p>Your personalized <strong>{target_role}</strong> learning roadmap with <strong>{milestone_count} milestones</strong> is ready for you!</p>
        <p><a href="https://unnati.vercel.app/roadmap" style="display: inline-block; background: #EA580C; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none;">View Your Learning Journey</a></p>
      </div>
    </body>
    </html>
    """
    return send_email(to_email, subject, html_content)
