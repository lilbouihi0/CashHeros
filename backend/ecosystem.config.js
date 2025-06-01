module.exports = {
  apps: [
    {
      name: 'cashheros-backend',
      script: 'server.js',
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_staging: {
        NODE_ENV: 'staging',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: 'logs/error.log',
      out_file: 'logs/out.log',
      merge_logs: true,
      time: true
    }
  ],
  deploy: {
    staging: {
      user: 'deploy-user',
      host: 'staging-server-ip',
      ref: 'origin/develop',
      repo: 'git@github.com:yourusername/cashheros.git',
      path: '/var/www/cashheros-backend-staging',
      'post-deploy': 'npm ci && npm run db:migrate && pm2 reload ecosystem.config.js --env staging'
    },
    production: {
      user: 'deploy-user',
      host: 'production-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/cashheros.git',
      path: '/var/www/cashheros-backend-production',
      'post-deploy': 'npm ci && npm run db:migrate && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'echo "Setting up production environment"'
    }
  }
};