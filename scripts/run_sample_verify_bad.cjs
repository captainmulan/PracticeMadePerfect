const { readFileSync } = require('fs');

// Broken student sample to demonstrate verification failures
const badCode = `import react, {useState} from 'react';

const CounterComponent = () => {
  const [count, setCount] = useState(0)
  const [step, setStep] = useState(1);

  const increase = () = {
    setCount(Math.min(count * 2, 10));
  };

  return (
    <div>
      <h2>Count: {count}</h2>
      <label>Step:<input type="number" value={step} onChange={(e) => setStep(Number(e.target.value))} /></label>
      <button onClick={setCount(0)}>Reset</button>
      <button onClick={setCount(Math.min(count * 2, 10))}>Double</button>
    </div>
  );
};

const App = () => {
  return ()
};

export default App;
`;

// Reuse logic from run_sample_verify.cjs
function getSourcePosition(source, index) {
  let line = 1, column = 1;
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n') { line++; column = 1; } else column++;
  }
  return { line, column };
}

function parseErrorLocation(stack) {
  const m = stack.match(/<anonymous>:(\d+):(\d+)/) || stack.match(/\[eval\]:(\d+):(\d+)/) || stack.match(/evalmachine\.<anonymous>:(\d+):(\d+)/);
  if (!m) return undefined;
  return { line: Number(m[1]), column: Number(m[2]) };
}

function formatCompilerMessage(message, position) {
  if (!position) return message;
  return `${message} at line ${position.line}, column ${position.column}`;
}

function checkDelimiterBalance(source) {
  const stack = [];
  const pairs = { ')': '(', ']': '[', '}': '{' };
  let inString = null;
  let stringStart = { line:1, column:1 };
  let line = 1, column = 1;

  for (let i = 0; i < source.length; i++) {
    const ch = source[i];
    const prev = source[i-1];
    if (inString) {
      if (ch === inString && prev !== "\\") inString = null;
    } else if (ch === "'" || ch === '"' || ch === '`') {
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
    if (ch === '\n') { line++; column = 1; } else column++;
  }
  if (inString) return `Syntax error: unclosed string (${inString}) at line ${stringStart.line}`;
  if (stack.length) {
    const top = stack[stack.length-1];
    return `Syntax error: unclosed '${top.ch}' at line ${top.line}`;
  }
  return null;
}

function normalizeJsxForSyntaxCheck(source) {
  return source
    .replace(/import\s+[\s\S]*?from\s+['"][^'"]+['"];?/g, "")
    .replace(/export\s+default\s+[\w$]+;?/g, "")
    .replace(/return\s*\([\s\S]*?\);/g, 'return (null);')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');
}

function tryParseJavaScript(source) {
  try {
    new Function(source);
    return { ok: true, errors: [] };
  } catch (error) {
    const message = error && error.message ? error.message : String(error);
    const position = error && error.stack ? parseErrorLocation(error.stack) : undefined;
    return { ok: false, errors: [`JavaScript syntax error: ${formatCompilerMessage(message, position)}`] };
  }
}

function compileJsx(source) {
  if (!source || !source.trim()) return { ok: false, errors: ["No code to compile. Add your solution below the hints."] };
  const balanceError = checkDelimiterBalance(source);
  if (balanceError) return { ok: false, errors: [balanceError] };
  const normalized = normalizeJsxForSyntaxCheck(source);
  return tryParseJavaScript(normalized);
}

function getExecutableCodeLocal(code) {
  return code
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      return !trimmed.startsWith('//');
    })
    .join('\n');
}

function runChecklist(task, code) {
  const count = (task.checklist || []).length;
  const results = Array.from({ length: count }, () => false);
  const verifiableRaw = getExecutableCodeLocal(code);
  const verifiableLower = verifiableRaw.toLowerCase();
  const keywords = task.verificationKeywords || [];
  for (let i = 0; i < count; i++) {
    const patterns = (keywords[i] || []);
    if (!patterns || patterns.length === 0) continue;
    const ok = patterns.some((pattern) => {
      if (/[A-Z]/.test(pattern)) {
        return verifiableRaw.includes(pattern);
      }
      return verifiableLower.includes(pattern.toLowerCase());
    });
    results[i] = ok;
  }
  return results;
}

// Load the task file to get checklist/keywords
const bundlePath = __dirname + '/../src/data/tasks_bundle.json';
let taskJson;
try {
  if (fs.existsSync(bundlePath)) {
    const bundle = JSON.parse(readFileSync(bundlePath, 'utf8'));
    taskJson = bundle.find((t) => t.id === 'react-counter-advanced') || bundle[0];
  } else {
    taskJson = JSON.parse(readFileSync(__dirname + '/../src/data/taskDefs/react-counter-advanced.json', 'utf8'));
  }
} catch (e) {
  taskJson = JSON.parse(readFileSync(__dirname + '/../src/data/taskDefs/react-counter-advanced.json', 'utf8'));
}

console.log('Running compile + checklist on broken sample');
const compileRes = compileJsx(badCode);
console.log('Compile result:', compileRes);
const checklist = runChecklist(taskJson, badCode);
console.log('Checklist results:');
taskJson.checklist.forEach((item, idx) => {
  console.log(`- [${checklist[idx] ? 'x' : ' '}] ${item}`);
});

process.exit(0);
