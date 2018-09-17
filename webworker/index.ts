import { minify, MinifyOptions } from 'uglify-es'
import { positionFromOutputLogic, positionFromInputLogic } from './logic'

let sourceMap: string

export interface MinifyPayload {
  code: string
  options: MinifyOptions

}

const minifyAction = (payload: MinifyPayload) => {
  const { code, error, map } = minify(payload.code, payload.options)

  sourceMap = map

  return { code, error }
}

export interface PositionPayload {
  line: number
  column: number
}

const emptyPositions = { original: {}, generated: {} }

const positionFromInputAction = (payload: PositionPayload) => {
  if (!sourceMap) return emptyPositions

  return positionFromInputLogic(sourceMap, payload)
}

const positionFromOutputAction = (payload: PositionPayload) => {
  if (!sourceMap) return emptyPositions

  return positionFromOutputLogic(sourceMap, payload)
}

const actions = {
  minify: minifyAction,
  positionFromInput: positionFromInputAction,
  positionFromOutput: positionFromOutputAction,
}

addEventListener('message', async ({ data }) => {
  const action = (actions as any)[data.type]
  const payload = await action(data.payload)

  postMessage({
    key: data.key,
    payload,
  })
})
