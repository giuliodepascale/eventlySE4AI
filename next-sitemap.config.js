const config = {
  siteUrl: 'https://www.eventlyitalia.com',
  generateRobotsTxt: true,
  additionalPaths: async () => {
    return [
      { loc: '/client', lastmod: new Date().toISOString() },
      { loc: '/server', lastmod: new Date().toISOString() },
      { loc: '/api/auth/login', lastmod: new Date().toISOString() },
      { loc: '/admin', lastmod: new Date().toISOString() },
      { loc: '/settings', lastmod: new Date().toISOString() },
      { loc: '/', lastmod: new Date().toISOString() },
    ];
  },
};

module.exports = config;
