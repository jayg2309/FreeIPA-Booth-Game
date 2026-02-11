import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { pickQuestions, type Question } from "../game/questionBank";
import { generateAIQuestions } from "../game/aiQuestions";
import type { RoundResult } from "../game/scoring";

const QUESTION_COUNT = 10;
const TIME_PER_QUESTION = 25; // seconds

type AnswerState = null | { chosenIdx: number; correct: boolean };

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const playerName: string = (location.state as any)?.playerName ?? "Player";
  const playerEmail: string = (location.state as any)?.playerEmail ?? "";

  /* ── Question loading (AI → fallback to static bank) ── */
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSource, setAiSource] = useState<"ai" | "bank" | null>(null);

  useEffect(() => {
    let cancelled = false;

    generateAIQuestions()
      .then((qs) => {
        if (!cancelled) {
          setQuestions(qs);
          setAiSource("ai");
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("AI question generation failed, using static bank:", err);
        if (!cancelled) {
          setQuestions(pickQuestions(QUESTION_COUNT));
          setAiSource("bank");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /* ── Game state ── */
  const [qIdx, setQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [answerState, setAnswerState] = useState<AnswerState>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentQ = questions?.[qIdx] ?? null;

  /* ── Tick timer (only runs when questions are loaded) ── */
  useEffect(() => {
    if (loading || !questions || answerState !== null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.3) return 0;
        return +(t - 0.1).toFixed(1);
      });
    }, 100);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [qIdx, answerState, loading, questions]);

  /* ── Time-out handler ── */
  useEffect(() => {
    if (timeLeft <= 0 && answerState === null && !loading) {
      handleAnswer(-1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, answerState, loading]);

  /* ── Clean-up on unmount ── */
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  /* ── Answer handler ── */
  const handleAnswer = useCallback(
    (chosenIdx: number) => {
      if (answerState !== null || !currentQ) return;
      if (timerRef.current) clearInterval(timerRef.current);

      const correct =
        chosenIdx >= 0 && currentQ.options[chosenIdx].isCorrect;

      setAnswerState({ chosenIdx, correct });
      setResults((prev) => [
        ...prev,
        { questionId: currentQ.id, correct, timeLeft },
      ]);

      feedbackTimerRef.current = setTimeout(() => {
        if (qIdx + 1 >= QUESTION_COUNT) {
          const finalResults = [
            ...results,
            { questionId: currentQ.id, correct, timeLeft },
          ];
          navigate("/results", {
            state: { results: finalResults, playerName, playerEmail },
          });
        } else {
          setQIdx((i) => i + 1);
          setTimeLeft(TIME_PER_QUESTION);
          setAnswerState(null);
        }
      }, 1800);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answerState, currentQ, qIdx, results, timeLeft, navigate]
  );

  /* ── Loading screen ── */
  if (loading || !questions || !currentQ) {
    return (
      <div className="page fade-in">
        <div style={{ fontSize: "2.5rem" }}>🛡️</div>
        <h2>Generating questions...</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Crafting unique scenarios just for you
        </p>
        <div className="timer-bar-track" style={{ maxWidth: 200, marginTop: "0.5rem" }}>
          <div
            className="timer-bar-fill"
            style={{
              width: "100%",
              animation: "pulse 1.2s ease-in-out infinite",
            }}
          />
        </div>
      </div>
    );
  }

  /* ── Derived values ── */
  const timerPercent = (timeLeft / TIME_PER_QUESTION) * 100;
  const timerDanger = timeLeft <= 2.5;

  return (
    <div
      className="page fade-in"
      style={{ justifyContent: "flex-start", paddingTop: "1.25rem" }}
    >
      {/* Source badge */}
      {aiSource === "ai" && (
        <span
          className="concept-tag"
          style={{ fontSize: "0.65rem", alignSelf: "flex-end", opacity: 0.6 }}
        >
          AI-generated
        </span>
      )}

      {/* Progress dots */}
      <div className="progress-dots">
        {questions.map((_, i) => {
          let cls = "progress-dot";
          if (i < results.length)
            cls += results[i].correct ? " correct" : " wrong";
          else if (i === qIdx) cls += " current";
          return <div key={i} className={cls} />;
        })}
      </div>

      {/* Timer */}
      <div className="timer-bar-track" style={{ marginTop: "0.25rem" }}>
        <div
          className={`timer-bar-fill${timerDanger ? " danger" : ""}`}
          style={{ width: `${timerPercent}%` }}
        />
      </div>

      {/* Question number + concept */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {qIdx + 1}/{QUESTION_COUNT}
        </span>
        <span className="concept-tag">{currentQ.concept}</span>
      </div>

      {/* Scenario */}
      <div className="card" key={currentQ.id}>
        <p
          style={{
            color: "var(--text)",
            fontWeight: 500,
            fontSize: "1.05rem",
            lineHeight: 1.55,
          }}
        >
          {currentQ.scenario}
        </p>
      </div>

      {/* Answer buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.6rem",
          width: "100%",
        }}
      >
        {currentQ.options.map((opt, i) => {
          let cls = "btn btn--answer";
          if (answerState !== null) {
            if (opt.isCorrect) cls += " correct";
            if (i === answerState.chosenIdx && !opt.isCorrect) cls += " wrong";
          }
          return (
            <button
              key={i}
              className={cls}
              disabled={answerState !== null}
              onClick={() => handleAnswer(i)}
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {answerState !== null && (
        <div className="fade-in" style={{ width: "100%" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: "1.1rem",
              color: answerState.correct
                ? "var(--success)"
                : "var(--danger)",
            }}
          >
            {answerState.chosenIdx < 0
              ? "⏱ Time's up!"
              : answerState.correct
              ? "✓ Correct!"
              : "✗ Not quite"}
          </div>
          <p className="explanation">{currentQ.explanation}</p>
        </div>
      )}
    </div>
  );
}
