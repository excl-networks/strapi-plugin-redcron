'use strict'
const debug = require('debug')
module.exports = ({ strapi }) => {
  // bootstrap phase
  console.log(strapi.config.get('plugin.redcron'))
  if (!strapi.redis) {
    return strapi.log.error('redcron plugin requires strapi-redis plugin to be installed and configured')
  }
  if (strapi.config.get('plugin.redcron').debug) {
    // enable debug if debug is set to true in the config
    debug.enable('strapi:plugin:redcron')
    debug('redcron config: ' + strapi.config.get('plugin.redcron'))
  }
}
