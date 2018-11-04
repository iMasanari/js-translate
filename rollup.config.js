import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import terser_ from 'terser'
import { readFileSync } from 'fs'

const file = process.env.BUILD || 'client'
const isProduction = process.env.NODE_ENV === 'puroduction'

const loadUglify = () => ({
  resolveId(id) {
    if (id === 'terser') return './terser'
  },
  load(id) {
    if (id !== './terser') return

    return `import * as MOZ_SourceMap from 'source-map';\n`
      + terser_.FILES
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
    loadUglify(),
    typescript(),
    nodeResolve(),
    commonjs(),
    isProduction && terser({
      toplevel: true,
    })
  ],
  context: 'void 0'
}
