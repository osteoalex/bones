import { deepStrictEqual } from 'assert';
import { BrowserWindow, dialog } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import { basename, join, resolve } from 'path';

import {
  CollectionConfigData,
  Item,
} from '../types/collection-config-data.interface';
import { Store } from './store';

export async function openItem(
  filename: string,
  mainWindow: BrowserWindow,
  store: Store,
  app: Electron.App,
) {
  const userDataPath = [app.getPath('appData'), app.getName()];
  const currentlyOpen = store.get('currentlyOpenedItem');
  if (currentlyOpen) {
    const temp = readFileSync(join(...userDataPath, 'currentItem'), {
      encoding: 'utf8',
    });
    const source = readFileSync(currentlyOpen, {
      encoding: 'utf8',
    });

    try {
      deepStrictEqual(source, temp);
    } catch (error) {
      // console.log(error);
      const prompt = dialog.showMessageBoxSync(mainWindow, {
        title: 'Unsaved changes!',
        message: 'Do you want to save current file?',
        buttons: ['Yes', 'No'],
      });
      if (prompt === 0) {
        writeFileSync(currentlyOpen, temp, { encoding: 'utf8' });
      }
    }
  }
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  const item = config.items.find(
    (item) => basename(item.itemPath) === filename,
  ) as Item;
  if (!item?.itemPath) {
    return {
      itemContentString: '[]',
      backgroundJSONString: JSON.stringify({
        type: 'FeatureCollection',
        features: [],
      }),
    };
  }
  const itemContentString = readFileSync(resolve(item?.itemPath || ''), {
    encoding: 'utf8',
  });
  const backgroundJSONString = readFileSync(resolve(item.background), {
    encoding: 'utf8',
  });
  writeFileSync(join(...userDataPath, 'currentItem'), itemContentString, {
    encoding: 'utf8',
  });
  writeFileSync(
    join(...userDataPath, 'currentBackground'),
    backgroundJSONString,
    {
      encoding: 'utf8',
    },
  );
  store.set('currentlyOpenedItem', item.itemPath);
  return { itemContentString, backgroundJSONString };
}
