let settings
let infrastructure

if (process.env.PIPELINE === '1') {
  // Running in pipeline; settings dir is at same level as source checkout
  settings = require('../../../settings/settings.json')
  infrastructure = {
    global: require('../../infrastructure/global/output.json'),
    regional: {
      primary: require('../../infrastructure/regional/primary_output.json'),
      secondary: require('../../infrastructure/regional/secondary_output.json'),
    },
  }
} else {
  // Running locally; settings dir is inside project root
  settings = require('../../settings/settings.json')
  infrastructure = {
    global: require('../infrastructure/global/output.json'),
    regional: {
      primary: require('../infrastructure/regional/primary_output.json'),
      secondary: require('../infrastructure/regional/secondary_output.json'),
    },
  }
}

module.exports = {
  settings,
  infrastructure,
}
