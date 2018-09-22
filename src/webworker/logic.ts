import { SourceMapConsumer, Position } from 'source-map'
import { PositionPayload } from './'

// @ts-ignore
SourceMapConsumer.initialize({ 'lib/mappings.wasm': 'mappings.wasm' })

export const positionFromInputLogic = async (sourceMap: string, payload: PositionPayload) => {
  const consumer = await new SourceMapConsumer(sourceMap)

  const { line, column } = consumer.generatedPositionFor({
    source: '0',
    line: payload.line,
    column: payload.column,
  })

  const generated = { line, column }

  const originalPosition = line != null
    ? consumer.originalPositionFor(generated as Position)
    : { line: null, column: null }

  consumer.destroy()

  return {
    original: {
      line: originalPosition.line,
      column: originalPosition.column,
    },
    generated,
  }
}


export const positionFromOutputLogic = async (sourceMap: string, payload: PositionPayload) => {
  const consumer = await new SourceMapConsumer(sourceMap)

  const { line, column } = consumer.originalPositionFor({
    line: payload.line,
    column: payload.column,
  })

  const generatedPosition = line != null
    ? consumer.generatedPositionFor({ source: '0', line, column: column! })
    : { line: null, column: null }

  consumer.destroy()

  return {
    original: {
      line,
      column
    },
    generated: {
      line: generatedPosition.line,
      column: generatedPosition.column,
    }
  }
}
