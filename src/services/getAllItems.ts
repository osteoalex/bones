import { readdirSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, normalize } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function getAllItems(store: Store) {
  const config: CollectionConfigData = await store.get(
    'currentCollectionConfig',
  );
  if (!config.path) {
    return [];
  }

  const collectionAbsPath = config.path;
  const itemsDir = normalize(join(collectionAbsPath, 'items'));
  const allFiles = readdirSync(itemsDir, { withFileTypes: true });

  const foundNames = allFiles.reduce<string[]>((acc, current) => {
    const name = current.name;
    const isJSON = /(?!(\/))([a-zA-Z0-9-]+)\.json/gm.test(
      name.replace(' ', ''),
    );
    if (isJSON) acc.push(name);
    return acc;
  }, []);

  // Ensure config.items includes all files in the items folder
  config.items = config.items || [];
  const existingBasenames = new Set(
    config.items.map((it) => normalize(it.itemPath).split('/').pop() || ''),
  );

  let changed = false;
  for (const filename of foundNames) {
    if (!existingBasenames.has(filename)) {
      const relItemPath = normalize(join('items', filename)).replace(
        /\\/g,
        '/',
      );
      const background = (config.backgrounds && config.backgrounds[0]) || '';
      config.items.push({ itemPath: relItemPath, background });
      changed = true;
    }
  }

  if (changed) {
    // Persist updated config.yml into the collection absolute path
    const configPath = normalize(join(collectionAbsPath, 'config.yml'));
    writeFileSync(configPath, yaml.dump(config), { encoding: 'utf8' });
    store.set('currentCollectionConfig', config);
  }

  return foundNames;
}
