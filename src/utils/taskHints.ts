import type { PracticeTask, TaskType } from "../data/tasks";

const STEP_GAP = "\n\n\n";

const COMPONENT_NAMES: Record<string, string> = {
  "react-counter": "CounterComponent",
  "react-counter-reducer": "CounterComponent",
  "react-counter-advanced": "CounterComponent",
  "react-counter-redux": "CounterComponent",
  "react-toggle-visibility": "ToggleVisibility",
  "react-form-input": "FormInput",
  "react-fetch-data": "FetchData",
  "react-manage-list": "ManageList",
  "react-tab-navigation": "TabNavigation",
  "csharp-bubble-sort": "BubbleSortSolution",
};

function getCommentPrefix(taskType: TaskType): string {
  return taskType === "sql" ? "--" : "//";
}

function inferImportLines(task: PracticeTask): string[] {
  if (task.type !== "code") return [];

  const text = `${task.id} ${task.title} ${task.checklist.join(" ")} ${task.starterCode ?? ""}`;

  if (task.category === "react") {
    const hooks = new Set<string>();
    if (/useState/i.test(text)) hooks.add("useState");
    if (/useReducer/i.test(text)) hooks.add("useReducer");
    if (/useEffect/i.test(text)) hooks.add("useEffect");

    const hookImport = hooks.size ? `, { ${[...hooks].join(", ")} }` : "";
    const lines = [`import React${hookImport} from 'react';`];

    if (/useSelector|useDispatch|redux/i.test(text)) {
      lines.push("import { useSelector, useDispatch } from 'react-redux';");
    }
    if (/combineReducers/i.test(text)) {
      lines.push("import { combineReducers } from 'redux';");
    }

    return lines;
  }

  if (task.category === "csharp") {
    return ["using System;", "using System.Collections.Generic;"];
  }

  if (task.category === "angular") {
    return ["import { Component } from '@angular/core';"];
  }

  return [];
}

function inferExportLine(task: PracticeTask): string | null {
  if (task.type !== "code") return null;

  if (task.category === "react") {
    const name = COMPONENT_NAMES[task.id] ?? "YourComponent";
    return `export default ${name};`;
  }

  if (task.category === "csharp") {
    return "public class Solution { /* complete method(s) here */ }";
  }

  if (task.category === "angular") {
    const name = COMPONENT_NAMES[task.id] ?? "AppComponent";
    return `export class ${name} { }`;
  }

  return null;
}

function formatHintLine(prefix: string, label: string, detail: string): string {
  return `${label}: ${detail}`;
}

function numberedHintLine(prefix: string, index: number, content: string): string {
  return prefixCommentLinesLocal(`hint${index}: ${content}`, prefix);
}

function getImportHint(line: string): string {
  const match = /import\s+(.+?)\s+from\s+['"]([^'"]+)['"];?/i.exec(line);
  if (!match) {
    return line;
  }

  const imports = match[1].trim();
  const source = match[2];
  let detail = imports;

  if (imports.includes("{")) {
    const defaultImport = imports.replace(/\{[\s\S]*\}/, "").replace(/,$/, "").trim();
    const namedImport = imports.match(/\{([\s\S]*?)\}/)?.[1]?.trim() ?? "";
    const parts: string[] = [];

    if (defaultImport) {
      parts.push(defaultImport);
    }
    if (namedImport) {
      const namedItems = namedImport.split(",").map((item) => item.trim()).filter(Boolean);
      if (namedItems.length === 1) {
        parts.push(namedItems[0]);
      } else if (namedItems.length === 2) {
        parts.push(namedItems.join(" and "));
      } else {
        parts.push(namedItems.join(", "));
      }
    }

    detail = parts.join(" and ");
  }

  return `${detail} from ${source}`;
}

/** Comment-only hints — import, step guidance, export; 2 blank lines between each block. */
export function getCommentHints(task: PracticeTask): string {
  const prefix = getCommentPrefix(task.type);
  const blocks: string[] = [];
  const importLines = task.type === "code" ? inferImportLines(task) : [];
  const exportLine = inferExportLine(task);

  importLines.forEach((line) => {
    blocks.push(formatHintLine(prefix, "Import", getImportHint(line)));
  });

  task.checklist.forEach((item) => {
    const trimmedItem = item.trim();
    if (task.type === "code") {
      if (importLines.length > 0 && /\bimport\b/i.test(trimmedItem)) {
        return;
      }
      if (exportLine && /\bexport\b/i.test(trimmedItem)) {
        return;
      }
    }
    blocks.push(trimmedItem);
  });

  if (exportLine) {
    blocks.push(formatHintLine(prefix, "Export", exportLine));
  }

  const numberedBlocks = Array.from(new Set(blocks)).map((block, index) => {
    const trimmed = block.startsWith(prefix) ? block.slice(prefix.length).trim() : block;
    return numberedHintLine(prefix, index + 1, trimmed);
  });

  return numberedBlocks.join(STEP_GAP);
}

