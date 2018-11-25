const versionChanged = require('version-changed')
const prebuildify = require('prebuildify')
const path = require('path')
const tar = require('tar')
const abi = require('node-abi')
const gh = require('ghreleases')

const pkg = require('../package.json')

function main () {
  versionChanged((err, changed) => {
    if (err) exit(err)
    if (!changed) {
      console.log('Version hasn\'t changed. Skipping!')
      process.exit(0)
    }
    build()
  })
}

function build () {
  function onlyNode (t) {
    return t.runtime === 'node'
  }

  function onlyElectron (t) {
    return t.runtime === 'electron'
  }

  const targets = [
    abi.supportedTargets.filter(onlyNode).pop(),
    abi.supportedTargets.filter(onlyElectron).pop()
  ]

  const opts = {
    quiet: false,
    strip: true,
    napi: true,
    targets,
    cwd: path.resolve(__dirname, '..')
  }

  prebuildify(opts, err => {
    if (err) exit(err)
    bundle()
  })
}

function bundle () {
  const prebuilds = `${process.platform}-${process.arch}`
  const file = `v${pkg.version}-${process.platform}-${process.arch}.tar.gz`
  const cwd = path.join(process.cwd(), 'prebuilds')
  // TODO fix so prebuildify-ci handles tar.gz!
  tar.c({ file, cwd, gzip: true }, [ prebuilds ], err => {
    if (err) exit(err)
    uploadToRelease(path.resolve(__dirname, '..', file))
  })
}

function uploadToRelease (file) {
  const token = process.env.GH_TOKEN
  if (typeof token !== 'string') {
    return exit(new Error('missing GH_TOKEN'))
  }

  const auth = { user: 'x-oauth', token }
  const user = 'deltachat'
  const repo = 'deltachat-node'
  const tag = `v${pkg.version}`

  console.log('Creating release ..')
  gh.create(auth, user, repo, { tag_name: tag }, () => {
    console.log('-> Done!')
    gh.getByTag(auth, user, repo, tag, (err, release) => {
      if (err) return exit(err)
      console.log('Uploading file', file, '..')
      gh.uploadAssets(auth, user, repo, 'tags/' + tag, [ file ], err => {
        if (err) return exit(err)
        console.log('-> Done!')
        process.exit(0)
      })
    })
  })
}

function exit (err) {
  if (err) {
    console.error(err.message || err)
    process.exit(1)
  }
}

main()
