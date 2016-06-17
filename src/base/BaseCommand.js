const Tatsumaki = require('../')

class BaseCommand {
  constructor () {
    if (this.constructor === BaseCommand) {
      throw new Error('Can\'t instantiate abstract command!')
    }
    this.bot = Tatsumaki
    this.logger = Tatsumaki.logger
    this.init()

    this.bot.on(this.name, (args, msg, client) => {
      if (msg.channel.isPrivate && this.noPMs === true) {
        this.send(msg, 'You can\'t use this command in a DM!')
        return
      }
      this.message = msg
      this.client = client
      this.handle(args)
    })
    this.aliases.forEach(a => this.bot.on(a, (s, m, c) => this.handle(s, m, c)))
  }

  get name () {
    throw new Error('Names must be overwritten')
  }

  get description () {
    throw new Error('Description must be overwritten')
  }

  get aliases () {
    return []
  }

  get usage () {
    return ''
  }

  get cooldown () {
    return 0
  }

  get permissions () {
    return []
  }

  get hidden () {
    return false
  }

  get gif () {
    return null
  }

  get noPMs () {
    return false
  }

  init () {}

  handle (args) {}

  send (dest, content, options = {delay: 0, deleteDelay: 0}) {
    let {delay, deleteDelay} = options
    if (content.length > 20000) {
      this.logger.error(
        'Error sending a message larger than the character and rate limit\n' +
        content
      )
      return
    }

    if (delay) {
      return setTimeout(() => {
        this.client.sendMessage(dest, content, {delay: 0, deleteDelay})
      }, delay)
    }

    let msgRem = ''
    if (content.length > 2000) {
      content = content.match(/.{1,20000}/g)
      msgRem = content.shift()
      content = content.join('')
    }

    return new Promise((res, rej) => {
      this.client.sendMessage(dest, content)
      .then(msg => {
        if (deleteDelay) {
          this.client.sendMessage(msg, {wait: deleteDelay})
          .then(() => {
            if (!msgRem) res(msg)
          })
          .catch(err => rej(err))

          if (!msgRem) return
        }

        if (msgRem) {
          return this.send(dest, msgRem, options)
            .then(msg => {
              return res(Array.isArray(msg) ? msg.concat(msg) : [msg])
            })
            .catch(rej)
        }

        res(msg)
      })
      .catch(err => rej(err))
    })
  }

  reply (content, options = {delay: 0, deleteDelay: 0}) {
    return new Promise((res, rej) => {
      this.send(this.message, content, options).then(res).catch(rej)
    })
  }
}

module.exports = BaseCommand