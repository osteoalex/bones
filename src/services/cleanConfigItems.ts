import { readdirSync } from 'fs';
import { join, normalize } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { logErr } from './logger';

/**
 * Checks the config's items against the actual files in the items directory.
 * Removes missing items from config and returns the updated config (or null if unchanged).
 */
export function cleanConfigItems(
  config: CollectionConfigData,
): CollectionConfigData | null {
  if (!config.path) return null;
  const itemsDir = normalize(join(config.path, 'items'));
  let files: string[] = [];
  try {
    files = readdirSync(itemsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => normalize(join(itemsDir, f)));
  } catch (e) {
    logErr('Failed to read items directory', e);
    return null;
  }
  const fileSet = new Set(files);
  const filteredItems = config.items.filter((item) =>
    fileSet.has(normalize(join(config.path, item.itemPath))),
  );

  if (filteredItems.length !== config.items.length) {
    return { ...config, items: filteredItems };
  }
  return null;
}
