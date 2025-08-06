export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js'
  },
  platform: 'node',
  external: exclude
}

function exclude() {
  return true
}
