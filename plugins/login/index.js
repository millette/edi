'use strict'

const pify = require('pify')
const nano = require('nano')
const db = nano('http://localhost:5990/')
const dbAuth = pify(db.auth, { multiArgs: true})

const login = function (request, reply) {
  const nextUrl = request.payload.next || '/'
  if (request.auth.isAuthenticated) { return reply.redirect(nextUrl) }
  dbAuth(request.payload.name, request.payload.password)
    .then((result) => {
      const body = result[0]
      delete body.ok
      body.cookie = result[1]['set-cookie']
      request.server.app.cache.set(body.name, { account: body }, 0, (err) => {
        if (err) { return reply(err) }
        request.cookieAuth.set({ sid: body.name })
        reply.redirect(nextUrl)
      })
    })
    .catch((err) => reply.boom(err.statusCode || 500, err))
}

const logout = function (request, reply) {
  const nextUrl = request.payload.next || '/'
  request.cookieAuth.clear()
  return reply.redirect(nextUrl)
}

const register = function (request, reply) {
  const nextUrl = request.payload.next || '/'
  if (request.auth.isAuthenticated) { return reply.redirect(nextUrl) }
  return reply.redirect(nextUrl)
}

exports.register = function (server, options, next) {
  server.register([require('hapi-boom-decorators'), require('hapi-auth-cookie')], options, (err) => {
    if (err) { throw err }
    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 })
    server.app.cache = cache
    server.auth.strategy('session', 'cookie', 'try', {
      password: 'password-should-be-32-characters',
      isSecure: false,
      validateFunc: function (request, session, callback) {
        cache.get(session.sid, (err, cached) => {
          if (err) { return callback(err, false) }
          if (!cached) { return callback(null, false) }
          return callback(null, true, cached.account)
        })
      }
    })

    server.route([
      { method: 'POST', path: '/register', handler: register },
      { method: 'POST', path: '/login', handler: login },
      {
        method: 'POST',
        path: '/logout',
        config: {
          auth: { mode: 'required' },
          handler: logout
        }
      }
    ])
  })

  next()
}

exports.register.attributes = {
  name: 'login',
  dependencies: ['hapi-boom-decorators', 'hapi-auth-cookie']
}
