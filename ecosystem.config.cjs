module.exports = {
  apps: [
    {
      name: "kindleah-tutoring",
      script: "dist/index.js",
      interpreter: "node",
      node_args: "--experimental-vm-modules",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_file: ".env",
      error_file: "logs/pm2-error.log",
      out_file: "logs/pm2-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
    },
  ],
};
