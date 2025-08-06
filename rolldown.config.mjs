import resolve from '@rollup/plugin-node-resolve'

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    minify: true
  },
  external: [/node_modules/],
  platform: 'node',
  plugins: [resolve()]
}