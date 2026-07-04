import { useState } from "react";
import "../styles/course.css";
import type { CourseStep, QuizQuestion } from "../data/courses";
import PracticeWorkspace from "./PracticeWorkspace";

interface CourseQuizStepProps {
  step: CourseStep;
  bookName: string;
  chapterName: string;
  chapterNumber: number;
  pageType: string;
  pageIndex: number;
  totalPages: number;
  pageBrief: string;
  onPrevious?: () => void;
  onNext?: () => void;
  canPrevious?: boolean;
  canNext?: boolean;
}

export default function CourseQuizStep({
  step,
  bookName,
  chapterName,
  chapterNumber,
  pageType,
  pageIndex,
  totalPages,
  pageBrief,
  onPrevious,
  onNext,
  canPrevious = false,
  canNext = false,
}: CourseQuizStepProps) {
  const questions = step.quizQuestions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  const score = questions.filter((question) => answers[question.id] === question.correctOptionId).length;

  return (
    <PracticeWorkspace
      bookName={bookName}
      chapterName={chapterName}
      chapterNumber={chapterNumber}
      pageType={pageType}
      pageIndex={pageIndex}
      totalPages={totalPages}
      pageBrief={pageBrief}
      title={step.title}
      onPrevious={onPrevious}
      onNext={onNext}
      canPrevious={canPrevious}
      canNext={canNext}
    >
      <div className="course-step-quiz-body practice-workspace-content">
        {questions.map((question) => (
          <QuizQuestionBlock
            key={question.id}
            question={question}
            selected={answers[question.id]}
            submitted={submitted}
            onSelect={(optionId) => selectAnswer(question.id, optionId)}
          />
        ))}
        {!submitted ? (
          <button
            type="button"
            className="footer-button course-quiz-submit"
            onClick={handleSubmit}
            disabled={questions.some((question) => !answers[question.id])}
          >
            Submit quiz
          </button>
        ) : (
          <div className="course-quiz-summary">
            Score: {score}/{questions.length}
          </div>
        )}
      </div>
    </PracticeWorkspace>
  );
}

function QuizQuestionBlock({
  question,
  selected,
  submitted,
  onSelect,
}: {
  question: QuizQuestion;
  selected?: string;
  submitted: boolean;
  onSelect: (optionId: string) => void;
}) {
  return (
    <fieldset className="course-quiz-question">
      <legend>{question.prompt}</legend>
      <div className="course-quiz-options">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.id === question.correctOptionId;
          let className = "course-quiz-option";
          if (submitted && isCorrect) className += " correct";
          if (submitted && isSelected && !isCorrect) className += " incorrect";
          if (isSelected && !submitted) className += " selected";

          return (
            <label key={option.id} className={className}>
              <input
                type="radio"
                name={question.id}
                checked={isSelected}
                onChange={() => onSelect(option.id)}
                disabled={submitted}
              />
              <span>{option.text}</span>
            </label>
          );
        })}
      </div>
      {submitted && question.explanation ? <p className="course-quiz-explanation">{question.explanation}</p> : null}
    </fieldset>
  );
}
