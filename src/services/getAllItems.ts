import { readdirSync } from 'fs';
import { join } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function getAllItems(store: Store) {
  const config: CollectionConfigData = await store.get(
    'currentCollectionConfig',
  );
  if (!config.path) {
    return [];
  }
  const path = join(config.path, 'items');
  const allFiles = readdirSync(path, { withFileTypes: true });
  return allFiles.reduce<string[]>((acc, current) => {
    const name = current.name;
    const isJSON = /(?!(\/))([a-zA-Z0-9-]+)\.json/gm.test(
      name.replace(' ', ''),
    );
    if (isJSON) {
      acc.push(name);
    }
    return acc;
  }, []);
}
