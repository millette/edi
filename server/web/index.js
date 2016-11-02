'use strict'

exports.register = function (server, options, next) {
  const list1 = require('../../data/list1.json')
  const list2 = require('../../data/list2.json')

  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/',
    handler: {
      view: {
        template: 'index',
        context: { items: list1.items, items2: list2.items }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/',
    handler: { view: 'pick-language' }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/partials',
    handler: { view: 'partials' }
  })

  server.route({
    method: 'GET',
    path: '/{languageCode}/multilingual',
    handler: { view: 'multilingual' }
  })

  server.route({
    method: 'GET',
    path: '/css/{param*}',
    handler: { directory: { path: 'assets/css/' } }
  })

  server.route({
    method: 'GET',
    path: '/js/{param*}',
    handler: { directory: { path: 'assets/js/' } }
  })

  server.route({
    method: 'GET',
    path: '/img/{param*}',
    handler: { directory: { path: 'assets/img/' } }
  })

  next()
}

exports.register.attributes = {
  name: 'web',
  dependencies: ['hapi-i18n', 'vision', 'inert']
}
