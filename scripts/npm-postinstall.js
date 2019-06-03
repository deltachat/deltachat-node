const fs = require('fs')
const path = require('path')

if (process.platform === 'win32') {
  const from = path.resolve(
    __dirname,
    '..',
    'deltachat-core-rust',
    'target',
    'release',
    'deltachat.dll'
  )
  const to = path.resolve(
    __dirname,
    '..',
    'build',
    'Release',
    'deltachat.dll'
  )
  copy(from, to, (err) => {
    if (err) throw err
    console.log(`Copied ${from} to ${to}`)
  })
}

function copy (from, to, cb) {
  fs.stat(from, (err, st) => {
    if (err) return cb(err)
    fs.readFile(from, (err, buf) => {
      if (err) return cb(err)
      fs.writeFile(to, buf, (err) => {
        if (err) return cb(err)
        fs.chmod(to, st.mode, cb)
      })
    })
  })
}
