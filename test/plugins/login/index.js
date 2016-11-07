'use strict'

const Lab = require('lab')
const Code = require('code')
const Config = require('../../../config')
const Hapi = require('hapi')
const Vision = require('vision')
const Inert = require('inert')
const I18N = require('hapi-i18n')
const PickLanguage = require('../../../plugins/pick-language/index')
const ContextApp = require('hapi-context-app')
const HomePlugin = require('../../../server/web/index')
const LoginPlugin = require('../../../plugins/login/index')

const lab = exports.lab = Lab.script()
let request
let server

lab.beforeEach((done) => {
  const plugins = [ContextApp, Inert, PickLanguage, Vision, HomePlugin]
  server = new Hapi.Server()
  server.connection({ port: Config.get('/port/web') })
  server.settings.app = {
    siteTitle: Config.get('/app/siteTitle'),
    languages: Config.get('/i18n/locales')
  }

  server.register(
    {
      register: I18N,
      options: {
        locales: Config.get('/i18n/locales'),
        directory: 'locales'
      }
    },
    (err) => { if (err) { return done(err) } }
  )

  server.register(
    {
      register: LoginPlugin,
      options: { cookie: {
        password: Config.get('/cookie/password'),
        secure: Config.get('/cookie/secure')
      } }
    },
    (err) => { if (err) { return done(err) } }
  )

  server.register(plugins, (err) => {
    if (err) { return done(err) }
    server.views({
      engines: { html: require('lodash-vision') },
      path: './server/web'
    })

    done()
  })
})

lab.experiment('LOGIN Home Page View', () => {
  lab.beforeEach((done) => {
    request = {
      method: 'GET',
      url: '/fr/'
    }

    done()
  })

  lab.test('LOGIN home page renders properly (fr)', (done) => {
    server.inject(request, (response) => {
      Code.expect(response.result).to.match(/action="\/user\/login"/i)
      Code.expect(response.result).to.match(/action="\/user\/register"/i)
      Code.expect(response.statusCode).to.equal(200)

      done()
    })
  })
})
