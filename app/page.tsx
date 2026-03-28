"use client";
import TriageTool from "@/components/TriageTool";
import styles from "./page.module.css";

const features = [
  {
    icon: "🧠",
    title: "Adaptive AI Triage",
    desc: "Dynamic follow-up questions that adapt to your situation. No binary yes/no — real context-aware analysis.",
  },
  {
    icon: "🚨",
    title: "Emergency Detection",
    desc: "Instantly identifies life-threatening symptoms and triggers high-priority action protocols.",
  },
  {
    icon: "📋",
    title: "Action-Based Guidance",
    desc: "Step-by-step actions, not just information. Focused on what you do right now.",
  },
  {
    icon: "🔁",
    title: "Recovery Loop",
    desc: "Check in after initial steps. AI re-evaluates and adjusts recommendations as your condition changes.",
  },
  {
    icon: "🩺",
    title: "Doctor Finder",
    desc: "Powered by Exa search — finds relevant specialists near you with real-time data.",
  },
  {
    icon: "⚡",
    title: "Built for Stress",
    desc: "Minimal cognitive load. Large targets, clear language, no clutter — works when your hands are shaking.",
  },
];

const stats = [
  { value: "< 90s", label: "To first action plan" },
  { value: "3", label: "Crisis types covered" },
  { value: "AI", label: "Powered by Groq + Claude" },
];

export default function Home() {
  return (
    <main className={styles.main}>
      {/* NAV */}
      <nav className={styles.nav}>
        <div className="container">
          <div className={styles.navInner}>
            <div className={styles.logo}>
              Crisis<span>Copilot</span>
            </div>
            <div className={styles.navLinks}>
              <a href="#how-it-works">How it works</a>
              <a href="#features">Features</a>
              <a href="#triage" className={styles.navCta}>
                Start Triage →
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className="container-sm">
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            AI-Powered Crisis Response
          </div>
          <h1 className={styles.heroH1}>
            The first minutes
            <br />
            <em>define the outcome.</em>
          </h1>
          <p className={styles.heroSub}>
            Crisis Copilot is not a chatbot. It's a guided decision system that helps you take the
            right action in critical moments — medical, legal, or personal.
          </p>
          <div className={styles.heroActions}>
            <a href="#triage" className={styles.heroCta}>
              Start crisis triage →
            </a>
            <a href="#how-it-works" className={styles.heroSecondary}>
              See how it works
            </a>
          </div>
          <div className={styles.heroStats}>
            {stats.map((s) => (
              <div key={s.label} className={styles.statItem}>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howSection} id="how-it-works">
        <div className="container-sm">
          <div className={styles.sectionLabel}>How it works</div>
          <h2 className={styles.sectionH2}>From panic to clarity in under 2 minutes</h2>
          <div className={styles.flowSteps}>
            {[
              { n: "01", t: "Describe the crisis", d: "Tell us what's happening in plain words." },
              { n: "02", t: "Adaptive follow-ups", d: "AI asks targeted questions to understand severity." },
              { n: "03", t: "Urgency classification", d: "LOW / MODERATE / EMERGENCY — instantly." },
              { n: "04", t: "Action plan", d: "Step-by-step instructions for right now." },
              { n: "05", t: "Recovery check-in", d: "AI re-evaluates as your condition changes." },
            ].map((step, i) => (
              <div key={i} className={styles.flowStep}>
                <div className={styles.flowNum}>{step.n}</div>
                <div>
                  <div className={styles.flowTitle}>{step.t}</div>
                  <div className={styles.flowDesc}>{step.d}</div>
                </div>
                {i < 4 && <div className={styles.flowArrow}>↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRIAGE TOOL */}
      <section className={styles.triageSection} id="triage">
        <div className="container-sm">
          <div className={styles.sectionLabel}>Live tool</div>
          <h2 className={styles.sectionH2}>Start your triage now</h2>
          <p className={styles.sectionSub}>
            Real AI analysis. Your session is saved so you can track recovery over time.
          </p>
          <TriageTool />
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.featuresSection} id="features">
        <div className="container">
          <div className={styles.sectionLabel}>Features</div>
          <h2 className={styles.sectionH2}>Built differently</h2>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerInner}>
            <div className={styles.logo}>
              Crisis<span>Copilot</span>
            </div>
            <p className={styles.footerNote}>
              Built at Cursor Hackathon Kashmir 2026 · NIT Srinagar
            </p>
            <p className={styles.footerDisclaimer}>
              Crisis Copilot is an AI tool and does not replace professional medical or legal advice.
              In life-threatening emergencies, call 112 immediately.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
