import { NullablePosition, NullableMappedPosition } from 'source-map'

const findTokenIndex = (str: string) => {
  const reg = /[^a-zA-Z0-9$_]/

  for (let i = 0; i < str.length; i++) {
    if (reg.test(str[i])) {
      return i
    }
  }
  return str.length
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

export default (code: string, pos?: NullablePosition | NullableMappedPosition) => {
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
