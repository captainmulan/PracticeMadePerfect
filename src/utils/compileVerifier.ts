import { resolveCompileLanguage } from "../config/compileLanguages";
import type { PracticeTask, TaskType } from "../data/tasks";
import { getExecutableCode } from "./taskHints";

export interface CompileResult {
  ok: boolean;
  errors: string[];
  language: string;
}

function checkDelimiterBalance(source: string): string | null {
  const stack: string[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  let inString: "'" | '"' | "`" | null = null;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
      continue;
    }

    if ("({[".includes(ch)) stack.push(ch);
    if (")}]".includes(ch)) {
      const expected = pairs[ch];
      if (stack.pop() !== expected) return `Syntax error: unexpected '${ch}'`;
    }
  }

  if (inString) return `Syntax error: unclosed string (${inString})`;
  if (stack.length) return `Syntax error: unclosed '${stack[stack.length - 1]}'`;
  return null;
}

function tryParseJavaScript(source: string): CompileResult {
  try {
    new Function(source);
    return { ok: true, errors: [], language: "javascript" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, errors: [`JavaScript syntax error: ${message}`], language: "javascript" };
  }
}

function normalizeJsxForSyntaxCheck(source: string): string {
  return source
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
    .replace(/export\s+default\s+[\w$]+;?/g, "")
    .replace(/<[A-Za-z][\w.-]*[^>]*\/>/g, "null")
    .replace(/<[A-Za-z][\w.-]*[^>]*>[\s\S]*?<\/[A-Za-z][\w.-]*>/g, "null");
}

function compileJsx(source: string): CompileResult {
  if (!source.trim()) {
    return { ok: false, errors: ["No code to compile. Add your solution below the hints."], language: "jsx" };
  }

  const balanceError = checkDelimiterBalance(source);
  if (balanceError) {
    return { ok: false, errors: [balanceError], language: "jsx" };
  }

  const normalized = normalizeJsxForSyntaxCheck(source);
  const parsed = tryParseJavaScript(normalized);
  return { ...parsed, language: "jsx" };
}

function compileSql(source: string): CompileResult {
  if (!source.trim()) {
    return { ok: false, errors: ["SQL query is empty."], language: "sql" };
  }

  if (!/\b(SELECT|INSERT|UPDATE|DELETE|WITH|CREATE|ALTER)\b/i.test(source)) {
    return {
      ok: false,
      errors: ["SQL must include a statement keyword (e.g. SELECT, INSERT, UPDATE)."],
      language: "sql",
    };
  }

  const balanceError = checkDelimiterBalance(source);
  if (balanceError) {
    return { ok: false, errors: [balanceError.replace("Syntax error", "SQL syntax error")], language: "sql" };
  }

  return { ok: true, errors: [], language: "sql" };
}

function compileCsharp(source: string): CompileResult {
  if (!source.trim()) {
    return { ok: false, errors: ["C# code is empty."], language: "csharp" };
  }

  const balanceError = checkDelimiterBalance(source);
  if (balanceError) {
    return { ok: false, errors: [balanceError.replace("Syntax error", "C# syntax error")], language: "csharp" };
  }

  if (!/\b(class|void|int|public|return|static)\b/i.test(source)) {
    return {
      ok: false,
      errors: ["C# solution should include method/class structure (e.g. public, class, return)."],
      language: "csharp",
    };
  }

  return { ok: true, errors: [], language: "csharp" };
}

function compileText(source: string): CompileResult {
  if (!source.trim()) {
    return { ok: false, errors: ["Answer is empty."], language: "text" };
  }
  return { ok: true, errors: [], language: "text" };
}

export function runCompileCheck(task: PracticeTask, userCode: string): CompileResult {
  const language = resolveCompileLanguage(task);
  const source = getExecutableCode(userCode, task.type);

  switch (language) {
    case "jsx":
      return compileJsx(source);
    case "sql":
      return compileSql(source);
    case "csharp":
      return compileCsharp(source);
    case "text":
      return compileText(source);
    default:
      return tryParseJavaScript(source);
  }
}
