'use strict';

const crypto = require('crypto');
const countries = require('i18n-iso-countries');

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/cs.json'));

const PRIMARY_LOCALE = 'cs';
const SECONDARY_LOCALE = 'en';
const ENABLED_COUNTRY_CODES = new Set(['ES', 'FR']);
const DEFAULT_LOCALE_STORE_KEY = 'plugin_i18n_default_locale';
const CHUNK_SIZE = 40;

const PROTECTED_TABLE_PATTERNS = [
  /^admin_/,
  /^up_/,
  /^strapi_migrations$/,
  /^strapi_migrations_internal$/,
  /^strapi_database_schema$/,
  /^strapi_core_store_settings$/,
  /^strapi_api_token/,
  /^strapi_transfer_token/,
  /^strapi_webhooks$/,
  /^strapi_sessions$/,
];

function createDocumentId() {
  return crypto.randomBytes(12).toString('hex');
}

function slugify(value) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function isProtectedTable(tableName) {
  return PROTECTED_TABLE_PATTERNS.some((pattern) => pattern.test(tableName));
}

function getCountrySeed() {
  const englishNames = countries.getNames(SECONDARY_LOCALE, { select: 'official' });
  const codes = Object.keys(englishNames).sort((left, right) =>
    left.localeCompare(right, 'en', { sensitivity: 'base' }),
  );

  const usedSlugs = new Set();

  return codes.map((code) => {
    const nameEn = countries.getName(code, SECONDARY_LOCALE, { select: 'official' });
    const nameCs =
      countries.getName(code, PRIMARY_LOCALE, { select: 'official' }) ||
      countries.getName(code, PRIMARY_LOCALE);

    const baseSlug = slugify(nameEn) || code.toLowerCase();
    let slug = `${baseSlug}-${code.toLowerCase()}`;
    let suffix = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${code.toLowerCase()}-${suffix}`;
      suffix += 1;
    }
    usedSlugs.add(slug);

    return {
      code,
      slug,
      enabled: ENABLED_COUNTRY_CODES.has(code),
      nameEn,
      nameCs,
      descriptionCs: `${nameCs} je samostatný stát evidovaný pod kódem ${code}. Záznam je připraven v češtině i angličtině pro vícejazyčné plánování cest.`,
      descriptionEn: `${nameEn} is a sovereign country identified by ISO code ${code}. This record is seeded in Czech and English for multilingual trip planning.`,
    };
  });
}

async function clearDatabaseData(knex, db) {
  const schema = await db.dialect.schemaInspector.getSchema();
  const tableNames = schema.tables
    .map((table) => table.name)
    .filter((tableName) => !isProtectedTable(tableName));

  if (tableNames.length === 0) {
    return;
  }

  const client = String(db?.config?.connection?.client || '').toLowerCase();

  if (client.includes('postgres')) {
    const quotedTables = tableNames
      .map((tableName) => `"${tableName.replace(/"/g, '""')}"`)
      .join(', ');
    await knex.raw(`TRUNCATE TABLE ${quotedTables} RESTART IDENTITY CASCADE`);
    return;
  }

  if (client.includes('mysql')) {
    await knex.raw('SET FOREIGN_KEY_CHECKS = 0');
    for (const tableName of tableNames) {
      // eslint-disable-next-line no-await-in-loop
      await knex(tableName).del();
    }
    await knex.raw('SET FOREIGN_KEY_CHECKS = 1');
    return;
  }

  if (client.includes('sqlite')) {
    await knex.raw('PRAGMA foreign_keys = OFF');
    try {
      for (const tableName of tableNames) {
        // eslint-disable-next-line no-await-in-loop
        await knex(tableName).del();
      }
    } finally {
      await knex.raw('PRAGMA foreign_keys = ON');
    }
    return;
  }

  for (const tableName of tableNames) {
    // eslint-disable-next-line no-await-in-loop
    await knex(tableName).del();
  }
}

async function ensureEnabledColumn(knex) {
  const hasCountriesTable = await knex.schema.hasTable('countries');
  if (!hasCountriesTable) {
    return;
  }

  const hasEnabledColumn = await knex.schema.hasColumn('countries', 'enabled');
  if (hasEnabledColumn) {
    return;
  }

  await knex.schema.alterTable('countries', (table) => {
    table.boolean('enabled').notNullable().defaultTo(false);
  });
}

async function seedLocales(knex, now) {
  const hasLocaleTable = await knex.schema.hasTable('i18n_locale');
  if (!hasLocaleTable) {
    return;
  }

  await knex('i18n_locale').insert([
    {
      document_id: createDocumentId(),
      name: 'Čeština (cs)',
      code: PRIMARY_LOCALE,
      locale: null,
      created_at: now,
      updated_at: now,
      published_at: now,
    },
    {
      document_id: createDocumentId(),
      name: 'English (en)',
      code: SECONDARY_LOCALE,
      locale: null,
      created_at: now,
      updated_at: now,
      published_at: now,
    },
  ]);
}

async function setDefaultLocale(knex) {
  const hasCoreStoreTable = await knex.schema.hasTable('strapi_core_store_settings');
  if (!hasCoreStoreTable) {
    return;
  }

  await knex('strapi_core_store_settings').where({ key: DEFAULT_LOCALE_STORE_KEY }).del();
  await knex('strapi_core_store_settings').insert({
    key: DEFAULT_LOCALE_STORE_KEY,
    value: JSON.stringify(PRIMARY_LOCALE),
    type: 'string',
    environment: null,
    tag: null,
  });
}

async function seedCountries(knex, now) {
  const hasCountriesTable = await knex.schema.hasTable('countries');
  if (!hasCountriesTable) {
    return;
  }

  const countrySeed = getCountrySeed();
  const rows = [];

  for (const country of countrySeed) {
    const documentId = createDocumentId();
    const common = {
      document_id: documentId,
      slug: country.slug,
      iso_code: country.code,
      is_state: false,
      enabled: country.enabled,
      created_at: now,
      updated_at: now,
      published_at: now,
    };

    rows.push({
      ...common,
      locale: PRIMARY_LOCALE,
      name: country.nameCs,
      description: country.descriptionCs,
    });

    rows.push({
      ...common,
      locale: SECONDARY_LOCALE,
      name: country.nameEn,
      description: country.descriptionEn,
    });
  }

  for (let index = 0; index < rows.length; index += CHUNK_SIZE) {
    const chunk = rows.slice(index, index + CHUNK_SIZE);
    // eslint-disable-next-line no-await-in-loop
    await knex('countries').insert(chunk);
  }
}

module.exports = {
  async up(knex, db) {
    const now = new Date();

    await clearDatabaseData(knex, db);
    await ensureEnabledColumn(knex);
    await seedLocales(knex, now);
    await setDefaultLocale(knex);
    await seedCountries(knex, now);
  },

  async down() {},
};
