'use strict'

const Wreck = require('wreck')

exports.register = (server, options, next) => {
  server.views({
    engines: { html: require('lodash-vision') },
    path: 'templates',
    partialsPath: 'templates/partials',
    isCached: options.templateCached
  })

  const mapper = (request, callback) => {
    const it = ['http://localhost:5990/ya']
    if (request.params.pathy) { it.push(request.params.pathy) }
    callback(null, it.join('/'), { accept: 'application/json' })
  }

  const responder = (go, err, res, request, reply, settings, ttl) => {
    if (err) { return reply(err) }
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, go.bind(null, reply, res))
  }

  const go = (reply, res, err, payload) => reply(payload).headers = res.headers
  const go2 = (reply, res, err, payload) => reply.view('woot', { doc: payload }).etag(res.headers.etag)

  server.route({
    method: 'GET',
    path: '/{pathy*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapper,
        onResponse: responder.bind(null, go)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/d/{pathy*}',
    handler: {
      proxy: {
        passThrough: true,
        mapUri: mapper,
        onResponse: responder.bind(null, go2)
      }
    }
  })

  next()
}

exports.register.attributes = {
  name: 'pro',
  dependencies: ['h2o2', 'vision']
}
