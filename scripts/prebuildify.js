const prebuildify = require('prebuildify')
const path = require('path')
const tar = require('tar')
const versionChanged = require('version-changed')
const gh = require('ghreleases')

const pkg = require('../package.json')

function build () {
  const targets = [
    { runtime: 'node', target: '10.6.0' },
    { runtime: 'electron', target: '4.0.0' }
  ]

  const opts = {
    quiet: false,
    strip: false,
    napi: true,
    targets,
    cwd: path.resolve(__dirname, '..')
  }

  if (process.env.CI === 'true') {
    console.log('Running in CI.')
    if (process.env.TRAVIS === 'true') {
      console.log('Running in Travis.')
      const branch = process.env.TRAVIS_BRANCH
      const tag = process.env.TRAVIS_TAG
      if (branch !== tag) {
        // Only allow a single build to prebuild and upload to GitHub.
        // When pushing a tag to GitHub, the branch and tag are identical
        // for one of the builds.
        console.log(`Branch ('${branch}') is different from tag ('${tag}'). Skipping.`)
        process.exit(0)
      }
    }
  }

  prebuildify(opts, err => {
    if (err) exit(err)
    versionChanged((err, changed) => {
      if (err) exit(err)
      if (changed) {
        bundle()
      } else {
        console.log('Version didn\'t change. Skipping bundle and upload!')
      }
    })
  })
}

function bundle () {
  // FIXME. Temporary fix so Jenkins which is faster can upload
  // binaries. Travis uses deploy functionality in .travis.yml and
  // not using the ghreleases module (which seems to fail if there
  // are already binaries uploaded)
  if (process.env.TRAVIS === 'true') return

  const prebuilds = `${process.platform}-${process.arch}`
  const file = `v${pkg.version}-${process.platform}-${process.arch}.tar.gz`
  const cwd = path.join(process.cwd(), 'prebuilds')
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

build()
