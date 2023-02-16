'use strict'
const { default: Redlock } = require('redlock')
const debug = require('debug')('strapi:plugin:redcron')

module.exports = ({ strapi }) => {
  const config = strapi.config.get('plugin.redcron')
  const originalAdd = strapi.cron.add

  strapi.cron.add = (tasks) => {
    const generateRedlockFunction = (originalFunction, name) => {
      return async (...args) => {
        const connections = Object.keys(strapi.redis.connections).map((key) => {
          return strapi.redis.connections[key].client
        })
        console.log(config.redlockConfig)
        const redlock = new Redlock(connections, config.redlockConfig)

        let lock
        try {
          lock = await redlock.acquire(name, config.lockTTL)
          debug(`Job ${name} acquired lock`)
          await originalFunction(...args)
        } catch (e) {
          debug(`Job ${name} failed to acquire lock`)
        } finally {
          // wait some time so other processes will lose the lock
          let lockDelay = config.lockDelay ? config.lockDelay : config.redlockConfig.retryCount
            * (config.redlockConfig.retryDelay + config.redlockConfig.retryJitter)
          debug(`Job ${name} waiting ${lockDelay}ms before releasing lock`)
          await new Promise((resolve) => setTimeout(resolve, lockDelay))
          if (lock) {
            debug(`Job ${name} releasing lock`)
            try {
              await lock.release()
            } catch (e) {
              debug(`Job ${name} failed to release lock ${e}`)
            }
          }
        }
      }
    }
    Object.keys(tasks).forEach((key) => {
      const taskValue = tasks[key]
      if (typeof taskValue === 'function') {
        strapi.log.info('redcron requires tasks to use the object format')
        return
      } else if (
        typeof taskValue === 'object' &&
        taskValue &&
        typeof taskValue.task === 'function' &&
        taskValue.bypassRedcron !== true
      ) {
        // fallback to key if no name is provided
        const taskName = taskValue.name || key
        taskValue.task = generateRedlockFunction(
          taskValue.task,
          'redcron:' + taskName
        )
      }
    })
    originalAdd(tasks)
  }
}
