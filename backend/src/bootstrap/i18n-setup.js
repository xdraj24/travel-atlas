'use strict';

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English (en)', isDefault: true },
  { code: 'cs', name: 'Czech (cs)', isDefault: false },
];
const SUPPORTED_LOCALE_CODES = new Set(SUPPORTED_LOCALES.map((locale) => locale.code));
const MIGRATION_BATCH_SIZE = 100;

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
}

function normalizeId(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) return value;
  return undefined;
}

function getLocalizationIds(entry) {
  return asArray(entry?.localizations)
    .map((localization) => normalizeId(localization?.id ?? localization))
    .filter(Boolean);
}

function isLocalizedApiContentType(contentType) {
  if (!contentType || !contentType.uid || !contentType.uid.startsWith('api::')) {
    return false;
  }

  const isSupportedKind =
    contentType.kind === 'collectionType' || contentType.kind === 'singleType';
  if (!isSupportedKind) {
    return false;
  }

  const localized =
    contentType.pluginOptions?.i18n?.localized === true ||
    contentType.options?.pluginOptions?.i18n?.localized === true;

  return localized;
}

async function localeFindMany(strapi) {
  if (strapi.entityService && typeof strapi.entityService.findMany === 'function') {
    try {
      return asArray(await strapi.entityService.findMany('plugin::i18n.locale', {}));
    } catch {
      // Fallback to query engine below.
    }
  }

  return asArray(await strapi.db.query('plugin::i18n.locale').findMany());
}

async function localeCreate(strapi, data) {
  if (strapi.entityService && typeof strapi.entityService.create === 'function') {
    try {
      return await strapi.entityService.create('plugin::i18n.locale', { data });
    } catch {
      // Fallback to query engine below.
    }
  }

  return strapi.db.query('plugin::i18n.locale').create({ data });
}

async function localeUpdate(strapi, id, data) {
  if (strapi.entityService && typeof strapi.entityService.update === 'function') {
    try {
      return await strapi.entityService.update('plugin::i18n.locale', id, { data });
    } catch {
      // Fallback to query engine below.
    }
  }

  return strapi.db.query('plugin::i18n.locale').update({
    where: { id },
    data,
  });
}

async function ensureLocales(strapi) {
  const localeQuery = strapi.db.query('plugin::i18n.locale');
  if (!localeQuery) {
    strapi.log.warn('[i18n] Locale model is unavailable, skipping locale setup');
    return;
  }

  const existingLocales = await localeFindMany(strapi);
  const localesByCode = new Map(existingLocales.map((locale) => [locale.code, locale]));

  for (const localeConfig of SUPPORTED_LOCALES) {
    const existing = localesByCode.get(localeConfig.code);

    if (!existing) {
      const created = await localeCreate(strapi, localeConfig);
      localesByCode.set(localeConfig.code, created);
      strapi.log.info(`[i18n] Created locale "${localeConfig.code}"`);
      continue;
    }

    const updates = {};
    if (existing.name !== localeConfig.name) {
      updates.name = localeConfig.name;
    }
    if (Boolean(existing.isDefault) !== localeConfig.isDefault) {
      updates.isDefault = localeConfig.isDefault;
    }

    if (Object.keys(updates).length > 0) {
      await localeUpdate(strapi, existing.id, updates);
      strapi.log.info(`[i18n] Updated locale "${localeConfig.code}" settings`);
    }
  }

  const refreshedLocales = await localeFindMany(strapi);
  for (const locale of refreshedLocales) {
    const shouldBeDefault = locale.code === DEFAULT_LOCALE;
    if (Boolean(locale.isDefault) === shouldBeDefault) continue;

    await localeUpdate(strapi, locale.id, { isDefault: shouldBeDefault });
  }
}

async function hasLocaleColumn(strapi, contentType) {
  if (!contentType?.collectionName) return false;

  try {
    return await strapi.db.connection.schema.hasColumn(contentType.collectionName, 'locale');
  } catch (error) {
    strapi.log.warn(
      `[i18n] Unable to check locale column for ${contentType.uid}: ${error.message}`,
    );
    return false;
  }
}

async function updateEntry(strapi, uid, id, data) {
  if (strapi.entityService && typeof strapi.entityService.update === 'function') {
    try {
      return await strapi.entityService.update(uid, id, { data });
    } catch {
      // Fallback to query engine below.
    }
  }

  return strapi.db.query(uid).update({
    where: { id },
    data,
  });
}

