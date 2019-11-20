import typescript from 'rollup-plugin-typescript2'
import { uglify } from 'rollup-plugin-uglify'
import pkg from './package.json'

export default {
  input: 'src/templateParser.ts',
  output: [
    {
      // templateParser.js
      file: pkg.main,
      format: 'cjs',
    },
    {
      // templateParser.min.js
      file: pkg.main.replace('.js', '.min.js'),
      format: 'cjs',
      plugins: [uglify()]
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
