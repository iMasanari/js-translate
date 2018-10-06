import { minify, MinifyOptions } from 'uglify-es'
import { SourceMapConsumer } from 'source-map'
import { positionFromOutputLogic, positionFromInputLogic } from './logic'

let sourceMapCustomer: SourceMapConsumer | null

export interface MinifyPayload {
  code: string
  options: MinifyOptions
}

const minifyAction = (payload: MinifyPayload) => {
  const { code, error, map } = minify(payload.code, payload.options)

  sourceMapCustomer = error ? null : new SourceMapConsumer(map as any)

  return { code, error }
}

export interface PositionPayload {
  line: number
  column: number
}

const emptyPositions = { original: {}, generated: {} }

const positionFromInputAction = (payload: PositionPayload) => {
  if (!sourceMapCustomer) return emptyPositions

  return positionFromInputLogic(sourceMapCustomer, payload)
}

const positionFromOutputAction = (payload: PositionPayload) => {
  if (!sourceMapCustomer) return emptyPositions

  return positionFromOutputLogic(sourceMapCustomer, payload)
}

const actions = {
  minify: minifyAction,
  positionFromInput: positionFromInputAction,
  positionFromOutput: positionFromOutputAction,
}

addEventListener('message', ({ data }) => {
  const action = (actions as any)[data.type]
  const payload = action(data.payload)

  postMessage({
    key: data.key,
    payload,
  })
})
