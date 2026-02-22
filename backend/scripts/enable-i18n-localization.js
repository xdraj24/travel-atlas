'use strict';

const fs = require('fs/promises');
const path = require('path');

const API_DIR = path.join(process.cwd(), 'src', 'api');

async function listSchemaPaths() {
  const schemaPaths = [];
  const apiEntries = await fs.readdir(API_DIR, { withFileTypes: true });

  for (const apiEntry of apiEntries) {
    if (!apiEntry.isDirectory()) continue;

    const contentTypesDir = path.join(API_DIR, apiEntry.name, 'content-types');
    let contentTypeEntries = [];

    try {
      contentTypeEntries = await fs.readdir(contentTypesDir, { withFileTypes: true });
    } catch (error) {
      if (error && error.code === 'ENOENT') continue;
      throw error;
    }

    for (const contentTypeEntry of contentTypeEntries) {
      if (!contentTypeEntry.isDirectory()) continue;

      const schemaPath = path.join(contentTypesDir, contentTypeEntry.name, 'schema.json');

      try {
        await fs.access(schemaPath);
        schemaPaths.push(schemaPath);
      } catch (error) {
        if (!error || error.code !== 'ENOENT') {
          throw error;
        }
      }
    }
  }

  return schemaPaths;
}

function isApiContentTypeSchema(schema) {
  return schema && (schema.kind === 'collectionType' || schema.kind === 'singleType');
}

function ensureI18nLocalization(schema) {
  if (!schema.pluginOptions || typeof schema.pluginOptions !== 'object') {
    schema.pluginOptions = {};
  }

  if (!schema.pluginOptions.i18n || typeof schema.pluginOptions.i18n !== 'object') {
    schema.pluginOptions.i18n = {};
  }

  const wasLocalized = schema.pluginOptions.i18n.localized === true;
  schema.pluginOptions.i18n.localized = true;

  return !wasLocalized;
}

async function updateSchema(schemaPath) {
  const raw = await fs.readFile(schemaPath, 'utf8');
  const schema = JSON.parse(raw);

  if (!isApiContentTypeSchema(schema)) {
    return { schemaPath, changed: false, skipped: true };
  }

  const changed = ensureI18nLocalization(schema);

  if (changed) {
    await fs.writeFile(schemaPath, `${JSON.stringify(schema, null, 2)}\n`, 'utf8');
  }

  return { schemaPath, changed, skipped: false };
}

async function main() {
  const schemaPaths = await listSchemaPaths();
  const results = [];

  for (const schemaPath of schemaPaths) {
    const result = await updateSchema(schemaPath);
    results.push(result);
  }

  const updated = results.filter((result) => result.changed);
  const skipped = results.filter((result) => result.skipped);

  console.log(`[i18n] Processed ${results.length} schema files`);
  console.log(`[i18n] Updated ${updated.length} schema files`);
  if (skipped.length > 0) {
    console.log(`[i18n] Skipped ${skipped.length} non-content type schemas`);
  }
}

main().catch((error) => {
  console.error('[i18n] Failed to enforce localization flags', error);
  process.exit(1);
});
