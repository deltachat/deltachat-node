const DeltaChat = require('.')
const minimist = require('minimist')

let dc = new DeltaChat(minimist(process.argv.slice(2)))
console.log(dc)
dc.stopThreads()
dc.unsetEventHandler()
dc.on('test', (...args) => console.log(...args))
dc.emit('test', 1, 2)
