import { BrowserWindow, dialog } from 'electron';
import { existsSync, rmSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { basename, join, normalize } from 'path';

import {
  CollectionConfigData,
  Item,
} from '../types/collection-config-data.interface';
import { Store } from './store';

export async function deleteItem(
  filename: string,
  mainWindow: BrowserWindow,
  store: Store,
) {
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  if (!config?.path) return false;

  const item = (config.items || []).find(
    (it) => basename(normalize(it.itemPath)) === filename,
  ) as Item | undefined;
  if (!item) return false;

  const collectionAbsPath = config.path;
  const absPath = normalize(join(collectionAbsPath, item.itemPath));

  const prompt = dialog.showMessageBoxSync(mainWindow, {
    title: 'Delete item',
    message: `Are you sure you want to delete "${filename}"? This cannot be undone.`,
    buttons: ['Yes', 'Cancel'],
  });
  if (prompt !== 0) return false;

  try {
    if (existsSync(absPath)) {
      rmSync(absPath);
    }
  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Delete failed',
      message: String(err),
      buttons: ['OK'],
    });
    return false;
  }

  // remove from config
  config.items = (config.items || []).filter(
    (it) => basename(normalize(it.itemPath)) !== filename,
  );

  // if currently opened item was this, clear it
  const currentlyOpen = store.get('currentlyOpenedItem');
  if (currentlyOpen && basename(normalize(currentlyOpen)) === filename) {
    store.set('currentlyOpenedItem', '');
  }

  // persist config
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
      message: 'Failed to persist configuration: ' + String(err),
      buttons: ['OK'],
    });
    return false;
  }

  return true;
}
