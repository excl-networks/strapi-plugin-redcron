'use strict'

module.exports = {
  default: {
    redlockConfig:{
      driftFactor: 0.01,
      retryCount: 10,
      retryDelay: 200,
      retryJitter: 200,
    },
    lockDelay: null,
    lockTTL: 5000,
    debug: false,
  },
  validator() {},
}
