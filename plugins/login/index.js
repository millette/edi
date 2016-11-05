'use strict'

exports.register = function (server, options, next) {
  server.register(require('hapi-auth-cookie'), options, (err) => {
    if (err) { throw err }
    server.cache({ segment: 'sessions', expiresIn: 3 * 24 * 60 * 60 * 1000 })
    server.auth.strategy('session', 'cookie', false, {
      password: 'password-should-be-32-characters',
//      cookie: 'sid-example',
//      redirectTo: '/login',
      isSecure: false,
      validateFunc: function (request, session, callback) {
        cache.get(session.sid, (err, cached) => {
          if (err) { return callback(err, false) }
          if (!cached) { return callback(null, false) }
          return callback(null, true, cached.account)
        })
      }
    })
  })

  next()
}

exports.register.attributes = {
  name: 'login',
  dependencies: ['hapi-auth-cookie']
}
