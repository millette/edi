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
      const headers = result[1]
      delete body.ok
      body.cookie = headers['set-cookie']
      request.server.app.cache.set(body.name, { account: body }, 0, (err) => {
        if (err) { return reply(err) }
        request.cookieAuth.set({ sid: body.name })
        reply.redirect(nextUrl)
      })
    })
    .catch((err) => reply.redirect(nextUrl))
}

const logout = function (request, reply) {
  request.cookieAuth.clear()
  return reply.redirect('/')
}

exports.register = function (server, options, next) {
  server.register(require('hapi-auth-cookie'), options, (err) => {
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

    server.route({
      method: 'POST',
      path: '/login',
      handler: login
    })

    server.route({
      method: 'POST',
      path: '/logout',
      handler: logout
    })
  })

  next()
}

exports.register.attributes = {
  name: 'login',
  dependencies: ['hapi-auth-cookie']
}
