const { exec } = require("node:child_process");

module.exports = {
  apps: [
    {
      name: 'kpd-backend',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
  ],
}