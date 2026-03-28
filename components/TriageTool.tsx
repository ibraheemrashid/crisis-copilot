"use client";
import { useState } from "react";
import ActionPlan from "./ActionPlan";
import styles from "./TriageTool.module.css";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

type Stage = "select" | "describe" | "questions" | "analyzing" | "results";
type Urgency = "low" | "moderate" | "emergency";

interface TriageResult {
  urgency: Urgency;
  summary: string;
  actions: string[];
  callAction?: string;
}

const crisisTypes = [
  { id: "medical", icon: "🩺", label: "Medical", desc: "Symptoms, injury, illness" },
  { id: "legal", icon: "⚖️", label: "Legal", desc: "Arrest, accident, rights" },
  { id: "mental", icon: "🧠", label: "Mental Health", desc: "Panic, crisis, distress" },
  { id: "other", icon: "⚡", label: "Other", desc: "Any emergency situation" },
];

const followUpQuestions: Record<string, { q: string; opts: string[] }[]> = {
  medical: [
    {
      q: "How severe is your discomfort right now?",
      opts: ["Mild — noticeable but manageable", "Moderate — hard to ignore", "Severe — cannot function normally", "Critical — possible loss of consciousness"],
    },
    {
      q: "Are any of these present?",
      opts: ["Chest pain or tightness", "Difficulty breathing", "Bleeding that won't stop", "None of the above"],
    },
    {
      q: "How long has this been happening?",
      opts: ["Just started (< 5 min)", "30–60 minutes", "Several hours", "Days — getting worse"],
    },
  ],
  legal: [
    {
      q: "What is happening right now?",
      opts: ["Being detained or questioned", "Just had an accident", "Believe my rights are violated", "Received legal notice or summons"],
    },
    {
      q: "Are you in physical danger?",
      opts: ["Yes — immediate threat", "Feeling threatened or coerced", "No — legally complex but safe", "Unsure"],
    },
    {
      q: "Do you have a lawyer?",
      opts: ["Yes — contacting them now", "No but I can afford one", "No — need legal aid", "I don't know"],
    },
  ],
  mental: [
    {
      q: "How would you describe what you're feeling?",
      opts: ["Anxious and overwhelmed", "Panic attack symptoms", "Thoughts of self-harm", "Feeling disconnected from reality"],
    },
    {
      q: "Are you safe right now?",
      opts: ["Yes — physically safe", "Not sure", "In an unsafe environment", "With someone I trust"],
    },
    {
      q: "Have you experienced this before?",
      opts: ["First time", "Occasional episodes", "Frequent — have a plan", "Frequent — no plan"],
    },
  ],
  other: [
    {
      q: "How urgent is the situation?",
      opts: ["Immediate danger", "Escalating — could get worse", "Stable but need guidance", "Uncertain"],
    },
    {
      q: "Are others involved?",
      opts: ["Yes — others in danger", "Yes — others can help", "I'm alone", "In public with bystanders"],
    },
    {
      q: "Have emergency services been contacted?",
      opts: ["Yes — on the way", "No — unsure if needed", "Tried — no response", "Don't want to involve them"],
    },
  ],
};

