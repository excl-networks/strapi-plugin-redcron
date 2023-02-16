<div align="center">
<h1>Strapi Redis Plugin</h1>
	
<p style="margin-top: 0;">A drop in replacement for the Strapi cron plugin that uses Redlock to prevent multiple instances of Strapi from running the same cron job at the same time.</p>
	
<p>
  <a href="https://www.npmjs.org/package/strapi-plugin-redcron">
    <img src="https://img.shields.io/npm/v/strapi-plugin-redcron/latest.svg" alt="NPM Version" />
  </a>
  <a href="https://www.npmjs.org/package/strapi-plugin-redcron">
    <img src="https://img.shields.io/npm/dm/strapi-plugin-redcron" alt="Monthly download on NPM" />
  </a>
</p>
</div>

## Table of Contents 

- [✨ Features](#-features)
- [🤔 Motivation](#-motivation)
- [🖐 Requirements](#-requirements)
- [⏳ Installation](#-installation)
- [🔧 Configuration](#-configuration)
- [🚚 Usage](#-usage)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

Drop-in* replacement for the Strapi cron plugin that uses Redlock to prevent multiple instances of Strapi from running the same cron job at the same time.

* requires minimal configuration.



## 🤔 Motivation
Currently, if you horizontally scale Strapi and use the cron plugin, you will end up with multiple instances of Strapi running the same cron job at the same time. This can cause issues with your database or other services that you are trying to integrate with.

## 🖐 Requirements

Install and configure the [Strapi Redis Plugin](https://github.com/strapi-community/strapi-plugin-redis)

This plugin needs to be registered before the cron plugin.

## ⏳ Installation

```bash
# Using Yarn (Recommended)
yarn add strapi-plugin-redcron

# Using npm
npm install strapi-plugin-redcron --save
```

## 🔧 Configuration

 

### Minimal Configuration

```js
module.exports = {
    redis: {
        // your redis config
    },
    redcron: {
        enabled: true,
    },

}
```

### Full Configuration
```js
module.exports = {
    redis: {
        // your redis config
    },
    redcron: {
        config: {
            redlockConfig: {
                driftFactor: 0.01,
                retryCount: 10,
                retryDelay: 200,
                retryJitter: 200,
            },
            lockDelay: null,
            lockTTL: 5000,
            debug: false,
        },
        enabled: true,
    },

}
```

## 🚚 Usage


### :warning: Warning 
You must use the object format for the cron jobs and include a name property.

You will need to update your existing cron jobs to add a name.

Adding the `bypassRedcron` property to your cron job will bypass the redlock logic and allow multiple instances of Strapi to run the same cron job at the same time.

Example:
```js
// path: ./config/cron-tasks.js

module.exports = {
  
myJob: {
     task: ({ strapi }) => {/* Add your own logic here */ },
     name: 'myJob',
     bypassRedcron: false, // optional
     options: {
        rule: '0 0 1 * * 1',
     },
   },
 };
```
Bootstrap Example:
```js
bootstrap({ strapi }) {
    strapi.cron.add({
      myJob: {
        task: async ({ strapi }) => {
          console.log("hello from bootstrap")

        },
        bypassRedcron: false, // optional
        name: 'myJob2',
        options: {
            rule: '*/10 * * * * *',
        }
      },
    })
  },
```



## Contributing

Feel free to open a PR if you want to contribute to this project. 

You can spin up a new Redis cluster for testing by running `docker-compose up` in the root of the project.
You can run Strapi multiple strapi instances at the same time by adding `server.js` to the root of your wrapper project
```js
//server.js
#!/usr/bin/env node
'use strict';

// Start Strapi
const strapi = require('@strapi/strapi');
strapi().start();
```
and running 

`pm2 start --name="mystrapiapp" server.js -i 2`

## License

See the [LICENSE](./LICENSE.md) file for licensing information.