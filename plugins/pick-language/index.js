'use strict'

const _ = require('lodash')

exports.register = function (server, options, next) {
  server.ext('onPreResponse', (request, reply) => {
    if (!request.i18n || !request.response) { return reply.continue() }
    if (request.response.variety === 'view') {
      request.response.source.context.pathparts = request.url.pathname.split('/').slice(1)
    }
    server.settings.app.languages = _.uniq(request.languages)
    return reply.continue()
  })

  next()
}

exports.register.attributes = {
  name: 'pick-language',
  dependencies: ['hapi-i18n', 'vision']
}
