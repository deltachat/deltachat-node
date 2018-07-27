const DeltaChat = require('.')
const minimist = require('minimist')

DeltaChat(minimist(process.argv.slice(2)))
