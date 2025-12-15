import { readFileSync, writeFileSync } from 'fs';
import { join, normalize } from 'path';

import { Store } from './store';

export function saveItem(app: Electron.App, store: Store) {
  const userDataPath = [app.getPath('appData'), app.getName()];
  const currentlyOpen = store.get('currentlyOpenedItem');
  const config = store.get('currentCollectionConfig');
  const temp = readFileSync(normalize(join(...userDataPath, 'currentItem')), {
    encoding: 'utf8',
  });
  writeFileSync(normalize(join(config.path, currentlyOpen)), temp, {
    encoding: 'utf8',
  });
}
