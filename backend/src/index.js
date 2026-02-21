'use strict';

const { runInitialContentSeed } = require('./seed/initial-content');

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    try {
      await runInitialContentSeed(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to bootstrap initial content', error);
    }
  },
};
