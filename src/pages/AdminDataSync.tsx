import { useState } from "react";
import { clearDatabase, importIndexedDb } from "../utils/indexedDb";

interface FileMapping {
  fileName: string;
  courseId: string;
  chapterTitle: string;
  stepTitle: string;
}

export default function AdminDataSync() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourceType, setSourceType] = useState<"file" | "folder">("file");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [mappings, setMappings] = useState<FileMapping[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [message, setMessage] = useState("");

  const courses = [
    { id: "little-programmer", title: "Little Programmer" },
    { id: "js-programmer", title: "JS Programmer" },
    { id: "fiction-book", title: "Fiction Book" },
  ];

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
    // Auto-create mappings
    const autoMappings: FileMapping[] = files.map((file) => ({
      fileName: file.name,
      courseId: selectedCourse || "little-programmer",
      chapterTitle: extractChapterTitle(file.name),
      stepTitle: extractStepTitle(file.name),
    }));
    setMappings(autoMappings);
  }

  function extractChapterTitle(fileName: string): string {
    // Try to extract chapter from filename like "026-Breakout-Explain.html"
    const match = fileName.match(/\d+-(.+?)(?:-Explain|-quiz)?\.html/);
    return match ? match[1].replace(/-/g, " ") : "Chapter";
  }

  function extractStepTitle(fileName: string): string {
    // Try to extract step title from filename
    const match = fileName.match(/\d+-(.+?)\.html/);
    return match ? match[1].replace(/-/g, " ") : fileName.replace(".html", "");
  }

  function updateMapping(index: number, field: keyof FileMapping, value: string) {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  }

  async function handleSync() {
    setIsSyncing(true);
    setMessage("Syncing data...");

    try {
      // Step 1: Read file contents and create export data
      const fileContents = await Promise.all(
        selectedFiles.map(async (file) => ({
          fileName: file.name,
          content: await file.text(),
        }))
      );

      // Step 2: Load current export
      const response = await fetch("/data/indexeddb-export.json");
      const exportData = await response.json();

      // Step 3: Update export with new content
      mappings.forEach((mapping, index) => {
        const fileContent = fileContents[index]?.content;
        if (!fileContent) return;

        const course = exportData.courses.find((c: any) => c.id === mapping.courseId);
        if (!course) return;

        const chapter = course.chapters.find((ch: any) => ch.title === mapping.chapterTitle);
        if (!chapter) return;

        const step = chapter.steps.find((s: any) => s.title === mapping.stepTitle);
        if (step) {
          step.contentHtml = fileContent;
        }
      });

      // Step 4: Clear IndexedDB
      await clearDatabase();

      // Step 5: Import updated data
      await importIndexedDb(JSON.stringify(exportData));

      setMessage("Sync complete! Reloading page...");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      setMessage(`Sync failed: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSyncing(false);
    }
  }

  return (
    <div className="panel admin-section">
      <h3 style={{ marginTop: 0 }}>Data Sync Wizard</h3>
      
      {message && (
        <div className="admin-course-message" style={{ marginBottom: "16px" }}>
          {message}
        </div>
      )}

      {/* Step 1: Source & Destination */}
      {step === 1 && (
        <div>
          <h4>Step 1: Choose Source & Destination</h4>
          
          <div style={{ marginBottom: "16px" }}>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Source Type</span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as "file" | "folder")}
                className="admin-grid-input"
              >
                <option value="file">Upload Files</option>
                <option value="folder">Select Folder (Not Implemented)</option>
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label className="admin-task-editor-field">
              <span className="admin-task-editor-label">Destination Course</span>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="admin-grid-input"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {sourceType === "file" && (
            <div style={{ marginBottom: "16px" }}>
              <label className="admin-task-editor-field">
                <span className="admin-task-editor-label">Upload HTML Files</span>
                <input
                  type="file"
                  multiple
                  accept=".html"
                  onChange={handleFileSelect}
                  className="admin-grid-input"
                />
              </label>
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <p>Selected {selectedFiles.length} file(s):</p>
              <ul style={{ paddingLeft: "20px" }}>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            className="footer-button"
            onClick={() => setStep(2)}
            disabled={selectedFiles.length === 0 || !selectedCourse}
          >
            Next →
          </button>
        </div>
      )}

      {/* Step 2: Link Files to Pages */}
      {step === 2 && (
        <div>
          <h4>Step 2: Link Files to Pages</h4>
          <p style={{ color: "#64748b", marginBottom: "16px" }}>
            Review and adjust the file-to-page mappings before syncing.
          </p>

          <div style={{ marginBottom: "16px", maxHeight: "400px", overflowY: "auto" }}>
            {mappings.map((mapping, index) => (
              <div
                key={index}
                style={{
                  padding: "12px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  backgroundColor: "#f8fafc",
                }}
              >
                <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                  {mapping.fileName}
                </div>
                
                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Course ID</span>
                    <input
                      type="text"
                      value={mapping.courseId}
                      onChange={(e) => updateMapping(index, "courseId", e.target.value)}
                      className="admin-grid-input"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Chapter Title</span>
                    <input
                      type="text"
                      value={mapping.chapterTitle}
                      onChange={(e) => updateMapping(index, "chapterTitle", e.target.value)}
                      className="admin-grid-input"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <label style={{ flex: 1 }}>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Step Title</span>
                    <input
                      type="text"
                      value={mapping.stepTitle}
                      onChange={(e) => updateMapping(index, "stepTitle", e.target.value)}
                      className="admin-grid-input"
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="footer-button"
              onClick={() => setStep(1)}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
            <button
              type="button"
              className="footer-button"
              onClick={() => setStep(3)}
              style={{ flex: 1 }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Sync */}
      {step === 3 && (
        <div>
          <h4>Step 3: Sync Data</h4>
          
          <div style={{ marginBottom: "16px", padding: "16px", backgroundColor: "#fef3c7", borderRadius: "8px" }}>
            <strong>⚠️ Warning:</strong> This will:
            <ul style={{ marginTop: "8px", paddingLeft: "20px" }}>
              <li>Clear all existing IndexedDB data</li>
              <li>Update course content with uploaded files</li>
              <li>Reload the page automatically</li>
            </ul>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <p><strong>Summary:</strong></p>
            <ul style={{ paddingLeft: "20px" }}>
              <li>{selectedFiles.length} file(s) to sync</li>
              <li>Course: {selectedCourse}</li>
              <li>Destination: IndexedDB</li>
            </ul>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              type="button"
              className="footer-button"
              onClick={() => setStep(2)}
              disabled={isSyncing}
              style={{ flex: 1 }}
            >
              ← Back
            </button>
            <button
              type="button"
              className="footer-button"
              onClick={handleSync}
              disabled={isSyncing}
              style={{ flex: 1, backgroundColor: "#22c55e" }}
            >
              {isSyncing ? "Syncing..." : "🚀 Sync Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
