import { useState } from "react";
import "../styles/course.css";
import type { CourseStep, QuizQuestion } from "../data/courses";

interface CourseQuizStepProps {
  step: CourseStep;
}

export default function CourseQuizStep({ step }: CourseQuizStepProps) {
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

  const score = questions.filter((q) => answers[q.id] === q.correctOptionId).length;

  return (
    <div className="course-step-quiz">
      <section className="practice-layout full-code code-peek-hidden">
        <section className="practice-right panel">
          <div className="practice-right-header">
            <div className="panel-heading">Quiz</div>
          </div>
          <div className="course-step-quiz-body">
            {step.description ? <p className="course-quiz-intro">{step.description}</p> : null}
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
                disabled={questions.some((q) => !answers[q.id])}
              >
                Submit quiz
              </button>
            ) : (
              <div className="course-quiz-summary">
                Score: {score}/{questions.length}
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
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
