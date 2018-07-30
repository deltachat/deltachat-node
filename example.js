const DeltaChat = require('.')
const minimist = require('minimist')

let dc = new DeltaChat(minimist(process.argv.slice(2)))

dc.on('open', () => {
  console.log('open done')
  dc.stopThreads()
  dc.unsetEventHandler()
})
