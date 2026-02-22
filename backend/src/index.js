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
    const runBootstrapI18nSetup = process.env.RUN_BOOTSTRAP_I18N_SETUP === 'true';
    const runBootstrapContentSeed = process.env.RUN_BOOTSTRAP_CONTENT_SEED === 'true';

    if (runBootstrapI18nSetup) {
      try {
        await runI18nSetup(strapi);
      } catch (error) {
        strapi.log.error('[i18n] Failed during i18n bootstrap setup', error);
      }
    } else {
      strapi.log.info('[i18n] Skipping bootstrap i18n setup (RUN_BOOTSTRAP_I18N_SETUP!=true)');
    }

    if (runBootstrapContentSeed) {
      try {
        await runInitialContentSeed(strapi);
      } catch (error) {
        strapi.log.error('[seed] Failed to bootstrap initial content', error);
      }
    } else {
      strapi.log.info('[seed] Skipping bootstrap content seed (RUN_BOOTSTRAP_CONTENT_SEED!=true)');
    }
  },
};
