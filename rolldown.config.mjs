export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js'
  },
  platform: 'node',
  external: exclude,
  minify:true
}

function exclude() {
  return true
}
