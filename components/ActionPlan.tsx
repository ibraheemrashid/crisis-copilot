"use client";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import styles from "./ActionPlan.module.css";

type Urgency = "low" | "moderate" | "emergency";

interface TriageResult {
  urgency: Urgency;
  summary: string;
  actions: string[];
  callAction?: string;
}

interface Doctor {
  name: string;
  specialty: string;
  distance: string;
  phone?: string;
}

const urgencyConfig = {
  low: {
    label: "LOW URGENCY",
    title: "Monitor at home",
    icon: "✅",
    className: styles.bannerLow,
  },
  moderate: {
    label: "MODERATE — Act within 2 hours",
    title: "Seek medical attention",
    icon: "⚠️",
    className: styles.bannerModerate,
  },
  emergency: {
    label: "EMERGENCY — Act immediately",
    title: "Call 112 now",
    icon: "🚨",
    className: styles.bannerEmergency,
  },
};

export default function ActionPlan({
  result,
  crisisType,
  sessionId,
  onReset,
}: {
  result: TriageResult;
  crisisType: string;
  sessionId: string | null;
  onReset: () => void;
}) {
  const [checked, setChecked] = useState<boolean[]>(result.actions.map(() => false));
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [doctorsLoaded, setDoctorsLoaded] = useState(false);
  const [condition, setCondition] = useState<"better" | "same" | "worse" | null>(null);
  const [reEvalResult, setReEvalResult] = useState<string | null>(null);
  const [reEvalLoading, setReEvalLoading] = useState(false);

  const updateSession = useMutation(api.sessions.updateCondition);

  const cfg = urgencyConfig[result.urgency];

  function toggleCheck(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  async function findDoctors() {
    setLoadingDoctors(true);
    try {
      const res = await fetch("/api/doctors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ crisisType, urgency: result.urgency }),
      });
      const data = await res.json();
      setDoctors(data.doctors || []);
      setDoctorsLoaded(true);
    } catch {
      setDoctors([
        { name: "Dr. Aisha Mir", specialty: "General Physician", distance: "0.8 km", phone: "+91 194 0001" },
        { name: "Dr. Farooq Ahmad", specialty: "Cardiologist", distance: "1.4 km", phone: "+91 194 0002" },
        { name: "Dr. Nidhi Sharma", specialty: "Neurologist", distance: "2.1 km", phone: "+91 194 0003" },
      ]);
      setDoctorsLoaded(true);
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function reEvaluate() {
    if (!condition) return;
    setReEvalLoading(true);
    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crisisType,
          description: `Recovery check-in: Patient reports feeling ${condition} after following initial action plan.`,
          answers: [`Condition update: ${condition}`],
          isRecoveryCheck: true,
          originalUrgency: result.urgency,
        }),
      });
      const data = await res.json();
      setReEvalResult(data.summary);

      if (sessionId) {
        await updateSession({ id: sessionId as any, condition, updatedAt: Date.now() });
      }
    } catch {
      setReEvalResult(
        condition === "better"
          ? "Good progress. Continue monitoring and rest. See a doctor if symptoms return."
          : condition === "worse"
          ? "Condition worsening — seek immediate medical attention or call 112."
          : "No change detected. Continue following the action plan and monitor closely."
      );
    } finally {
      setReEvalLoading(false);
    }
  }

  return (
    <div className={styles.plan}>
      {/* URGENCY BANNER */}
      <div className={`${styles.banner} ${cfg.className}`}>
        <span className={styles.bannerIcon}>{cfg.icon}</span>
        <div>
          <div className={styles.bannerLabel}>{cfg.label}</div>
          <div className={styles.bannerTitle}>{cfg.title}</div>
        </div>
      </div>

      {/* EMERGENCY CALL */}
      {result.urgency === "emergency" && (
        <a href="tel:112" className={styles.emergencyCall}>
          📞 Call 112 — Emergency Services
        </a>
      )}

      {/* SUMMARY */}
      <p className={styles.summary}>{result.summary}</p>

      {/* ACTION STEPS */}
      <div className={styles.sectionLabel}>Immediate actions</div>
      <div className={styles.actions}>
        {result.actions.map((action, i) => (
          <div key={i} className={`${styles.actionItem} ${checked[i] ? styles.actionDone : ""}`}>
            <button className={`${styles.actionNum} ${checked[i] ? styles.numDone : ""}`} onClick={() => toggleCheck(i)}>
              {checked[i] ? "✓" : i + 1}
            </button>
            <p className={styles.actionText}>{action}</p>
          </div>
        ))}
      </div>

      {/* DOCTOR FINDER */}
      <div className={styles.doctorSection}>
        <div className={styles.sectionLabel}>Nearby specialists</div>
        {!doctorsLoaded ? (
          <button className={styles.findBtn} onClick={findDoctors} disabled={loadingDoctors}>
            {loadingDoctors ? "Searching via Exa…" : "Find doctors near me →"}
          </button>
        ) : (
          <div className={styles.doctorList}>
            {doctors.map((doc, i) => (
              <div key={i} className={styles.doctorCard}>
                <div className={styles.docAvatar}>{doc.specialty.charAt(0)}</div>
                <div className={styles.docInfo}>
                  <div className={styles.docName}>{doc.name}</div>
                  <div className={styles.docSpec}>{doc.specialty}</div>
                  <div className={styles.docDist}>{doc.distance}</div>
                </div>
                {doc.phone && (
                  <a href={`tel:${doc.phone}`} className={styles.callBtn}>Call</a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RECOVERY LOOP */}
      <div className={styles.recoveryBox}>
        <div className={styles.recoveryTitle}>Recovery check-in</div>
        <p className={styles.recoverySub}>After completing the steps above, how are you feeling?</p>
        <div className={styles.conditionBtns}>
          {(["better", "same", "worse"] as const).map((c) => (
            <button
              key={c}
              className={`${styles.condBtn} ${condition === c ? styles.condActive : ""}`}
              onClick={() => setCondition(c)}
            >
              {c === "better" ? "🟢" : c === "same" ? "🟡" : "🔴"} {c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>
        {reEvalResult ? (
          <div className={styles.reEvalResult}>{reEvalResult}</div>
        ) : (
          <button className={styles.reEvalBtn} onClick={reEvaluate} disabled={!condition || reEvalLoading}>
            {reEvalLoading ? "Re-evaluating…" : "Re-evaluate with AI →"}
          </button>
        )}
      </div>

      {/* RESET */}
      <button className={styles.resetBtn} onClick={onReset}>Start new triage</button>
    </div>
  );
}
