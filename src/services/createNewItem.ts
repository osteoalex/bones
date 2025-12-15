import { BrowserWindow, dialog } from 'electron';
import { accessSync, constants, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, normalize } from 'path';

import {
  CollectionConfigData,
  ItemContent,
} from '../types/collection-config-data.interface';
import { Store } from './store';

export async function createNewItem(
  name: string,
  background: string,
  mainWindow: BrowserWindow,
  store: Store,
) {
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  if (!config.path) {
    return false;
  }
  const itemPath = normalize(join(config.path, 'items', `${name}.json`));
  try {
    accessSync(itemPath, constants.F_OK);
    const prompt = dialog.showMessageBoxSync(mainWindow, {
      title: 'Already exists!',
      message: 'Do you want to overwrite existing file?',
      buttons: ['Yes', 'Cancel'],
    });
    if (prompt !== 0) {
      return false;
    }
  } catch (error) {
    // File does not exist, continue
  }
  const itemContent: ItemContent = [];
  writeFileSync(itemPath, JSON.stringify(itemContent), { encoding: 'utf8' });
  const relativeItemPath = join('items', `${name}.json`);
  const data = {
    ...config,
    items: [...config.items, { itemPath: relativeItemPath, background }],
  };
  if (!data.path) {
    return false;
  }
  const configYaml = yaml.dump(data);
  writeFileSync(normalize(join(data.path, 'config.yml')), configYaml);
  store.set('currentCollectionConfig', data);
  dialog.showMessageBoxSync(mainWindow, {
    title: 'Success',
    message: 'Added successfully.',
  });
  return `${name}.json`;
}
