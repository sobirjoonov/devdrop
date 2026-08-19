const KW = new Set([
  "False", "None", "True", "and", "as", "assert", "async", "await",
  "break", "class", "continue", "def", "del", "elif", "else", "except",
  "finally", "for", "from", "global", "if", "import", "in", "is",
  "lambda", "nonlocal", "not", "or", "pass", "raise", "return",
  "try", "while", "with", "yield",
]);

const BI = new Set([
  "print", "len", "range", "int", "str", "float", "list", "dict",
  "set", "tuple", "bool", "type", "input", "open", "abs", "all",
  "any", "bin", "chr", "dir", "enumerate", "eval", "exec", "filter",
  "format", "frozenset", "getattr", "globals", "hasattr", "hash",
  "hex", "id", "isinstance", "issubclass", "iter", "locals", "map",
  "max", "min", "next", "object", "oct", "ord", "pow", "property",
  "repr", "reversed", "round", "setattr", "slice", "sorted", "sum",
  "super", "vars", "zip",
]);

function esc(t) {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function hl(line) {
  let r = "";
  let i = 0;
  while (i < line.length) {
    if (line[i] === "#") {
      r += `<span class="py-comment">${esc(line.slice(i))}</span>`;
      break;
    }
    if (line.slice(i, i + 3) === '"""') {
      const e = line.indexOf('"""', i + 3);
      const c = e === -1 ? line.slice(i) : line.slice(i, e + 3);
      r += `<span class="py-docstring">${esc(c)}</span>`;
      i += c.length;
      continue;
    }
    if (line.slice(i, i + 3) === "'''") {
      const e = line.indexOf("'''", i + 3);
      const c = e === -1 ? line.slice(i) : line.slice(i, e + 3);
      r += `<span class="py-docstring">${esc(c)}</span>`;
      i += c.length;
      continue;
    }
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) {
        if (line[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, line.length);
      const c = line.slice(i, j);
      const cls = c[0] === "f" || c[0] === "F" ? "py-fstring" : "py-string";
      r += `<span class="${cls}">${esc(c)}</span>`;
      i = j;
      continue;
    }
    if (line[i] === "f" && (line[i + 1] === '"' || line[i + 1] === "'")) {
      const q = line[i + 1];
      let j = i + 2;
      while (j < line.length && line[j] !== q) {
        if (line[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, line.length);
      r += `<span class="py-fstring">${esc(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/[0-9]/.test(line[i]) && (i === 0 || /[\s(=,:[\]{}+\-*/<>!&|^~%]/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[0-9._xXoObBeE]/.test(line[j])) j++;
      r += `<span class="py-number">${esc(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[a-zA-Z0-9_]/.test(line[j])) j++;
      const w = line.slice(i, j);
      if (KW.has(w)) r += `<span class="py-keyword">${w}</span>`;
      else if (BI.has(w)) r += `<span class="py-builtin">${w}</span>`;
      else if (j < line.length && line[j] === "(") r += `<span class="py-function">${w}</span>`;
      else if (i > 0 && line[i - 1] === ".") r += `<span class="py-attribute">${w}</span>`;
      else if (w.startsWith("__") && w.endsWith("__")) r += `<span class="py-dunder">${w}</span>`;
      else r += `<span class="py-identifier">${w}</span>`;
      i = j;
      continue;
    }
    if (/[=<>!+\-*/%&|^~@]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[=<>!+\-*/%&|^~@]/.test(line[j])) j++;
      r += `<span class="py-operator">${esc(line.slice(i, j))}</span>`;
      i = j;
      continue;
    }
    if (/[()[\]{},.:;]/.test(line[i])) {
      r += `<span class="py-punctuation">${esc(line[i])}</span>`;
      i++;
      continue;
    }
    if (line[i] === " ") {
      r += " ";
      i++;
      continue;
    }
    r += esc(line[i]);
    i++;
  }
  return r;
}

export function highlightPython(code) {
  return code.split("\n").map(hl);
}