/** Return a best-effort executable starter/example code derived from the starterCode field.
 * Strips comment prefixes and leading numeric labels like `// 1:` so the result is runnable.
 */
export function getStarterCode(task: PracticeTask): string {
  if (!task.starterCode) return "";

  const lines = task.starterCode.split(/\r?\n/).map((line) => {
    let s = line.replace(/^\s*\/\/\s?/, "");
    s = s.replace(/^\s*--\s?/, "");
    // remove leading numeric labels like "1: " or "// 1: Import:"
    s = s.replace(/^\s*\d+[:.]\s*/g, "");
    // remove leading labels like "Import: " or "Export: " when they prefix actual code
    s = s.replace(/^\s*(Import|Export|1|2|3)[:]\s*/i, "");
    return s;
  });

  // Filter out empty guide lines but keep code-like lines
  return lines.filter((l) => l.trim() !== "").join("\n");
}

function prefixCommentLinesLocal(text: string, prefix: string) {
  return text
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      return trimmed === "" ? prefix : `${prefix} ${trimmed}`;
    })
    .join("\n");
}

export function getFullExampleCode(task: PracticeTask): string {
  const editorHints = (task as any)?.page?.editor?.hints ?? [];
  if (editorHints.length) {
    return editorHints
      .map((h: any) => {
        let code = String(h.code ?? "").trim();
        // Remove comment prefix if present
        code = code.replace(/^\s*(?:\/\/|--)\s?/, "");
        // Remove any remaining hint: or guide hints: labels
        code = code.replace(/^\s*(?:hint|guide(?:\s+hint(?:s)?)?)\s*:\s*/i, "");
        return code;
      })
      .join("\n\n");
  }
  return getStarterCode(task);
}

export function buildEditorContent(task: PracticeTask, includeCode: boolean): string {
  const prefix = getCommentPrefix(task.type);
  const editorHints = (task as any)?.page?.editor?.hints ?? [];

  if (editorHints.length) {
    // If any hint contains a full SQL query, split it into clause snippets
    const looksLikeSql = editorHints.some((h: any) => /\bSELECT\b|\bFROM\b|\bGROUP\s+BY\b|\bHAVING\b/i.test(String(h.code ?? "")));
    let sqlClauses: any = null;
    if (looksLikeSql) {
      const fullSqlHint = editorHints.find((h: any) => /\bSELECT\b/i.test(String(h.code ?? "")) && /\bFROM\b/i.test(String(h.code ?? "")));
      if (fullSqlHint) {
        const full = String(fullSqlHint.code ?? "").replace(/^\s*(?:\/\/|--)\s?/gm, "").trim();
        const selectMatch = full.match(/(^[\s\S]*?)\bFROM\b/i);
        const fromMatch = full.match(/\bFROM\b([\s\S]*?)(?:\bGROUP\s+BY\b|\bHAVING\b|$)/i);
        const groupMatch = full.match(/\bGROUP\s+BY\b([\s\S]*?)(?:\bHAVING\b|$)/i);
        const havingMatch = full.match(/\bHAVING\b([\s\S]*)$/i);
        sqlClauses = {
          select: selectMatch ? selectMatch[1].trim() : "",
          from: fromMatch ? `FROM ${fromMatch[1].trim()}` : "",
          group: groupMatch ? `GROUP BY ${groupMatch[1].trim()}` : "",
          having: havingMatch ? `HAVING ${havingMatch[1].trim()}` : "",
        };
        // Clean up trailing semicolons and excessive whitespace
        Object.keys(sqlClauses).forEach((k) => {
          if (sqlClauses[k]) sqlClauses[k] = sqlClauses[k].replace(/;\s*$/, "").trim();
        });
      }
    }

    return editorHints
      .map((h: any, index: number) => {
        let guide = String(h.guide ?? "").trim();
        guide = guide.replace(/^\s*(?:\/\/|--)\s*/, "");
        guide = guide.replace(/^\s*(?:guide(?:\s+hint(?:s)?)?|hint)\s*:\s*/i, "");
        let code = String(h.code ?? "")
          .replace(/^\s*(?:\/\/|--)\s?/gm, "")
          .replace(/^\s*(?:hint|guide(?:\s+hint(?:s)?)?)\s*:\s*/i, "")
          .trim();

        // If we parsed SQL clauses, prefer assigning a clause to a hint based on the guide text
        if (sqlClauses) {
          const lcGuide = guide.toLowerCase();
          if (/\bselect\b/.test(lcGuide) && sqlClauses.select) {
            code = sqlClauses.select;
          } else if (/\bfrom\b/.test(lcGuide) && sqlClauses.from) {
            code = sqlClauses.from;
          } else if (/group\s+by/.test(lcGuide) && sqlClauses.group) {
            code = sqlClauses.group;
          } else if (/\bhaving\b/.test(lcGuide) && sqlClauses.having) {
            code = sqlClauses.having;
          }
        }

        const commentGuide = prefixCommentLinesLocal(`hint${index + 1}: ${guide}`, prefix);
        return includeCode ? `${commentGuide}\n${code}` : commentGuide;
      })
      .join("\n\n");
  }

  if (task.type !== "code") {
    return getCommentHints(task);
  }

  const commentHints = getCommentHints(task);
  if (includeCode) {
    const commentedStarter = prefixCommentLinesLocal(getStarterCode(task), prefix);
    const codeBlockHint = commentedStarter ? `${prefix} Example code:\n${commentedStarter}` : "";
    return [commentHints, codeBlockHint].filter(Boolean).join("\n\n");
  }
  return commentHints;
}