export default function TriageTool() {
  const [stage, setStage] = useState<Stage>("select");
  const [crisisType, setCrisisType] = useState("");
  const [description, setDescription] = useState("");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analyzingStep, setAnalyzingStep] = useState(0);

  const saveSession = useMutation(api.sessions.create);

  const questions = followUpQuestions[crisisType] || followUpQuestions.other;

  function selectCrisis(id: string) {
    setCrisisType(id);
    setStage("describe");
  }

  function submitDescription() {
    if (!description.trim()) return;
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setStage("questions");
  }

  function selectOption(opt: string) {
    setSelected(opt);
  }

  function nextQuestion() {
    if (!selected) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      runAnalysis(newAnswers);
    }
  }

  function prevQuestion() {
    if (currentQ === 0) {
      setStage("describe");
    } else {
      setCurrentQ(currentQ - 1);
      setAnswers(answers.slice(0, -1));
      setSelected(answers[currentQ - 1] || null);
    }
  }

  async function runAnalysis(finalAnswers: string[]) {
    setStage("analyzing");
    setAnalyzingStep(0);

    const steps = [400, 900, 1600];
    steps.forEach((delay, i) => setTimeout(() => setAnalyzingStep(i + 1), delay));

    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisisType, description, answers: finalAnswers }),
      });
      const data = await response.json();

      // Save to Convex
      try {
        const id = await saveSession({
          crisisType,
          description,
          answers: finalAnswers,
          urgency: data.urgency,
          actions: data.actions,
          createdAt: Date.now(),
        });
        setSessionId(id);
      } catch (e) {
        console.error("Convex save failed:", e);
      }

      setTimeout(() => {
        setResult(data);
        setStage("results");
      }, 2200);
    } catch (err) {
      console.error(err);
      // Fallback result
      setResult({
        urgency: "moderate",
        summary: "Unable to connect to AI. Please check your API key and try again.",
        actions: ["Assess your safety first.", "Contact emergency services if needed.", "Retry the triage when connectivity is restored."],
      });
      setTimeout(() => setStage("results"), 2200);
    }
  }

  function reset() {
    setStage("select");
    setCrisisType("");
    setDescription("");
    setCurrentQ(0);
    setAnswers([]);
    setSelected(null);
    setResult(null);
  }

  return (
    <div className={styles.tool}>

      {/* SELECT CRISIS TYPE */}
      {stage === "select" && (
        <div className={styles.selectStage}>
          <div className={styles.stageTitle}>What type of crisis are you facing?</div>
          <div className={styles.crisisGrid}>
            {crisisTypes.map((c) => (
              <button key={c.id} className={styles.crisisCard} onClick={() => selectCrisis(c.id)}>
                <span className={styles.crisisIcon}>{c.icon}</span>
                <span className={styles.crisisLabel}>{c.label}</span>
                <span className={styles.crisisDesc}>{c.desc}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* DESCRIBE */}
      {stage === "describe" && (
        <div className={styles.describeStage}>
          <button className={styles.backBtn} onClick={() => setStage("select")}>← Back</button>
          <div className={styles.stageTitle}>Describe what's happening</div>
          <p className={styles.stageSub}>Be as specific as you can. The more detail, the better the guidance.</p>
          <textarea
            className={styles.textarea}
            rows={5}
            placeholder="e.g. I've had sharp chest pain for the last 15 minutes, radiating to my left arm. I'm 42 years old, no prior heart issues..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />
          <div className={styles.quickChips}>
            {["Chest pain", "Difficulty breathing", "Severe bleeding", "Head injury", "High fever", "Unconscious person"].map((chip) => (
              <button key={chip} className={styles.chip} onClick={() => setDescription((d) => d ? `${d}, ${chip.toLowerCase()}` : chip)}>
                {chip}
              </button>
            ))}
          </div>
          <button className={styles.primaryBtn} onClick={submitDescription} disabled={!description.trim()}>
            Continue to questions →
          </button>
        </div>
      )}

      {/* QUESTIONS */}
      {stage === "questions" && (
        <div className={styles.questionsStage}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
          <div className={styles.qMeta}>
            <button className={styles.backBtn} onClick={prevQuestion}>← Back</button>
            <span className={styles.qCount}>Question {currentQ + 1} of {questions.length}</span>
          </div>
          <div className={styles.question}>{questions[currentQ].q}</div>
          <div className={styles.options}>
            {questions[currentQ].opts.map((opt) => (
              <button
                key={opt}
                className={`${styles.option} ${selected === opt ? styles.optionSelected : ""}`}
                onClick={() => selectOption(opt)}
              >
                <span className={styles.optCheck}>{selected === opt ? "●" : "○"}</span>
                {opt}
              </button>
            ))}
          </div>
          <button className={styles.primaryBtn} onClick={nextQuestion} disabled={!selected}>
            {currentQ < questions.length - 1 ? "Next question →" : "Analyze situation →"}
          </button>
        </div>
      )}

      {/* ANALYZING */}
      {stage === "analyzing" && (
        <div className={styles.analyzingStage}>
          <div className={styles.spinner} />
          <div className={styles.analyzingTitle}>Analyzing your situation</div>
          <p className={styles.analyzingSub}>AI is classifying urgency and building your action plan</p>
          <div className={styles.analyzingSteps}>
            {["Context collected", "Classifying urgency level", "Generating action plan", "Searching nearby doctors"].map((s, i) => (
              <div key={i} className={`${styles.aStep} ${analyzingStep > i ? styles.aStepDone : analyzingStep === i ? styles.aStepActive : ""}`}>
                <span className={styles.aDot} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULTS */}
      {stage === "results" && result && (
        <ActionPlan result={result} crisisType={crisisType} sessionId={sessionId} onReset={reset} />
      )}
    </div>
  );
}
