import { SourceMapConsumer, RawSourceMap } from 'source-map'
import { PositionPayload } from './'

export const positionFromInputLogic = (consumer: SourceMapConsumer, position: PositionPayload) => {
  const { line, column } = consumer.generatedPositionFor({
    source: '0',
    line: position.line,
    column: position.column,
  })

  const generated = { line, column }

  const originalPosition = line != null
    ? consumer.originalPositionFor(generated)
    : { line: null, column: null }

  return {
    original: {
      line: originalPosition.line,
      column: originalPosition.column,
    },
    generated,
  }
}


export const positionFromOutputLogic = (consumer: SourceMapConsumer, position: PositionPayload) => {
  const { line, column } = consumer.originalPositionFor(position)

  const generatedPosition = line != null
    ? consumer.generatedPositionFor({ source: '0', line, column })
    : { line: null, column: null }

  return {
    original: {
      line,
      column,
    },
    generated: {
      line: generatedPosition.line,
      column: generatedPosition.column,
    }
  }
}
