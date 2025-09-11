import { readdirSync } from 'fs';
import { join } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';

/**
 * Checks the config's items against the actual files in the items directory.
 * Removes missing items from config and returns the updated config (or null if unchanged).
 */
export function cleanConfigItems(
  config: CollectionConfigData,
): CollectionConfigData | null {
  if (!config.path) return null;
  const itemsDir = join(config.path, 'items');
  let files: string[] = [];
  try {
    files = readdirSync(itemsDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => join(config.path, 'items', f));
  } catch (e) {
    console.error('Failed to read items directory:', e);
    return null;
  }
  const fileSet = new Set(files);
  const filteredItems = config.items.filter((item) =>
    fileSet.has(item.itemPath),
  );

  if (filteredItems.length !== config.items.length) {
    return { ...config, items: filteredItems };
  }
  return null;
}
