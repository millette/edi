'use strict'

const Confidence = require('confidence')
const criteria = { env: process.env.NODE_ENV }

const defTrue = {
  $filter: 'env',
  prod: false,
  $default: true
}

const defFalse = {
  $filter: 'env',
  prod: true,
  $default: false
}

const config = {
  $meta: 'This file configures the plot device.',
  projectName: 'hapi-demo',
  app: { siteTitle: 'Super titre pour un super site' },
  i18n: {
    autoReload: defTrue,
    updateFiles: defTrue
  },
  cache: { web: defFalse },
  port: {
    web: {
      $filter: 'env',
      test: 9090,
      $default: 8095
    }
  }
}

const store = new Confidence.Store(config)
exports.get = (key) => store.get(key, criteria)
exports.meta = (key) => store.meta(key, criteria)
