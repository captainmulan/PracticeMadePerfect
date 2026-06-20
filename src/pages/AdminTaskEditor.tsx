import { useMemo, useState } from "react";
import type { PracticeTask } from "../data/tasks";

interface AdminTaskEditorProps {
  task: PracticeTask;
  onChange: (updated: PracticeTask) => void;
  onDelete: (taskId: string) => void;
}

export default function AdminTaskEditor({ task, onChange, onDelete }: AdminTaskEditorProps) {
  const [expanded, setExpanded] = useState(false);

  const checklistText = useMemo(() => task.checklist.join("\n"), [task.checklist]);
  const verificationJson = useMemo(
    () => JSON.stringify(task.verificationKeywords ?? [], null, 2),
    [task.verificationKeywords],
  );

  function handleField<K extends keyof PracticeTask>(field: K, value: PracticeTask[K]) {
    onChange({ ...task, [field]: value });
  }

  return (
    <section className="panel admin-editor admin-section">
      <button
        type="button"
        className="admin-section-header"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <span>{task.id} — {task.title}</span>
        <span>{expanded ? "▾" : "▸"}</span>
      </button>
      {expanded && (
        <div className="admin-section-body admin-task-form">
          <div className="admin-form-grid">
            <label>
              ID
              <input
                value={task.id}
                onChange={(event) => handleField("id", event.target.value as PracticeTask["id"])}
                placeholder="task-id"
              />
            </label>
            <label>
              Category
              <input
                value={task.category}
                onChange={(event) => handleField("category", event.target.value as PracticeTask["category"])}
                placeholder="category"
              />
            </label>
            <label>
              Title
              <input
                value={task.title}
                onChange={(event) => handleField("title", event.target.value as PracticeTask["title"])}
                placeholder="Task title"
              />
            </label>
            <label>
              Type
              <select
                value={task.type}
                onChange={(event) => handleField("type", event.target.value as PracticeTask["type"])}
              >
                <option value="code">code</option>
                <option value="sql">sql</option>
                <option value="text">text</option>
              </select>
            </label>
            <label className="admin-form-fullwidth">
              Description
              <textarea
                rows={4}
                value={task.description}
                onChange={(event) => handleField("description", event.target.value as PracticeTask["description"])}
              />
            </label>
            <label className="admin-form-fullwidth">
              Checklist (one item per line)
              <textarea
                rows={4}
                value={checklistText}
                onChange={(event) =>
                  handleField(
                    "checklist",
                    event.target.value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean) as PracticeTask["checklist"],
                  )
                }
              />
            </label>
            <label className="admin-form-fullwidth">
              Verification Keywords (JSON array)
              <textarea
                rows={4}
                value={verificationJson}
                onChange={(event) => {
                  try {
                    const parsed = JSON.parse(event.target.value);
                    handleField("verificationKeywords", Array.isArray(parsed) ? (parsed as PracticeTask["verificationKeywords"]) : []);
                  } catch {
                    // ignore invalid JSON until save
                  }
                }}
              />
            </label>
            <label className="admin-form-fullwidth">
              Starter Code
              <textarea
                rows={6}
                value={task.starterCode ?? ""}
                onChange={(event) => handleField("starterCode", event.target.value as PracticeTask["starterCode"])}
              />
            </label>
            <label className="admin-form-fullwidth">
              Answer HTML
              <textarea
                rows={4}
                value={task.answerHtml ?? ""}
                onChange={(event) => handleField("answerHtml", event.target.value as PracticeTask["answerHtml"])}
              />
            </label>
          </div>
          <div className="admin-task-actions">
            <button type="button" className="footer-button secondary" onClick={() => onDelete(task.id)}>
              Delete Task
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
