'use strict'

// npm
const pify = require('pify')
const nano = require('nano')

const db = nano('http://localhost:5990/')
const auth = pify(db.auth, { multiArgs: true})
const dbUsers = db.use('_users')
const createUser = pify(dbUsers.insert, { multiArgs: true})

const nextUrl = (request, reply) => reply.redirect(request.payload.next || '/')

const login = function (request, reply) {
  if (request.auth.isAuthenticated) { return nextUrl(request, reply) }
  auth(request.payload.name, request.payload.password)
    .then((result) => {
      const body = result[0]
      delete body.ok
      body.cookie = result[1]['set-cookie']
      request.server.app.cache.set(body.name, { account: body }, 0, (err) => {
        if (err) { return reply(err) }
        request.cookieAuth.set({ sid: body.name })
        nextUrl(request, reply)
      })
    })
    .catch((err) => reply.boom(err.statusCode || 500, err))
}

const logout = function (request, reply) {
  request.cookieAuth.clear()
  nextUrl(request, reply)
}

const register = function (request, reply) {
  if (request.auth.isAuthenticated) { return nextUrl(request, reply) }
  // TODO: Use Joi validation instead
  if (request.payload.password !== request.payload.password2) { return reply.notAcceptable('Passwords don\'t match.') }
  if (!request.payload.name) { return reply.notAcceptable('Name required.') }
  if (!request.payload.password) { return reply.notAcceptable('Password required.') }
  const doc = {
    _id: 'org.couchdb.user:' + request.payload.name,
    name: request.payload.name,
    password: request.payload.password,
    type: 'user',
    roles: ['mmm']
  }
  if (request.payload.fullname) { doc.fullname = request.payload.fullname }
  createUser(doc)
    .then(() => login(request, reply))
    .catch((err) => reply.boom(err.statusCode || 500, err))
}

exports.register = (server, options, next) => {
  server.register([require('hapi-boom-decorators'), require('hapi-auth-cookie')], options, (err) => {
    if (err) { throw err }
    const cache = server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 })
    server.app.cache = cache
    server.auth.strategy('session', 'cookie', 'try', {
      password: 'password-should-be-32-characters',
      isSecure: false,
      validateFunc: (request, session, callback) => {
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
        config: { auth: { mode: 'required' }, handler: logout }
      }
    ])
  })

  next()
}

exports.register.attributes = {
  name: 'login',
  dependencies: ['hapi-boom-decorators', 'hapi-auth-cookie']
}
