import { minify, MinifyOptions } from 'uglify-es'
import { SourceMapConsumer } from 'source-map'
import createOverlayText from './createOverlayText'
import createErrorText from './createErrorText'

// @ts-ignore
SourceMapConsumer.initialize({ 'lib/mappings.wasm': 'mappings.wasm' })

let sourceMapConsumer: SourceMapConsumer | undefined
let promise: Promise<SourceMapConsumer> | undefined

const transpile = (src: string, option?: MinifyOptions) => {
  let destroyPromise
  // 古いものを削除
  if (promise) {
    destroyPromise = promise.then(v => v.destroy())
    promise = sourceMapConsumer = undefined
  }

  const result = minify(src, option)

  if (result.map) {
    (destroyPromise || Promise.resolve())
      .then(() => promise = new SourceMapConsumer(result.map))
      .then((v) => sourceMapConsumer = v)
  }

  return result
}

const $inputOverlay = document.getElementById('input-overlay')!
const $inputTextarea = document.getElementById('input-textarea') as HTMLTextAreaElement
const $outputOverlay = document.getElementById('output-overlay')!
const $outputTextarea = document.getElementById('output-textarea') as HTMLTextAreaElement

const $compress = document.getElementById('compress') as HTMLInputElement
const $mangle = document.getElementById('mangle') as HTMLInputElement
const $toplevel = document.getElementById('toplevel') as HTMLInputElement
const $beautify = document.getElementById('beautify') as HTMLInputElement

const doTranspile = () => {
  const result = transpile($inputTextarea.value, {
    compress: $compress.checked,
    mangle: $mangle.checked,
    toplevel: $toplevel.checked,
    output: {
      beautify: $beautify.checked,
    },
    sourceMap: true,
  })

  const value = result.error ? createErrorText(result.error, $inputTextarea.value) : result.code
  $outputTextarea.value = value
  $outputOverlay.innerHTML = createOverlayText(value)

  $outputTextarea.style.height = $outputOverlay.clientHeight + 'px'
  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value)
}

let inputTimer: NodeJS.Timer
$inputTextarea.addEventListener('input', () => {
  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value)
  $inputTextarea.style.height = $inputOverlay.clientHeight + 'px'

  clearTimeout(inputTimer)
  inputTimer = setTimeout(doTranspile, 500)
})

$compress.addEventListener('click', doTranspile)
$mangle.addEventListener('click', doTranspile)
$toplevel.addEventListener('click', doTranspile)
$beautify.addEventListener('click', doTranspile)

const getSelectionPosition = ($textarea: HTMLTextAreaElement) => {
  const selection = $textarea.selectionStart
  const lines = $textarea.value.slice(0, selection).split('\n')
  const line = lines.length
  const column = lines[line - 1].length

  return { line, column }
}

$inputTextarea.addEventListener('click', () => {
  if (!sourceMapConsumer) return

  const { line, column } = getSelectionPosition($inputTextarea)
  const pos = sourceMapConsumer.generatedPositionFor({ source: '0', line, column })

  $outputOverlay.innerHTML = createOverlayText($outputTextarea.value, pos)

  if (pos.line) {
    const inputPos = sourceMapConsumer.originalPositionFor(pos as any)
    $inputOverlay.innerHTML = createOverlayText($inputTextarea.value, inputPos)
  }
})

$outputTextarea.addEventListener('click', () => {
  if (!sourceMapConsumer) return

  const pos = sourceMapConsumer.originalPositionFor(
    getSelectionPosition($outputTextarea)
  )

  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value, pos)

  if (pos.line) {
    const inputPos = sourceMapConsumer.generatedPositionFor({
      source: '0',
      line: pos.line!,
      column: pos.column!,
    })
    $outputOverlay.innerHTML = createOverlayText($outputTextarea.value, inputPos)
  }
})
