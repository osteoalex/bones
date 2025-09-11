import { BrowserWindow, dialog } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, resolve } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { isCollectionConfigData } from '../utils/type-guards';
import { cleanConfigItems } from './cleanConfigItems';
import { cleanItemContent } from './cleanItemContent';
import { logErr } from './logger';
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
      return false;
    }

    // Clean config items if any are missing
    const cleanedConfig =
      cleanConfigItems(config as CollectionConfigData) ||
      (config as CollectionConfigData);

    // For each item, clean fragments with empty properties
    for (const item of cleanedConfig.items) {
      try {
        const itemContentString = readFileSync(item.itemPath, {
          encoding: 'utf8',
        });
        const itemContent = JSON.parse(itemContentString);
        const cleanedContent = cleanItemContent(itemContent);
        if (JSON.stringify(itemContent) !== JSON.stringify(cleanedContent)) {
          writeFileSync(item.itemPath, JSON.stringify(cleanedContent, null, 2));
        }
      } catch (e) {
        logErr(`Error cleaning item file: ${item.itemPath}`, e);
      }
    }
    store.set('currentCollectionConfig', cleanedConfig);
    return cleanedConfig;
  } catch (error) {
    logErr('Error opening collection', error);
    showError(
      'Missing configuration',
      'There is no configuration file in selected directory.',
    );
    // navigate back to home
  }
}