/** Non-comment code (case preserved) used for compile + keyword checks. */
export function getExecutableCode(code: string, taskType: TaskType): string {
  if (taskType === "text") {
    return code;
  }

  return code
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (taskType === "sql") return !trimmed.startsWith("--");
      return !trimmed.startsWith("//");
    })
    .join("\n");
}

/** Code used for keyword checks — comment hint lines are ignored. */
export function getVerifiableCode(code: string, taskType: TaskType): string {
  return getExecutableCode(code, taskType).toLowerCase();
}

function normalizeForVerification(code: string, taskType: TaskType): string {
  // Strip comments and get executable portion
  const exec = getExecutableCode(code, taskType);
  // Trim each line, collapse to single spaces, and normalize spacing around punctuation
  const collapsed = exec
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return collapsed;
}

function escapeRegexLiteral(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** One boolean per checklist item; false when keywords missing or no rules defined. */
export function verifyTaskAgainstCode(task: PracticeTask, userCode: string): boolean[] {
  const count = task.checklist.length;
  const results = Array.from({ length: count }, () => false);

  const mode = (task as any).verificationMode ?? "keyword"; // keyword | regex | exact

  if (mode === "exact") {
    const expected = String((task as any).expectedCode ?? "");
    if (!expected) return results;
    const nUser = normalizeForVerification(userCode, task.type).toLowerCase();
    const nExpected = normalizeForVerification(expected, task.type).toLowerCase();
    if (nUser === nExpected) {
      return results.map(() => true);
    }
    return results;
  }

  const normalized = normalizeForVerification(userCode, task.type);
  if (!task.verificationKeywords?.length) {
    return results;
  }

  if (mode === "regex") {
    task.verificationKeywords.slice(0, count).forEach((patterns: string[], index: number) => {
      if (!patterns || patterns.length === 0) return;
      // pass if ANY of the provided patterns matches (more forgiving)
      const ok = patterns.some((pattern) => {
        try {
          const regex = new RegExp(pattern, "i");
          return regex.test(normalized);
        } catch (e) {
          return normalized.toLowerCase().includes(pattern.toLowerCase());
        }
      });
      results[index] = ok;
    });
    return results;
  }

  // default: keyword substring matching (backwards compatible)
  const verifiable = getVerifiableCode(userCode, task.type);
  task.verificationKeywords.slice(0, count).forEach((keywords, index) => {
    if (keywords.length === 0) return;
    // pass if any synonym keyword appears
    results[index] = keywords.some((keyword) => verifiable.includes(keyword.toLowerCase()));
  });

  return results;
}

export interface FullVerifyResult {
  compileOk: boolean;
  compileErrors: string[];
  compileLanguage: string;
  checklistResults: boolean[];
}

export function verifyTaskFull(task: PracticeTask, userCode: string, compile: CompileResultLike): FullVerifyResult {
  const checklistResults = verifyTaskAgainstCode(task, userCode);

  if (!compile.ok) {
    return {
      compileOk: false,
      compileErrors: compile.errors,
      compileLanguage: compile.language,
      checklistResults,
    };
  }

  return {
    compileOk: true,
    compileErrors: [],
    compileLanguage: compile.language,
    checklistResults,
  };
}

interface CompileResultLike {
  ok: boolean;
  errors: string[];
  language: string;
}
