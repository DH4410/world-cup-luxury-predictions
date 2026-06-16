module.exports = {
  apps: [
    {
      name: 'wc-auth',
      script: 'index.js',
      cwd: './auth',
      env: { NODE_ENV: 'production' },
      restart_delay: 3000,
      max_restarts: 10,
    },
    {
      name: 'wc-game',
      script: 'index.js',
      cwd: './game',
      env: { NODE_ENV: 'production' },
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};
