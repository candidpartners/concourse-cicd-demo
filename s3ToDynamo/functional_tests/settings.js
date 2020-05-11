let settings
let infrastructure

if (process.env.PIPELINE === '1') {
  // Running in pipeline; settings dir is at same level as source checkout
  settings = require('../../../settings/settings.json')
  infrastructure = require('../../../settings/infrastructure.json')
} else {
  // Running locally; settings dir is inside project root
  settings = require('../../settings/settings.json')
  infrastructure = require('../../settings/infrastructure.json')
}

module.exports = {
  settings,
  infrastructure,
}
