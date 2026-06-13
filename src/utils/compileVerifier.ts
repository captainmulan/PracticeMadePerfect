import { resolveCompileLanguage } from "../config/compileLanguages";
import type { PracticeTask, TaskType } from "../data/tasks";
import { getExecutableCode } from "./taskHints";

export interface CompileResult {
  ok: boolean;
  errors: string[];
  language: string;
}

interface Position {
  line: number;
  column: number;
}

function getSourcePosition(source: string, index: number): Position {
  let line = 1;
  let column = 1;

  for (let i = 0; i < index; i += 1) {
    if (source[i] === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

function parseErrorLocation(stack: string): Position | undefined {
  const match = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/\[eval\]:(\d+):(\d+)/) || stack.match(/evalmachine\.<anonymous>:(\d+):(\d+)/);
  if (!match) return undefined;
  return { line: Number(match[1]), column: Number(match[2]) };
}

function formatCompilerMessage(message: string, position?: Position): string {
  if (!position) return message;
  return `${message} at line ${position.line}, column ${position.column}`;
}

function checkDelimiterBalance(source: string): string | null {
  type DelimiterState = { ch: string; line: number; column: number };
  const stack: DelimiterState[] = [];
  const pairs: Record<string, string> = { ")": "(", "]": "[", "}": "{" };
  let inString: "'" | '"' | "`" | null = null;
  let stringStart: Position = { line: 1, column: 1 };

  let line = 1;
  let column = 1;

  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const prev = source[i - 1];

    if (inString) {
      if (ch === inString && prev !== "\\") {
        inString = null;
      }
    } else if (ch === "'" || ch === '"' || ch === "`") {
      inString = ch;
      stringStart = { line, column };
    } else if ("({[".includes(ch)) {
      stack.push({ ch, line, column });
    } else if (")}]".includes(ch)) {
      const expected = pairs[ch];
      const top = stack.pop();
      if (!top || top.ch !== expected) {
        return `Syntax error: unexpected '${ch}' at line ${line}`;
      }
    }

    if (ch === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  if (inString) return `Syntax error: unclosed string (${inString}) at line ${stringStart.line}`;
  if (stack.length) {
    const top = stack[stack.length - 1];
    return `Syntax error: unclosed '${top.ch}' at line ${top.line}`;
  }
  return null;
}

function tryParseJavaScript(source: string): CompileResult {
  try {
    new Function(source);
    return { ok: true, errors: [], language: "javascript" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const position = error instanceof Error && error.stack ? parseErrorLocation(error.stack) : undefined;
    return {
      ok: false,
      errors: [`JavaScript syntax error: ${formatCompilerMessage(message, position)}`],
      language: "javascript",
    };
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
