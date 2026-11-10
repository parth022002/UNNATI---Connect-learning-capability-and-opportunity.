import Link from "next/link";
import { SignInButton, SignUpButton, Show, UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

const pillars = [
  { number: "01", title: "Discover your direction", text: "Explore career paths that connect your interests, education and strengths." },
  { number: "02", title: "Understand your skill gaps", text: "See the capabilities and prerequisites that matter for your target role." },
  { number: "03", title: "Build your roadmap", text: "Turn a career goal into an ordered, practical learning journey." },
  { number: "04", title: "Make progress visible", text: "Track learning, projects and readiness as you move forward." }
];

export default function Home() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-2xl font-black tracking-tight text-unnati-indigo">UNNATI<span className="text-unnati-saffron">.</span></Link>
        <nav className="hidden gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#about">About</a>
        </nav>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="h-9 w-20 animate-pulse rounded-full bg-slate-100" />}>
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-slate-700 hover:text-unnati-violet">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-unnati-indigo px-5 py-2 text-sm font-semibold text-white hover:bg-unnati-violet transition">
                  Get started
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-3">
                <OrganizationSwitcher
                  afterCreateOrganizationUrl="/dashboard"
                  afterLeaveOrganizationUrl="/dashboard"
                  afterSelectOrganizationUrl="/dashboard"
                />
                <UserButton />
              </div>
            </Show>
          </Suspense>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-16 md:grid-cols-[1.1fr_.9fr] md:items-center md:pt-24">
        <div>
          <p className="mb-5 inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[.18em] text-unnati-indigo">Your Growth Companion</p>
          <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-tight text-unnati-midnight md:text-7xl">Your potential deserves a <span className="text-unnati-violet">path forward.</span></h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">Discover your strengths, build relevant skills and turn your career ambitions into meaningful progress.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Suspense fallback={<div className="h-12 w-40 animate-pulse rounded-full bg-orange-100" />}>
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button className="rounded-full bg-unnati-saffron px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-200 hover:brightness-95 transition">
                    Start your journey
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <Link href="/dashboard" className="rounded-full bg-unnati-saffron px-7 py-3.5 font-bold text-white shadow-lg shadow-orange-200 hover:brightness-95 transition">
                  Go to Dashboard
                </Link>
              </Show>
            </Suspense>
            <a href="#how-it-works" className="rounded-full border border-slate-300 bg-white px-7 py-3.5 font-bold text-unnati-indigo hover:border-unnati-violet">Explore how it works</a>
          </div>
          <p className="mt-8 text-sm text-slate-500">Learn. Build. Grow. Succeed.</p>
        </div>
        <div className="relative rounded-[2rem] border border-violet-100 bg-white p-8 shadow-2xl shadow-violet-100">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-orange-100 blur-2xl" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-widest text-unnati-violet">Your growth journey</p>
            <div className="mt-7 space-y-5">
              {["Discover your career direction", "Identify the skills you need", "Follow a personalised roadmap", "Showcase your capabilities"].map((item, i) => (
                <div key={item} className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-black text-unnati-indigo">{i + 1}</span>
                  <span className="font-semibold text-slate-800">{item}</span>
                </div>
              ))}
            </div>
            <div className="mt-7 rounded-2xl bg-gradient-to-r from-unnati-indigo to-unnati-violet p-5 text-white">
              <p className="text-sm text-violet-100">Small steps. Meaningful progress.</p>
              <p className="mt-1 text-2xl font-black">Your next chapter starts here.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-bold uppercase tracking-widest text-unnati-violet">A clearer way forward</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-unnati-midnight md:text-5xl">Growth is a journey. Make every step count.</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => <article key={p.number} className="rounded-3xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-xl">
              <p className="text-sm font-black text-unnati-saffron">{p.number}</p><h3 className="mt-5 text-xl font-bold text-unnati-indigo">{p.title}</h3><p className="mt-3 leading-7 text-slate-600">{p.text}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] bg-unnati-midnight p-8 text-white md:p-14">
          <p className="text-sm font-bold uppercase tracking-widest text-orange-300">Built around your progress</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-black md:text-5xl">One connected ecosystem for career growth.</h2>
          <div className="mt-9 grid gap-6 text-slate-300 md:grid-cols-3">
            <div><h3 className="font-bold text-white">Learn</h3><p className="mt-2">Build skills through guided learning and practical projects.</p></div>
            <div><h3 className="font-bold text-white">Discover</h3><p className="mt-2">Explore roles, sectors and pathways that fit your goals.</p></div>
            <div><h3 className="font-bold text-white">Advance</h3><p className="mt-2">Track readiness and connect capability to opportunity.</p></div>
          </div>
        </div>
      </section>

      <section id="get-started" className="px-6 pb-20">
        <div className="mx-auto max-w-4xl rounded-[2rem] bg-violet-50 px-8 py-14 text-center">
          <h2 className="text-3xl font-black text-unnati-indigo md:text-4xl">Your growth starts with one step.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">UNNATI is being built to help people turn potential into progress.</p>
          <a href="mailto:hello@unnati.example" className="mt-7 inline-flex rounded-full bg-unnati-indigo px-7 py-3.5 font-bold text-white">Contact the team</a>
        </div>
      </section>
      <footer id="about" className="border-t border-slate-200 bg-white px-6 py-8 text-center text-sm text-slate-500">© {new Date().getFullYear()} UNNATI. Your Growth Companion.</footer>
    </main>
  );
}
