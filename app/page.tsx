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
  limit: number;
  showAnswers: boolean;
  shuffledQuestions: IPhysics[];
  shuffledVariantsMap: Record<number, string[]>; // для хранения вариантов каждого вопроса
}

const STORAGE_KEY = "physicsTestState";

export default function Test() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [limit, setLimit] = useState<number>(10);
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
        setLimit(parsed.limit ?? 10);
        setShowAnswers(parsed.showAnswers ?? false);
        setShuffledVariantsMap(parsed.shuffledVariantsMap ?? {});
      } catch {
        initShuffledQuestions(limit);
      }
    } else {
      initShuffledQuestions(limit);
    }
  }, []);

  useEffect(() => {
    if (shuffledQuestions.length === 0) return;
    const state: ITestState = {
      currentIndex,
      selectedAnswers,
      limit,
      showAnswers,
      shuffledQuestions,
      shuffledVariantsMap
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentIndex, selectedAnswers, limit, showAnswers, shuffledQuestions, shuffledVariantsMap]);

  const currentQuestion: IPhysics | null =
    shuffledQuestions.length > 0 ? shuffledQuestions[currentIndex] : null;

  const initShuffledQuestions = (limit: number) => {
    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, limit);

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
    initShuffledQuestions(limit);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleLimitChange = (val: number) => {
    if (isNaN(val) || val < 1 || val > data.length) return;
    setLimit(val);
    initShuffledQuestions(val);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!currentQuestion) return <div className="text-white p-4">Загрузка...</div>;

  const shuffledVariants = shuffledVariantsMap[currentQuestion.id] || currentQuestion.variants;

  return (
<div className="container" style={{maxWidth: 576, margin: "10px auto", padding:"12px"}}>
      <div className="min-h-screen p-4 bg-black text-white flex flex-col items-center">
      <div className="max-w-xl w-full">
        <h2 className="text-lg font-bold mb-2">
          Вопрос {currentIndex + 1} из {shuffledQuestions.length}
        </h2>
        <br />
        <p className="mb-4">{currentQuestion.question}</p>
<br />
        <div className="flex flex-col gap-2">
          {shuffledVariants.map((v: string, idx: number) => {
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
                style={{padding:"8px 4px"}}
                className={`block w-full text-left p-3 rounded border border-gray ${bgColor} transition-colors`}
              >
                {v}
              </button>
            );
          })}
        </div>
<br />
        <div className="flex justify-between mt-6 gap-2 flex-wrap">
          <button
            onClick={prevQuestion}
            disabled={currentIndex === 0}
            className=" hover:bg-gray-700 disabled:opacity-50"
          >
            {"<"}
          </button>
          <button
            onClick={nextQuestion}
            disabled={currentIndex === shuffledQuestions.length - 1}
            className=" hover:bg-gray-700 disabled:opacity-50"
          >
            {">"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2">
            Лимит вопросов:
            <input
              type="number"
              min={1}
              max={data.length}
              value={limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
              className="w-20 p-2 rounded  border-white bg-gray-900 text-white text-center"
            />
          </label>

          <button
            onClick={() => setShowAnswers(!showAnswers)}
            className="px-4 py-2  border-white rounded hover:bg-gray-800"
          >
            {showAnswers ? "Скрыть ответы" : "Показать ответы"}
          </button>

          <button
            onClick={resetTest}
            className="px-4 py-2  border-white rounded hover:bg-gray-800"
          >
            Сбросить тест
          </button>
        </div>
      </div>
    </div>
</div>
  );
}
