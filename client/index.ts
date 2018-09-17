import createOverlayText from './createOverlayText'
import createErrorText from './createErrorText'
import { createWorkPromise } from './createWorkPromise'

const $inputOverlay = document.getElementById('input-overlay')!
const $inputTextarea = document.getElementById('input-textarea') as HTMLTextAreaElement
const $outputOverlay = document.getElementById('output-overlay')!
const $outputTextarea = document.getElementById('output-textarea') as HTMLTextAreaElement

const $compress = document.getElementById('compress') as HTMLInputElement
const $mangle = document.getElementById('mangle') as HTMLInputElement
const $toplevel = document.getElementById('toplevel') as HTMLInputElement
const $beautify = document.getElementById('beautify') as HTMLInputElement

const work = createWorkPromise<any>(new Worker('webworker.js'))

const doMinify = async () => {
  const result = await work('minify', {
    code: $inputTextarea.value,
    options: {
      compress: $compress.checked,
      mangle: $mangle.checked,
      toplevel: $toplevel.checked,
      output: {
        beautify: $beautify.checked,
      },
      sourceMap: true,
    }
  })

  const code = result.error ? createErrorText(result.error, $inputTextarea.value) : result.code
  $outputTextarea.value = code
  $outputOverlay.innerHTML = createOverlayText(code)

  $outputTextarea.style.height = $outputOverlay.clientHeight + 'px'
  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value)
}

let inputTimer: NodeJS.Timer

$inputTextarea.addEventListener('input', () => {
  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value)
  $inputTextarea.style.height = $inputOverlay.clientHeight + 'px'

  clearTimeout(inputTimer)
  inputTimer = setTimeout(doMinify, 500)
})

$compress.addEventListener('click', doMinify)
$mangle.addEventListener('click', doMinify)
$toplevel.addEventListener('click', doMinify)
$beautify.addEventListener('click', doMinify)

const getSelectionPosition = ($textarea: HTMLTextAreaElement) => {
  const selection = $textarea.selectionStart
  const lines = $textarea.value.slice(0, selection).split('\n')
  const line = lines.length
  const column = lines[line - 1].length

  return { line, column }
}

$inputTextarea.addEventListener('click', async () => {
  const selectionPosition = getSelectionPosition($inputTextarea)
  const { original, generated } = await work('positionFromInput', selectionPosition)

  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value, original)
  $outputOverlay.innerHTML = createOverlayText($outputTextarea.value, generated)
})

$outputTextarea.addEventListener('click', async () => {
  const selectionPosition = getSelectionPosition($outputTextarea)
  const { original, generated } = await work('positionFromOutput', selectionPosition)

  $inputOverlay.innerHTML = createOverlayText($inputTextarea.value, original)
  $outputOverlay.innerHTML = createOverlayText($outputTextarea.value, generated)
})
