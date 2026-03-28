import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function POST(req: NextRequest) {
  const { crisisType, description, answers, isRecoveryCheck, originalUrgency } = await req.json();

  const systemPrompt = `You are Crisis Copilot, an AI-powered crisis response assistant.
Your job is to analyze emergency situations and provide clear, actionable guidance.

CRITICAL RULES:
- Always classify urgency as exactly one of: "low", "moderate", or "emergency"
- Actions must be concrete, immediate, and numbered
- Use plain language — the user is stressed
- For emergencies, always include "Call 112 immediately" as the first action
- Never give vague advice like "consult a doctor" — give specific steps

Respond with ONLY valid JSON in this exact format:
{
  "urgency": "low" | "moderate" | "emergency",
  "summary": "1-2 sentence assessment of the situation",
  "actions": ["action 1", "action 2", "action 3", "action 4", "action 5"],
  "callAction": "optional emergency call instruction"
}`;

  const userPrompt = isRecoveryCheck
    ? `Recovery check-in for a ${crisisType} crisis.
Original urgency: ${originalUrgency}
Update: ${description}
Provide updated guidance based on their condition change.`
    : `Crisis type: ${crisisType}
Patient description: ${description}
Follow-up answers: ${answers.join(" | ")}

Analyze this situation and provide an urgency classification and action plan.`;

  try {
    const response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Triage API error:", err);
    // Intelligent fallback based on answers
    const severity = answers[0] || "";
    const urgency =
      severity.toLowerCase().includes("critical") || severity.toLowerCase().includes("severe")
        ? "emergency"
        : severity.toLowerCase().includes("moderate")
        ? "moderate"
        : "low";

    return NextResponse.json({
      urgency,
      summary: `Based on your ${crisisType} situation, here are recommended immediate steps.`,
      actions: [
        urgency === "emergency" ? "Call 112 immediately — do not delay." : "Sit or lie down in a safe, comfortable position.",
        "Stay calm and breathe slowly and deeply.",
        "Do not eat or drink until assessed by a professional.",
        "Contact a trusted person to stay with you.",
        "Monitor your condition and call emergency services if it worsens.",
      ],
    });
  }
}
