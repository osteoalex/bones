import { BrowserWindow, dialog } from 'electron';
import { existsSync, rmSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, normalize } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function deleteBackground(
  backgroundRel: string,
  mainWindow: BrowserWindow,
  store: Store,
) {
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  if (!config?.path) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      title: 'No collection loaded',
      message:
        'No collection is currently open. Please open a collection before removing backgrounds.',
      buttons: ['OK'],
    });
    return;
  }

  // if any item references this background, show dialog and return false
  const used = (config.items || []).some(
    (it) => it.background === backgroundRel,
  );
  if (used) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'warning',
      title: 'Background in use',
      message:
        'This background is used by one or more items and cannot be removed.',
      buttons: ['OK'],
    });
    return;
  }

  const absPath = normalize(join(config.path, backgroundRel));
  try {
    if (existsSync(absPath)) {
      rmSync(absPath);
    }
  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      title: 'Delete failed',
      message: `Failed to remove background file: ${String(err)}`,
      buttons: ['OK'],
    });
    return;
  }

  // remove from config and persist
  config.backgrounds = (config.backgrounds || []).filter(
    (b) => b !== backgroundRel,
  );
  try {
    writeFileSync(
      normalize(join(config.path, 'config.yml')),
      yaml.dump(config),
      { encoding: 'utf8' },
    );
    store.set('currentCollectionConfig', config);
  } catch (err) {
    dialog.showMessageBoxSync(mainWindow, {
      type: 'error',
      title: 'Config save failed',
      message: `Failed to update config.yml: ${String(err)}`,
      buttons: ['OK'],
    });
    return;
  }

  return;
}
