const Client = require('./Client')
const Core = require('./core')

function Sylphy (opts) {
  return new Client(opts)
}

module.exports = Object.assign(Sylphy, Core,
  require('./util'),
  require('./structures'),
  require('./managers')
)
