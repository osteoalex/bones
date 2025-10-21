import { BrowserWindow, dialog } from 'electron';
import {
  accessSync,
  constants,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'fs';
import yaml from 'js-yaml';
import { basename, join, normalize } from 'path';

import {
  CollectionConfigData,
  Item,
} from '../types/collection-config-data.interface';
import { Store } from './store';

export async function renameItem(
  oldFilename: string,
  newName: string,
  mainWindow: BrowserWindow,
  store: Store,
) {
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  if (!config?.path) {
    return false;
  }

  const item = (config.items || []).find(
    (it) => basename(normalize(it.itemPath)) === oldFilename,
  ) as Item | undefined;
  if (!item) {
    return false;
  }

  const collectionAbsPath = config.path;
  const oldRel = item.itemPath;
  const oldAbs = normalize(join(collectionAbsPath, oldRel));

  const newRel = normalize(join('items', newName)).replace(/\\/g, '/');
  const newAbs = normalize(join(collectionAbsPath, newRel));

  // If no change, just return
  if (oldAbs === newAbs) {
    return newName;
  }

  try {
    accessSync(newAbs, constants.F_OK);
    const prompt = dialog.showMessageBoxSync(mainWindow, {
      title: 'Already exists!',
      message: 'Do you want to overwrite existing file?',
      buttons: ['Yes', 'Cancel'],
    });
    if (prompt !== 0) {
      return false;
    }
  } catch (err) {
    // file does not exist - proceed
  }

  // perform rename on disk
  try {
    renameSync(oldAbs, newAbs);
  } catch (err) {
    // fallback: try to copy via read/write (rare)
    try {
      const src = readFileSync(oldAbs, { encoding: 'utf8' });
      writeFileSync(newAbs, src, { encoding: 'utf8' });
      // remove old file
      rmSync(oldAbs);
    } catch (err2) {
      dialog.showMessageBoxSync(mainWindow, {
        title: 'Rename failed',
        message: String(err2 || err),
        buttons: ['OK'],
      });
      return false;
    }
  }

  // update config to point to new relative path
  item.itemPath = newRel;

  // if currently opened item references old rel, update it
  const currentlyOpen = store.get('currentlyOpenedItem');
  if (currentlyOpen === oldRel) {
    store.set('currentlyOpenedItem', newRel);
  }

  // persist config.yml
  try {
    writeFileSync(
      normalize(join(collectionAbsPath, 'config.yml')),
      yaml.dump(config),
      {
        encoding: 'utf8',
      },
    );
    store.set('currentCollectionConfig', config);
  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Error',
      message: 'Failed to update config.yml: ' + String(err),
      buttons: ['OK'],
    });
    return false;
  }
}
