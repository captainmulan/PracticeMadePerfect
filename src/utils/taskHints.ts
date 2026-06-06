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
  return `${prefix} ${label}: ${detail}`;
}

/** Comment-only hints — import, numbered steps, export; 2 blank lines between each block. */
export function getCommentHints(task: PracticeTask): string {
  const prefix = getCommentPrefix(task.type);
  const blocks: string[] = [];

  if (task.type === "code") {
    inferImportLines(task).forEach((line) => {
      blocks.push(formatHintLine(prefix, "Import", line));
    });
  }

  task.checklist.forEach((item, index) => {
    blocks.push(`${prefix} ${index + 1}: ${item}`);
  });

  const exportLine = inferExportLine(task);
  if (exportLine) {
    blocks.push(formatHintLine(prefix, "Export", exportLine));
  }

  return blocks.join(STEP_GAP);
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

/** One boolean per checklist item; false when keywords missing or no rules defined. */
export function verifyTaskAgainstCode(task: PracticeTask, userCode: string): boolean[] {
  const count = task.checklist.length;
  const results = Array.from({ length: count }, () => false);

  if (!task.verificationKeywords?.length) {
    return results;
  }

  const verifiable = getVerifiableCode(userCode, task.type);

  task.verificationKeywords.slice(0, count).forEach((keywords, index) => {
    if (keywords.length === 0) return;
    results[index] = keywords.every((keyword) => verifiable.includes(keyword.toLowerCase()));
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
  if (!compile.ok) {
    return {
      compileOk: false,
      compileErrors: compile.errors,
      compileLanguage: compile.language,
      checklistResults: task.checklist.map(() => false),
    };
  }

  return {
    compileOk: true,
    compileErrors: [],
    compileLanguage: compile.language,
    checklistResults: verifyTaskAgainstCode(task, userCode),
  };
}

interface CompileResultLike {
  ok: boolean;
  errors: string[];
  language: string;
}
