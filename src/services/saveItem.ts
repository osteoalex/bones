import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { Store } from './store';

export function saveItem(app: Electron.App, store: Store) {
  const userDataPath = [app.getPath('appData'), app.getName()];
  const currentlyOpen = store.get('currentlyOpenedItem');
  const temp = readFileSync(join(...userDataPath, 'currentItem'), {
    encoding: 'utf8',
  });
  writeFileSync(currentlyOpen, temp, { encoding: 'utf8' });
}
