'use strict';

const { runI18nSetup } = require('./bootstrap/i18n-setup');
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
      await runI18nSetup(strapi);
    } catch (error) {
      strapi.log.error('[i18n] Failed during i18n bootstrap setup', error);
    }

    try {
      await runInitialContentSeed(strapi);
    } catch (error) {
      strapi.log.error('[seed] Failed to bootstrap initial content', error);
    }
  },
};
