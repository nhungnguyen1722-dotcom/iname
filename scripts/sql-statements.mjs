function isDollarTag(source, index) {
  if (source[index] !== "$") return null;
  let end = index + 1;
  while (end < source.length && /[A-Za-z0-9_]/.test(source[end])) end += 1;
  if (source[end] !== "$") return null;
  return source.slice(index, end + 1);
}

function appendQuoted(source, index, quote) {
  let cursor = index + 1;
  while (cursor < source.length) {
    if (source[cursor] === quote && source[cursor + 1] === quote) {
      cursor += 2;
      continue;
    }
    if (source[cursor] === quote) return cursor + 1;
    cursor += 1;
  }
  return source.length;
}

export function splitSqlStatements(source) {
  const sql = source.charCodeAt(0) === 0xfeff ? source.slice(1) : source;
  const statements = [];
  let current = "";
  let index = 0;

  while (index < sql.length) {
    const char = sql[index];
    const next = sql[index + 1];

    if (char === "-" && next === "-") {
      const lineEnd = sql.indexOf("\n", index);
      const end = lineEnd === -1 ? sql.length : lineEnd + 1;
      current += sql.slice(index, end);
      index = end;
      continue;
    }

    if (char === "/" && next === "*") {
      const blockEnd = sql.indexOf("*/", index + 2);
      const end = blockEnd === -1 ? sql.length : blockEnd + 2;
      current += sql.slice(index, end);
      index = end;
      continue;
    }

    if (char === "'" || char === '"') {
      const end = appendQuoted(sql, index, char);
      current += sql.slice(index, end);
      index = end;
      continue;
    }

    const dollarTag = isDollarTag(sql, index);
    if (dollarTag) {
      const contentStart = index + dollarTag.length;
      const contentEnd = sql.indexOf(dollarTag, contentStart);
      const end = contentEnd === -1 ? sql.length : contentEnd + dollarTag.length;
      current += sql.slice(index, end);
      index = end;
      continue;
    }

    if (char === ";") {
      if (current.trim()) statements.push(current.trim());
      current = "";
      index += 1;
      continue;
    }

    current += char;
    index += 1;
  }

  if (current.trim()) statements.push(current.trim());
  return statements.filter((statement) => statement.replace(/\/\*[\s\S]*?\*\//g, "").replace(/--[^\n]*/g, "").trim());
}
