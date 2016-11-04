'use strict'

const Config = require('../../config')

exports.register = function (server, options, next) {
  server.ext('onPreResponse', (request, reply) => {
    server.settings.app.languages = Config.get('/i18n/locales')
    if (!request.i18n || !request.response) { return reply.continue() }
    if (request.response.variety === 'view') {
      request.response.source.context.pathparts = request.url.pathname.split('/').slice(1)
    }
    return reply.continue()
  })

  next()
}

exports.register.attributes = {
  name: 'pick-language',
  dependencies: ['hapi-context-app', 'hapi-i18n', 'vision']
}
