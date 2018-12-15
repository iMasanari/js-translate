import terser from 'terser'
import { readFileSync } from 'fs'

export default () => ({
  resolveId(id) {
    if (id === 'terser') return '\0terser'
  },
  load(id) {
    if (id !== '\0terser') return

    return `import * as MOZ_SourceMap from 'source-map';\n`
      + terser.FILES
        .filter((file) => !/\/(exports|mozilla-ast)\.js$/.test(file))
        .map((file) => readFileSync(file, 'utf-8'))
        .join('\n') + '\nexport { Dictionary, TreeWalker, TreeTransformer, minify, push_uniq as _push_uniq }'
  },
})
