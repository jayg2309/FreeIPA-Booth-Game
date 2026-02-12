import type { Question } from "./questionBank";

/**
 * Fetch AI-generated questions from the server-side API route.
 * The OpenAI key stays on the server — never exposed to the browser.
 * Throws on any failure (caller should fall back to the static bank).
 */
export async function generateAIQuestions(): Promise<Question[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35_000);

  try {
    const res = await fetch("/api/generate-questions", {
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`API ${res.status}: ${body.slice(0, 200)}`);
    }

    const data = await res.json();
    const questions: Question[] = data.questions ?? [];

    if (questions.length === 0) {
      throw new Error("No questions returned from API");
    }

    // Shuffle option order so correct answer isn't always first
    return questions.map((q) => ({
      ...q,
      options: [...q.options].sort(() => Math.random() - 0.5),
    }));
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}
