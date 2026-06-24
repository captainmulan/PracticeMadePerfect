import { useEffect, useMemo, useState } from "react";
import type { Course, CourseChapter, CourseStep, CourseStepType } from "../data/courses";
import { flattenCourseSteps } from "../data/courses";
import { loadCoursesFromBrowserDb, persistCourse, removeCourse } from "../utils/sqliteBrowserCourses";

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function rebuildChaptersFromSteps(courseId: string, steps: CourseStep[]): CourseChapter[] {
  const chapterMap = new Map<string, CourseChapter>();
  steps.forEach((step) => {
    if (!chapterMap.has(step.chapterId)) {
      chapterMap.set(step.chapterId, {
        id: step.chapterId,
        courseId,
        chapterIndex: step.chapterIndex,
        title: step.chapterTitle,
        steps: [],
      });
    }
    chapterMap.get(step.chapterId)!.steps.push(step);
  });
  return [...chapterMap.values()]
    .sort((a, b) => a.chapterIndex - b.chapterIndex)
    .map((chapter) => ({
      ...chapter,
      steps: chapter.steps.slice().sort((a, b) => a.stepIndex - b.stepIndex),
    }));
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [draftCourse, setDraftCourse] = useState<Course | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadCoursesFromBrowserDb()
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
        setLoaded(true);
      })
      .catch((err) => setMessage(String(err)));
  }, []);

  const activeCourse = draftCourse ?? courses.find((c) => c.id === selectedCourseId) ?? null;
  const flatSteps = useMemo(() => (activeCourse ? flattenCourseSteps(activeCourse) : []), [activeCourse]);
  const selectedStep = flatSteps.find((step) => step.id === selectedStepId) ?? null;

  function startNewCourse() {
    const course: Course = {
      id: "",
      title: "New course",
      description: "",
      color: "#2563eb",
      icon: "📘",
      iconSize: 80,
      courseIndex: courses.length,
      chapters: [],
    };
    setDraftCourse(course);
    setSelectedCourseId(null);
    setSelectedStepId(null);
    setMessage("");
  }

  function updateActiveCourse(updater: (course: Course) => Course) {
    if (!activeCourse) return;
    const next = updater(activeCourse);
    if (draftCourse) {
      setDraftCourse(next);
    } else {
      setCourses((prev) => prev.map((c) => (c.id === next.id ? next : c)));
    }
  }

  function updateStep(stepId: string, patch: Partial<CourseStep>) {
    if (!activeCourse) return;
    const steps = flattenCourseSteps(activeCourse).map((step) =>
      step.id === stepId ? ({ ...step, ...patch } as CourseStep) : step,
    );
    updateActiveCourse((course) => ({
      ...course,
      chapters: rebuildChaptersFromSteps(course.id, steps),
    }));
  }

  function addChapter() {
    if (!activeCourse) return;
    const chapterIndex = activeCourse.chapters.length;
    const chapterId = `${activeCourse.id || "course"}-ch-${Date.now()}`;
    const chapter: CourseChapter = {
      id: chapterId,
      courseId: activeCourse.id,
      chapterIndex,
      title: `Chapter ${chapterIndex + 1}`,
      steps: [],
    };
    updateActiveCourse((course) => ({
      ...course,
      chapters: [...course.chapters, chapter],
    }));
  }

  function addStep(stepType: CourseStepType) {
    if (!activeCourse) return;
    const chapter = activeCourse.chapters[activeCourse.chapters.length - 1];
    if (!chapter) {
      setMessage("Add a chapter first.");
      return;
    }
    const stepIndex = chapter.steps.length;
    const step: CourseStep = {
      id: `${chapter.id}-step-${Date.now()}`,
      courseId: activeCourse.id,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      chapterIndex: chapter.chapterIndex,
      stepIndex,
      stepType,
      title: stepType === "html" ? "Lesson" : stepType === "code-exam" ? "Code exam" : "Quiz",
      description: "",
      contentHtml: stepType === "html" ? "<p>Lesson content</p>" : undefined,
      checklist: stepType === "code-exam" ? ["Meets requirement"] : undefined,
      verificationKeywords: stepType === "code-exam" ? [["export"]] : undefined,
      codeType: "code",
      quizQuestions: stepType === "quiz"
        ? [{
            id: "q1",
            prompt: "Sample question?",
            options: [{ id: "a", text: "Yes" }, { id: "b", text: "No" }],
            correctOptionId: "a",
          }]
        : undefined,
    };
    updateActiveCourse((course) => ({
      ...course,
      chapters: course.chapters.map((ch) =>
        ch.id === chapter.id ? { ...ch, steps: [...ch.steps, step] } : ch,
      ),
    }));
    setSelectedStepId(step.id);
  }

  async function handleSaveCourse() {
    if (!activeCourse) return;
    const trimmedId = activeCourse.id.trim() || slugify(activeCourse.title);
    if (!trimmedId) {
      setMessage("Course id or title is required.");
      return;
    }
    const normalized: Course = {
      ...activeCourse,
      id: trimmedId,
      chapters: activeCourse.chapters.map((chapter) => ({
        ...chapter,
        courseId: trimmedId,
        steps: chapter.steps.map((step) => ({
          ...step,
          courseId: trimmedId,
          chapterId: chapter.id,
          chapterTitle: chapter.title,
          chapterIndex: chapter.chapterIndex,
        })),
      })),
    };
    try {
      await persistCourse(normalized);
      const refreshed = await loadCoursesFromBrowserDb();
      setCourses(refreshed);
      setDraftCourse(null);
      setSelectedCourseId(trimmedId);
      setMessage("Course saved.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  async function handleDeleteCourse() {
    if (!activeCourse?.id || draftCourse) return;
    try {
      await removeCourse(activeCourse.id);
      const refreshed = await loadCoursesFromBrowserDb();
      setCourses(refreshed);
      setSelectedCourseId(refreshed[0]?.id ?? null);
      setSelectedStepId(null);
      setMessage("Course deleted.");
    } catch (err) {
      setMessage(String(err));
    }
  }

  if (!loaded) {
    return <div className="admin-section-body">Loading courses...</div>;
  }

  return (
    <div className="admin-courses">
      <div className="admin-courses-toolbar">
        <select
          value={draftCourse ? "__draft__" : selectedCourseId ?? ""}
          onChange={(e) => {
            if (e.target.value === "__draft__") return;
            setDraftCourse(null);
            setSelectedCourseId(e.target.value);
            setSelectedStepId(null);
          }}
        >
          {draftCourse ? <option value="__draft__">New course (draft)</option> : null}
          {courses.map((course) => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
        <button type="button" className="footer-button secondary" onClick={startNewCourse}>New Course</button>
        <button type="button" className="footer-button" onClick={handleSaveCourse}>Save Course</button>
        {!draftCourse && activeCourse ? (
          <button type="button" className="footer-button secondary" onClick={handleDeleteCourse}>Delete</button>
        ) : null}
      </div>

      {message ? <div className="admin-course-message">{message}</div> : null}

      {activeCourse ? (
        <div className="admin-courses-grid">
          <section className="admin-course-meta panel-bordered">
            <h3>Course</h3>
            <label className="admin-task-editor-field admin-task-editor-full">
              <span className="admin-task-editor-label">ID</span>
              <input
                value={activeCourse.id}
                onChange={(e) => updateActiveCourse((c) => ({ ...c, id: e.target.value }))}
                className="admin-grid-input"
              />
            </label>
            <label className="admin-task-editor-field admin-task-editor-full">
              <span className="admin-task-editor-label">Title</span>
              <input
                value={activeCourse.title}
                onChange={(e) => updateActiveCourse((c) => ({ ...c, title: e.target.value }))}
                className="admin-grid-input"
              />
            </label>
            <label className="admin-task-editor-field admin-task-editor-full">
              <span className="admin-task-editor-label">Description</span>
              <textarea
                rows={3}
                value={activeCourse.description}
                onChange={(e) => updateActiveCourse((c) => ({ ...c, description: e.target.value }))}
                className="admin-grid-input"
              />
            </label>
            <div className="admin-course-meta-row">
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Icon</span>
                <input value={activeCourse.icon} onChange={(e) => updateActiveCourse((c) => ({ ...c, icon: e.target.value }))} className="admin-grid-input" />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Icon size</span>
                <input
                  type="number"
                  min={24}
                  max={120}
                  value={activeCourse.iconSize ?? 80}
                  onChange={(e) => updateActiveCourse((c) => ({ ...c, iconSize: Number(e.target.value) }))}
                  className="admin-grid-input"
                />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Color</span>
                <input value={activeCourse.color} onChange={(e) => updateActiveCourse((c) => ({ ...c, color: e.target.value }))} className="admin-grid-input" />
              </label>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Order</span>
                <input
                  type="number"
                  value={activeCourse.courseIndex}
                  onChange={(e) => updateActiveCourse((c) => ({ ...c, courseIndex: Number(e.target.value) }))}
                  className="admin-grid-input"
                />
              </label>
            </div>
            <div className="admin-course-step-actions">
              <button type="button" className="footer-button secondary" onClick={addChapter}>Add Chapter</button>
              <button type="button" className="footer-button secondary" onClick={() => addStep("html")}>+ Lesson</button>
              <button type="button" className="footer-button secondary" onClick={() => addStep("code-exam")}>+ Code exam</button>
              <button type="button" className="footer-button secondary" onClick={() => addStep("quiz")}>+ Quiz</button>
            </div>
            <div className="admin-course-step-list">
              {flatSteps.map((step) => (
                <button
                  key={step.id}
                  type="button"
                  className={`admin-course-step-item ${selectedStepId === step.id ? "selected" : ""}`}
                  onClick={() => setSelectedStepId(step.id)}
                >
                  <span>{step.chapterIndex + 1}.{step.stepIndex + 1}</span>
                  <span>{step.title}</span>
                  <span>{step.stepType}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="admin-course-step-editor panel-bordered">
            {selectedStep ? (
              <>
                <h3>Step editor</h3>
                <label className="admin-task-editor-field admin-task-editor-full">
                  <span className="admin-task-editor-label">Title</span>
                  <input value={selectedStep.title} onChange={(e) => updateStep(selectedStep.id, { title: e.target.value })} className="admin-grid-input" />
                </label>
                <label className="admin-task-editor-field admin-task-editor-full">
                  <span className="admin-task-editor-label">Type</span>
                  <select
                    value={selectedStep.stepType}
                    onChange={(e) => updateStep(selectedStep.id, { stepType: e.target.value as CourseStepType })}
                    className="admin-grid-select"
                  >
                    <option value="html">html</option>
                    <option value="code-exam">code-exam</option>
                    <option value="quiz">quiz</option>
                  </select>
                </label>
                <label className="admin-task-editor-field admin-task-editor-full">
                  <span className="admin-task-editor-label">Description</span>
                  <textarea rows={2} value={selectedStep.description} onChange={(e) => updateStep(selectedStep.id, { description: e.target.value })} className="admin-grid-input" />
                </label>
                {selectedStep.stepType === "html" ? (
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Content HTML</span>
                    <textarea rows={8} value={selectedStep.contentHtml ?? ""} onChange={(e) => updateStep(selectedStep.id, { contentHtml: e.target.value })} className="admin-grid-input" />
                  </label>
                ) : null}
                {selectedStep.stepType === "code-exam" ? (
                  <>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Checklist (one per line)</span>
                      <textarea
                        rows={4}
                        value={(selectedStep.checklist ?? []).join("\n")}
                        onChange={(e) => updateStep(selectedStep.id, { checklist: e.target.value.split(/\r?\n/).filter(Boolean) })}
                        className="admin-grid-input"
                      />
                    </label>
                    <label className="admin-task-editor-field admin-task-editor-full">
                      <span className="admin-task-editor-label">Verification keywords (JSON)</span>
                      <textarea
                        rows={4}
                        value={JSON.stringify(selectedStep.verificationKeywords ?? [], null, 2)}
                        onChange={(e) => {
                          try {
                            updateStep(selectedStep.id, { verificationKeywords: JSON.parse(e.target.value) });
                          } catch {
                            // ignore while typing
                          }
                        }}
                        className="admin-grid-input"
                      />
                    </label>
                  </>
                ) : null}
                {selectedStep.stepType === "quiz" ? (
                  <label className="admin-task-editor-field admin-task-editor-full">
                    <span className="admin-task-editor-label">Quiz JSON</span>
                    <textarea
                      rows={10}
                      value={JSON.stringify(selectedStep.quizQuestions ?? [], null, 2)}
                      onChange={(e) => {
                        try {
                          updateStep(selectedStep.id, { quizQuestions: JSON.parse(e.target.value) });
                        } catch {
                          // ignore while typing
                        }
                      }}
                      className="admin-grid-input"
                    />
                  </label>
                ) : null}
              </>
            ) : (
              <div className="admin-empty-state">Select a step to edit, or add chapters and steps.</div>
            )}
          </section>
        </div>
      ) : (
        <div className="admin-empty-state">No courses yet. Click New Course to start building.</div>
      )}
    </div>
  );
}
