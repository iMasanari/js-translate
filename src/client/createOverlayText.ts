import { Position } from 'source-map'

const findTokenIndex = (str: string) => {
  const char = str[0]
  const isStringOrRegExpLiteral = char === `'` || char === `"` || char === '`' || char === '/'

  const index = isStringOrRegExpLiteral
    ? str.indexOf(char, 1) + 1 || str.length
    : str.search(/[^a-zA-Z0-9$_]|$/) || 1

  return index
}

const escapeRegExp = /["&'<>]/g
const escapeLookupMap: Record<string, string> = {
  '"': '&quot;',
  '&': '&amp;',
  "'": '&#39;',
  '<': '&lt;',
  '>': '&gt;',
}

const escapeLookup = (match: string) =>
  escapeLookupMap[match]

const escapeHtml = (value: string) =>
  value.replace(escapeRegExp, escapeLookup)

export default (code: string, pos?: Position) => {
  if (!pos || pos.column == null || pos.line == null) {
    return escapeHtml(code) + '\n|'
  }

  const lines = code.split('\n')
  const currentLine = lines[pos.line - 1]
  const lastColumn = pos.column + (findTokenIndex(currentLine.slice(pos.column)) || 1)

  const header = [...lines.slice(0, pos.line - 1), currentLine.slice(0, pos.column)].join('\n')
  const footer = [currentLine.slice(lastColumn), ...lines.slice(pos.line)].join('\n')
  const body = currentLine.slice(pos.column, lastColumn)

  return `${escapeHtml(header)}<span class="highlight">${escapeHtml(body)}</span>${escapeHtml(footer)}` + '\n|'
}
