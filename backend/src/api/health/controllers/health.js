'use strict';

module.exports = {
  async index(ctx) {
    ctx.body = {
      status: 'ok',
      service: 'strapi',
      timestamp: new Date().toISOString(),
    };
  },
};
