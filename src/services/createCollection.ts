import { BrowserWindow, dialog } from 'electron';
import { mkdirSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, resolve } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function createCollection(
  data: CollectionConfigData,
  mainWindow: BrowserWindow,
  store: Store,
): Promise<boolean> {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select collection directory',
  });
  if (folder.canceled) {
    return false;
  }
  const path = resolve(join(folder.filePaths[0], data.name));
  const config = { ...data, path };
  const configYaml = yaml.dump(config);
  mkdirSync(path);
  mkdirSync(join(path, 'items'));
  writeFileSync(join(path, 'config.yml'), configYaml);
  store.set('currentCollectionPath', path);
  store.set('currentCollectionConfig', config);
  return true;
}
