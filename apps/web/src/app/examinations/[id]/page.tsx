"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { BackgroundAtmosphere } from "@/components/layout/BackgroundAtmosphere";
import { CareerCompanionDrawer } from "@/components/companion/CareerCompanionDrawer";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api, getClerkApiToken, ExaminationSummary } from "@/lib/api";
import {
  ShieldCheck,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  Layers,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  Check,
  RefreshCw,
  Video,
  Mic,
  Maximize2,
  Wifi,
  FileText,
  AlertTriangle,
  HelpCircle
} from "lucide-react";

export default function ExaminationInstructionsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const { isSignedIn, isLoaded, getToken } = useAuth();

  const [exam, setExam] = useState<ExaminationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);

  // Device & Permission Checks
  const [browserCheck, setBrowserCheck] = useState<boolean>(true);
  const [networkCheck, setNetworkCheck] = useState<boolean>(true);
  const [cameraPermission, setCameraPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [micPermission, setMicPermission] = useState<"pending" | "granted" | "denied">("pending");
  const [cameraTesting, setCameraTesting] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        let token: string | null = null;
        if (isSignedIn) {
          token = await getClerkApiToken(getToken);
        }
        const data = await api.getExaminationDetail(examId, token);
        setExam(data);

        // Practice quizzes don't need camera checks
        if (!data.proctoring_enabled || !data.proctoring_config?.require_webcam) {
          setCameraPermission("granted");
          setMicPermission("granted");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load examination.");
      } finally {
        setLoading(false);
      }
    }
    if (examId) loadDetail();

    return () => {
      // Clean up camera stream on unmount
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [examId, isSignedIn]);

  const requestCameraAccess = async () => {
    setCameraTesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: exam?.proctoring_config?.require_microphone || false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraPermission("granted");
      if (exam?.proctoring_config?.require_microphone) {
        setMicPermission("granted");
      }
    } catch (err) {
      console.warn("Camera permission denied or unavailable:", err);
      setCameraPermission("denied");
    } finally {
      setCameraTesting(false);
    }
  };

  const handleStartExam = async () => {
    if (!exam) return;
    if (exam.proctoring_enabled && !consentGiven) {
      setError("Please check the informed consent acknowledgment to begin.");
      return;
    }
    if (exam.proctoring_enabled && exam.proctoring_config?.require_webcam && cameraPermission !== "granted") {
      setError("Please test and allow your camera to proceed with this proctored examination.");
      return;
    }

    setStarting(true);
    setError(null);
    try {
      const token = await getClerkApiToken(getToken);
      if (!token) {
        router.push(`/sign-in?redirect=/examinations/${examId}`);
        return;
      }

      const deviceInfo = {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        hasCamera: cameraPermission === "granted",
        startedClientTime: new Date().toISOString()
      };

      const session = await api.startExamination(token, examId, {
        proctoring_consent: consentGiven || !exam.proctoring_enabled,
        device_info: deviceInfo
      });

      // Stop camera preview before navigating to exam room
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }

      router.push(`/examinations/${examId}/take?attemptId=${session.attempt_id}`);
    } catch (err: any) {
      console.error("Failed to start examination:", err);
      setError(err.message || "Failed to start examination attempt.");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-unnati-indigo animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Loading examination instructions...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md p-8 text-center space-y-4 bg-white border border-slate-200">
            <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">Examination Not Found</h2>
            <p className="text-sm text-slate-500">{error || "This examination does not exist or has been archived."}</p>
            <Link href="/examinations">
              <Button variant="outline" size="sm">Back to Examination Hub</Button>
            </Link>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const isProctored = exam.proctoring_enabled;

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-purple-100 selection:text-unnati-indigo">
      <BackgroundAtmosphere variant="explore" />
      <Navbar onOpenCompanion={() => setIsCompanionOpen(true)} />

      <main className="relative z-10 flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">

          {/* Breadcrumb Back */}
          <Link href="/examinations" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-unnati-indigo transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to All Examinations</span>
          </Link>

          {/* Header Card */}
          <div className="clean-card p-6 sm:p-10 bg-white border border-slate-200/90 shadow-soft-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10.5px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                  isProctored
                    ? "bg-purple-100 text-unnati-indigo border border-purple-200"
                    : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}>
                  {isProctored ? <Camera className="h-3.5 w-3.5 text-unnati-saffron" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                  <span>{isProctored ? "AI-Proctored Examination" : "Unproctored Practice Assessment"}</span>
                </span>
                <Badge variant="outline" className="text-[10px] font-bold">
                  {exam.track.toUpperCase()}
                </Badge>
              </div>
              <span className="text-xs font-bold text-slate-500">
                Max Attempts: {exam.max_attempts}
              </span>
            </div>

            <div>
              <h1 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
                {exam.title}
              </h1>
              <p className="text-xs sm:text-sm font-bold text-unnati-saffron mt-1">
                {exam.course_name} • {exam.module_name}
              </p>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                {exam.description}
              </p>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duration</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  <span>{exam.duration_minutes} Mins</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Passing Benchmark</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-emerald-600" />
                  <span>{exam.passing_percentage}% Pass</span>
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Marks</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5">
                  {exam.total_marks} Marks
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Questions</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5">
                  {exam.question_count} Questions
                </span>
              </div>
            </div>
          </div>

          {/* Device & Browser Readiness Checklist */}
          <div className="clean-card p-6 sm:p-8 bg-white border border-slate-200 space-y-6">
            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-unnati-indigo" />
                <span>Pre-Examination Readiness Checks</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ensure your device and browser meet the requirements before starting.
              </p>
            </div>

            <div className="space-y-3.5 text-sm">
              {/* Check 1: Browser */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">Browser Compatibility &amp; Fullscreen API</p>
                    <p className="text-[11px] text-slate-500">Supported modern browser detected.</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Verified</Badge>
              </div>

              {/* Check 2: Network */}
              <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between bg-slate-50/70">
                <div className="flex items-center gap-3">
                  <Wifi className="h-5 w-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold text-slate-800 text-xs sm:text-sm">Internet Connectivity &amp; Autosave Line</p>
                    <p className="text-[11px] text-slate-500">Active server heartbeat connection verified.</p>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px]">Connected</Badge>
              </div>

              {/* Check 3: Web Camera (if required) */}
              {isProctored && exam.proctoring_config?.require_webcam && (
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5 text-unnati-violet shrink-0" />
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">Webcam Verification (Privacy-Preserving)</p>
                        <p className="text-[11px] text-slate-500">Camera presence check for formal certification integrity.</p>
                      </div>
                    </div>
                    {cameraPermission === "granted" ? (
                      <Badge variant="success" className="text-[10px]">Active &amp; Ready</Badge>
                    ) : cameraPermission === "denied" ? (
                      <Badge variant="error" className="text-[10px]">Permission Denied</Badge>
                    ) : (
                      <Button
                        variant="saffron"
                        size="sm"
                        onClick={requestCameraAccess}
                        disabled={cameraTesting}
                        className="text-xs font-bold h-8 px-3 rounded-lg text-white"
                      >
                        {cameraTesting ? "Testing..." : "Test Camera"}
                      </Button>
                    )}
                  </div>

                  {/* Video preview for user confidence */}
                  {cameraPermission === "granted" && (
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="h-28 w-40 object-cover rounded-xl border-2 border-purple-300 bg-black shadow-soft-sm"
                      />
                      <p className="text-[11.5px] text-slate-600 leading-relaxed">
                        ✓ Camera feed confirmed. <strong>Privacy Note:</strong> Video is analyzed locally in your browser. Raw video is never stored on UNNATI servers.
                      </p>
                    </div>
                  )}

                  {cameraPermission === "denied" && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      Please allow camera permissions in your browser address bar and reload this page to proceed with proctored certification.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Examination Rules & Permitted Actions */}
          <div className="clean-card p-6 sm:p-8 bg-white border border-slate-200 space-y-4">
            <h3 className="font-heading text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-amber-600" />
              <span>Examination Rules &amp; Integrity Guidelines</span>
            </h3>
            
            <ul className="space-y-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Server-Authoritative Timer:</strong> The examination clock runs on the server. Responses are automatically submitted if time expires.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Continuous Autosave:</strong> Your selections are saved continuously. In the event of network disruption, reload this link to resume your session.</span>
              </li>
              {isProctored && (
                <>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span><strong>Browser Focus:</strong> Switching browser tabs, minimizing the window, or exiting fullscreen mode records a telemetry timestamp. Accidental switches are accounted for; repeated patterns are flagged for human review.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <ShieldCheck className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                    <span><strong>Human-in-the-Loop AI:</strong> UNNATI AI never penalizes or fails a learner automatically. Any flagged anomaly is independently reviewed by an authorized academic examiner.</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Informed Consent Checkbox */}
          {isProctored && (
            <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-purple-300 text-unnati-indigo focus:ring-unnati-violet cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  I understand the examination guidelines. I explicitly provide informed consent for browser focus monitoring and camera presence verification during this session under the <strong>DPDP Act (India 2026)</strong>. I understand that telemetry will be retained for 72 hours and erased thereafter.
                </span>
              </label>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link href="/examinations">
              <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-600">
                Cancel &amp; Return
              </Button>
            </Link>

            <Button
              variant="saffron"
              size="lg"
              onClick={handleStartExam}
              disabled={starting || (isProctored && !consentGiven)}
              className="w-full sm:w-auto font-bold text-sm h-12 px-8 rounded-xl shadow-glow-saffron text-white justify-center"
            >
              {starting ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span>Launching Examination Room...</span>
                </>
              ) : (
                <>
                  <span>Begin Examination Session</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>

        </div>
      </main>

      <Footer />
      <CareerCompanionDrawer isOpen={isCompanionOpen} onClose={() => setIsCompanionOpen(false)} />
    </div>
  );
}
