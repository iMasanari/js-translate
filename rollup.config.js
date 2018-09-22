import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify-es'
import UglifyES from 'uglify-es'
import { readFileSync } from 'fs'

const file = process.env.BUILD || 'client'
const isProduction = process.env.NODE_ENV === 'puroduction'

const loadUglify = () => ({
  resolveId(id) {
    if (id === 'uglify-es') return './uglify-es'
  },
  load(id) {
    if (id !== './uglify-es') return

    return `import * as MOZ_SourceMap from 'source-map';\n`
      + UglifyES.FILES
        .filter((file) => !/\/(exports|mozilla-ast)\.js$/.test(file))
        .map((file) => readFileSync(file, 'utf-8'))
        .join('\n') + '\nexport { Dictionary, TreeWalker, TreeTransformer, minify, push_uniq as _push_uniq }'
  },
})

export default {
  input: `./src/entry.${file}.ts`,
  output: {
    file: `./dist/bundle.${file}.js`,
    format: file === 'client' ? 'iife' : 'esm',
  },
  plugins: [
    replace({ 'typeof fetch': JSON.stringify('function') }),
    loadUglify(),
    typescript(),
    nodeResolve(),
    commonjs(),
    isProduction && uglify({
      toplevel: true,
    })
  ],
  context: 'void 0'
}
