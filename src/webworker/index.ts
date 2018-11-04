import { minify, MinifyOptions } from 'terser'
import { SourceMapConsumer } from 'source-map'
// @ts-ignore
import merge from 'merge-source-map'
import { transform } from './logic/babelLogic'
import { positionFromOutputLogic, positionFromInputLogic } from './logic/positponLogic'
import createErrorText from './createErrorText'

let sourceMapCustomer: SourceMapConsumer | null

export interface TranspilePayload {
  code: string
  useBabel: boolean
  options: MinifyOptions
}

const transpileAction = (payload: TranspilePayload) => {
  let result = { code: payload.code } as {
    code: string
    error: any
    map: any
  }

  if (payload.useBabel) {
    result = transform(payload.code, {
      presets: [
        'es2015-no-commonjs',
        ['stage-2', { decoratorsLegacy: true }],
      ],
      plugins: [
        'proposal-object-rest-spread',
      ],
      sourceMap: true,
      filename: '0',
    })

    if (result.error) {
      return { error: result.error }
    }
  }

  const { code, error, map } = minify(result.code, payload.options)

  if (error) {
    return { error: createErrorText(error, result.code) }
  }

  sourceMapCustomer = !error
    ? new SourceMapConsumer(result.map ? merge(result.map, map) : map)
    : null

  return { code }
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
  minify: transpileAction,
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
