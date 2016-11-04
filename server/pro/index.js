'use strict'

const Wreck = require('wreck')
// const _ = require('lodash')

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
    callback(null, it.join('/') + '?include_docs=true', { accept: 'application/json' })
  }

  const responder = (go, err, res, request, reply, settings, ttl) => {
    // if (err) { return reply(err) } // FIXME: how to test?
    if (res.statusCode >= 400) { return reply(res.statusMessage).code(res.statusCode) }
    Wreck.read(res, { json: true }, go.bind(null, res, request, reply))
  }

  const go = (res, request, reply, err, payload) => {
    // console.log(Object.keys(request))
    // console.log('url:', request.url)
    // console.log('languages:', request.languages)
    // payload.pathname = request.url.pathname
    // payload.languages = _.uniq(request.languages)
    reply(payload).headers = res.headers
  }

  const go2 = (res, request, reply, err, payload) => {
    // console.log(Object.keys(request))
    // console.log('url:', request.url)
    // console.log('languages:', request.languages)
    let tpl
    let obj
    if (payload._id) {
      tpl = 'doc'
      obj = { doc: payload }
    } else if (payload.rows) {
      tpl = 'docs'
      obj = { docs: payload.rows.map((d) => d.doc) }
    } else {
      tpl = 'woot'
      obj = { doc: payload }
    }
    // obj.pathname = request.url.pathname
    // obj.languages = _.uniq(request.languages)
    reply.view(tpl, obj).etag(res.headers.etag)
  }

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
  dependencies: ['hapi-i18n', 'h2o2', 'vision']
}
