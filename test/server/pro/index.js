'use strict'

const Lab = require('lab')
const Code = require('code')
const Config = require('../../../config')
const Hapi = require('hapi')
const Proxy = require('h2o2')
const Vision = require('vision')
const Inert = require('inert')
const I18N = require('hapi-i18n')
const HomePlugin = require('../../../server/pro/index')

const lab = exports.lab = Lab.script()
let request
let server

lab.beforeEach((done) => {
  const plugins = [Proxy, Inert, Vision, HomePlugin]
  server = new Hapi.Server()
  server.connection({ port: Config.get('/port/web') })

  server.register(
    {
      register: I18N,
      options: {
        locales: ['fr', 'en'],
        directory: 'locales'
      }
    },
    function (err) {
      if (err) {
        return done(err)
      }
    }
  )

  server.register(plugins, (err) => {
    if (err) {
      return done(err)
    }

    server.views({
      engines: { html: require('lodash-vision') },
      path: './server/web'
    })

    done()
  })
})

lab.experiment('Home Page View', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/d/abc'
    }

    done()
  })

  lab.test('home page renders properly (fr)', (done) => {
    server.inject(request, (response) => {
      // console.log('REZ:', response.result)
      Code.expect(response.result).to.match(/un doc/i)
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})

lab.experiment('Home Page View', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/abc'
    }

    done()
  })

  lab.test('home page renders properly (fr)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result._id).to.equal('abc')
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})

lab.experiment('Nope', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/abcde'
    }

    done()
  })

  lab.test('home page renders properly (fr)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/object not found/i)
      Code.expect(response.statusCode).to.equal(404)

      done()
    })
  })
})

lab.experiment('All', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/_all_docs'
    }

    done()
  })

  lab.test('home page renders properly (fr)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result.offset).to.equal(0)
      Code.expect(response.result.rows[0].doc._id).to.equal('abc')
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})

lab.experiment('Home Page View (en)', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/'
    }

    done()
  })

  lab.test('home page renders properly', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result.db_name).to.equal('ya')
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})
