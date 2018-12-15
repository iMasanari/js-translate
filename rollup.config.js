import typescript from 'rollup-plugin-typescript2'
import nodeResolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { terser } from 'rollup-plugin-terser'
import loadTerser from './tools/rollup-plugin-load-terser'

const isProduction = process.env.NODE_ENV === 'puroduction'

const plugins = [
  loadTerser(),
  typescript(),
  nodeResolve(),
  commonjs(),
  isProduction && terser({ toplevel: true })
]

export default [{
  input: `./src/entry.client.ts`,
  output: {
    file: `./dist/bundle.client.js`,
    format: 'iife',
  },
  plugins,
  context: 'void 0',
}, {
  input: `./src/entry.webworker.ts`,
  output: {
    file: `./dist/bundle.webworker.js`,
    format: 'esm',
  },
  plugins,
  context: 'void 0',
}]
