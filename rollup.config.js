import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

export default {
  input: 'src/templateParser.ts',
  output: [
    {
      // templateParser.min.js
      file: pkg.main,
      format: 'cjs',
      plugins: [uglify()]
    },
    {
      // templateParser.js
      file: pkg.main.replace('.min', ''),
      format: 'cjs',
    },
    {
      // templateParser.es.js
      file: pkg.module,
      format: 'es',
    },
  ],
  plugins: [
    typescript({
      typescript: require('typescript'),
    }),
  ],
}
