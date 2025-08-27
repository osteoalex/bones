import { BrowserWindow, dialog } from 'electron';
import { readFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, resolve } from 'path';

import { isCollectionConfigData } from '../utils/type-guards';
import { showError } from './showError';
import { Store } from './store';

export async function openCollection(mainWindow: BrowserWindow, store: Store) {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open collection',
  });
  if (folder.canceled) {
    return false;
  }
  try {
    const file = readFileSync(
      resolve(join(folder.filePaths[0], 'config.yml')),
      {
        encoding: 'utf8',
      },
    );
    const config = yaml.load(file);
    if (!isCollectionConfigData(config)) {
      showError(
        'Missing configuration',
        'There is no configuration file in selected directory.',
      );
    }

    store.set('currentCollectionConfig', config);
    return config;
  } catch (error) {
    // console.log(error);
    showError(
      'Missing configuration',
      'There is no configuration file in selected directory.',
    );
    // navigate back to home
  }
}