async function migrateEntryLocale(strapi, uid, entry) {
  if (!entry || !entry.id) return false;

  const localeCode = typeof entry.locale === 'string' ? entry.locale.trim() : '';
  const hasDefaultLocalization = asArray(entry.localizations).some(
    (localization) => localization?.locale === DEFAULT_LOCALE,
  );
  const rawLocalizationIds = getLocalizationIds(entry);
  const localizationIds = rawLocalizationIds.filter((localizationId) => localizationId !== entry.id);
  const localizationsChanged = rawLocalizationIds.length !== localizationIds.length;

  const data = {};
  const shouldSetDefaultLocale =
    localeCode.length === 0 ||
    !SUPPORTED_LOCALE_CODES.has(localeCode) ||
    (localeCode !== DEFAULT_LOCALE && !hasDefaultLocalization);

  if (shouldSetDefaultLocale) {
    data.locale = DEFAULT_LOCALE;
  }

  if (!Array.isArray(entry.localizations) || localizationsChanged) {
    data.localizations = localizationIds;
  }

  if (Object.keys(data).length === 0) return false;

  await updateEntry(strapi, uid, entry.id, data);
  return true;
}

async function migrateCollectionType(strapi, contentType) {
  const query = strapi.db.query(contentType.uid);
  let offset = 0;
  let scanned = 0;
  let migrated = 0;

  while (true) {
    const entries = asArray(
      await query.findMany({
        select: ['id', 'locale'],
        populate: { localizations: { select: ['id', 'locale'] } },
        limit: MIGRATION_BATCH_SIZE,
        offset,
      }),
    );

    if (entries.length === 0) break;

    for (const entry of entries) {
      scanned += 1;
      try {
        // eslint-disable-next-line no-await-in-loop
        const changed = await migrateEntryLocale(strapi, contentType.uid, entry);
        if (changed) {
          migrated += 1;
        }
      } catch (error) {
        strapi.log.warn(
          `[i18n] Failed migrating ${contentType.uid}#${entry.id}: ${error.message}`,
        );
      }
    }

    offset += entries.length;
  }

  return { scanned, migrated };
}

async function migrateSingleType(strapi, contentType) {
  const query = strapi.db.query(contentType.uid);
  const entry = await query.findOne({
    select: ['id', 'locale'],
    populate: { localizations: { select: ['id', 'locale'] } },
  });

  if (!entry) {
    return { scanned: 0, migrated: 0 };
  }

  try {
    const changed = await migrateEntryLocale(strapi, contentType.uid, entry);
    return { scanned: 1, migrated: changed ? 1 : 0 };
  } catch (error) {
    strapi.log.warn(`[i18n] Failed migrating ${contentType.uid}#${entry.id}: ${error.message}`);
    return { scanned: 1, migrated: 0 };
  }
}

async function migrateExistingContentToDefaultLocale(strapi) {
  const contentTypes = Object.values(strapi.contentTypes || {}).filter(isLocalizedApiContentType);
  if (contentTypes.length === 0) {
    strapi.log.info('[i18n] No localized API content types found for locale migration');
    return;
  }

  let totalScanned = 0;
  let totalMigrated = 0;

  for (const contentType of contentTypes) {
    // eslint-disable-next-line no-await-in-loop
    const localeColumnExists = await hasLocaleColumn(strapi, contentType);
    if (!localeColumnExists) {
      strapi.log.warn(
        `[i18n] Skipping ${contentType.uid}: locale column is not available yet`,
      );
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    const result =
      contentType.kind === 'singleType'
        ? await migrateSingleType(strapi, contentType)
        : await migrateCollectionType(strapi, contentType);

    totalScanned += result.scanned;
    totalMigrated += result.migrated;

    strapi.log.info(
      `[i18n] ${contentType.uid}: migrated ${result.migrated}/${result.scanned} entries`,
    );
  }

  strapi.log.info(
    `[i18n] Locale migration complete: migrated ${totalMigrated}/${totalScanned} entries`,
  );
}

async function runI18nSetup(strapi) {
  await ensureLocales(strapi);
  await migrateExistingContentToDefaultLocale(strapi);
}

module.exports = {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  runI18nSetup,
};
