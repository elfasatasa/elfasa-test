'use client'

import { useState, useEffect } from "react";
import data from "../data/physics.json";

interface IPhysics {
  id: number;
  question: string;
  variants: string[];
  correctAnswer: string;
}

interface ITestState {
  currentIndex: number;
  selectedAnswers: Record<number, string>;
  limitId: number;
  showAnswers: boolean;
  shuffledQuestions: IPhysics[];
  shuffledVariantsMap: Record<number, string[]>;
}

const STORAGE_KEY = "physicsTestState";

export default function Test() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [limitId, setLimitId] = useState<number>(data.length);
  const [inputId, setInputId] = useState<string>(String(data.length));
  const [shuffledQuestions, setShuffledQuestions] = useState<IPhysics[]>([]);
  const [shuffledVariantsMap, setShuffledVariantsMap] = useState<Record<number, string[]>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: ITestState = JSON.parse(saved);
        setShuffledQuestions(parsed.shuffledQuestions ?? []);
        setCurrentIndex(Math.min(parsed.currentIndex ?? 0, parsed.shuffledQuestions?.length - 1));
        setSelectedAnswers(parsed.selectedAnswers ?? {});
        setLimitId(parsed.limitId ?? data.length);
        setInputId(String(parsed.limitId ?? data.length));
        setShowAnswers(parsed.showAnswers ?? false);
        setShuffledVariantsMap(parsed.shuffledVariantsMap ?? {});
      } catch {
        initShuffledQuestions(limitId);
      }
    } else {
      initShuffledQuestions(limitId);
    }
  }, []);

  useEffect(() => {
    if (shuffledQuestions.length === 0) return;
    const state: ITestState = {
      currentIndex,
      selectedAnswers,
      limitId,
      showAnswers,
      shuffledQuestions,
      shuffledVariantsMap
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentIndex, selectedAnswers, limitId, showAnswers, shuffledQuestions, shuffledVariantsMap]);

  const currentQuestion: IPhysics | null =
    shuffledQuestions.length > 0 ? shuffledQuestions[currentIndex] : null;

  const initShuffledQuestions = (maxId: number) => {
    const filtered = data.filter(q => q.id <= maxId);
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    const variantsMap: Record<number, string[]> = {};
    shuffled.forEach(q => {
      variantsMap[q.id] = [...q.variants].sort(() => Math.random() - 0.5);
    });

    setShuffledQuestions(shuffled);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setShowAnswers(false);
    setShuffledVariantsMap(variantsMap);
  };

  const handleAnswer = (variant: string) => {
    if (!currentQuestion) return;
    if (selectedAnswers[currentQuestion.id]) return;
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: variant });
  };

  const nextQuestion = () => {
    if (currentIndex < shuffledQuestions.length - 1) setCurrentIndex(currentIndex + 1);
  };

  const prevQuestion = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const resetTest = () => {
    initShuffledQuestions(limitId);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleLimitChange = () => {
    const val = parseInt(inputId);
    if (isNaN(val) || val < 1) return;
    const maxId = Math.min(val, data.length);
    setLimitId(maxId);
    initShuffledQuestions(maxId);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!currentQuestion) return <div className="text-white p-4">Загрузка...</div>;

  const shuffledVariants = shuffledVariantsMap[currentQuestion.id] || currentQuestion.variants;

  // Считаем количество правильных ответов
  const correctCount = shuffledQuestions.reduce((acc, q) => {
    return acc + (selectedAnswers[q.id] === q.correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div style={{ maxWidth: 576, margin: "10px auto", padding: "18px" }}>
      <div className="min-h-screen p-4 bg-black text-white flex flex-col items-center">
        <h2 className="text-lg font-bold mb-2">
          Вопрос {currentIndex + 1} из {shuffledQuestions.length}
        </h2>
        <p className="mb-4">{currentQuestion.question}</p>

        <div className="flex flex-col gap-2">
          {shuffledVariants.map((v, idx) => {
            const isSelected = selectedAnswers[currentQuestion.id] === v;
            const isCorrect = currentQuestion.correctAnswer === v;
            let bgColor = "";
            if (showAnswers) {
              if (isSelected && isCorrect) bgColor = "bg-green-600";
              else if (isSelected && !isCorrect) bgColor = "bg-red-600";
              else if (!isSelected && isCorrect) bgColor = "bg-green-600/50";
            } else if (isSelected) {
              bgColor = "bg-gray-700";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(v)}
                className={`block w-full text-left p-3 rounded border border-gray ${bgColor} transition-colors`}
              >
                {v}
              </button>
            );
          })}
        </div>

        <div style={{maxWidth: 576, display:"flex",gap:100,fontSize:26}}>
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className="hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            {"<"}
          </button>
          <button
            onClick={nextQuestion}
            disabled={currentIndex === shuffledQuestions.length - 1}
            className="hover:bg-gray-700 disabled:opacity-50 px-4 py-2 rounded"
          >
            {">"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            Лимит ID:
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onBlur={handleLimitChange}
              placeholder="например 50"
              className="w-20 p-2 rounded border border-white bg-gray-900 text-white text-center"
            />
          </label>

          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-4 py-2 border border-white rounded hover:bg-gray-800"
          >
            {showAnswers ? "Скрыть ответы" : "Показать ответы"}
          </button>

          <button
            onClick={resetTest}
            className="px-4 py-2 border border-white rounded hover:bg-gray-800"
          >
            Сбросить тест
          </button>
        </div>
<br />
        <div className="mt-4 text-lg font-bold">
          Правильных ответов: {correctCount} / {shuffledQuestions.length}
        </div>
      </div>
    </div>
  );
}
