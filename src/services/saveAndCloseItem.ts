import { deepEqual } from 'assert';
import { BrowserWindow, dialog } from 'electron';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join, normalize } from 'path';

import { logErr } from './logger';
import { Store } from './store';

export async function saveAndCloseItem(
  app: Electron.App,
  store: Store,
  mainWindow: BrowserWindow,
) {
  const userDataPath = [app.getPath('appData'), app.getName()];
  const currentlyOpen = store.get('currentlyOpenedItem');
  const config = store.get('currentCollectionConfig');
  const configYaml = yaml.dump(config);
  if (currentlyOpen) {
    const temp = readFileSync(normalize(join(...userDataPath, 'currentItem')), {
      encoding: 'utf8',
    });
    const source = readFileSync(normalize(join(config.path, currentlyOpen)), {
      encoding: 'utf8',
    });
    try {
      deepEqual(source, temp);
    } catch (error) {
      const prompt = dialog.showMessageBoxSync(mainWindow, {
        title: 'Unsaved changes!',
        message: 'Do you want to save current file?',
        buttons: ['Yes', 'No'],
      });
      if (prompt === 0) {
        try {
          writeFileSync(join(config.path, currentlyOpen), temp, {
            encoding: 'utf8',
          });
        } catch (e) {
          logErr('Error saving current file', e);
        }
      }
    }
    store.set('currentlyOpenedItem', '');
    writeFileSync(normalize(join(config.path, 'config.yml')), configYaml);
    rmSync(normalize(join(...userDataPath, 'currentItem')));
    rmSync(normalize(join(...userDataPath, 'currentBackground')));
  }
}
