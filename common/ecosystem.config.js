module.exports = {
  apps : [
    {
      name     : 'srv.auth',
      cwd      : '/home/rocket/ghss/services/auth',
      script   : 'dist/main.js',
    },
    {
      name     : 'srv.admin',
      cwd      : '/home/rocket/ghss/services/admin',
      script   : 'dist/main.js',
    },
  ],
}
