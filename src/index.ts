import { deepEqual } from 'assert';
import {
  app,
  BrowserWindow,
  dialog,
  globalShortcut,
  ipcMain,
  Menu,
  MenuItem,
} from 'electron';
import unhandled from 'electron-unhandled';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { Feature, GeoJSON, MultiPolygon, Polygon } from 'geojson';
import { Extent } from 'ol/extent';
import { join } from 'path';

import { name, version } from '../package.json';
import { addNewBackground } from './services/addNewBackground';
import { createCollection } from './services/createCollection';
import { createNewItem } from './services/createNewItem';
import { exportBoneSVG } from './services/exportBoneSVG';
import { exportCollection } from './services/exportCollection';
import { exportSVG } from './services/exportSVG';
import { getAllItems } from './services/getAllItems';
import { logErr } from './services/logger';
import { openCollection } from './services/openCollection';
import { openItem } from './services/openItem';
import { saveAndCloseItem } from './services/saveAndCloseItem';
import { saveFeaturesToTempFile } from './services/saveFeaturesToTempFile';
import { saveItem } from './services/saveItem';
import { Store } from './services/store';
import { toggleHint } from './services/toggleHint';
import { updateCollectionDetails } from './services/updateCollectionDetails';
import { CollectionConfigData } from './types/collection-config-data.interface';

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow: BrowserWindow;

const store = new Store({
  configName: 'user-data',
  defaults: {},
});

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
  mainWindow.maximize();
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  console.log(name, version);

  store.set('currentlyOpenedItem', '');

  mainWindow.on('close', () => {
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
        deepEqual(source, temp);
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
      store.set('currentlyOpenedItem', '');
      rmSync(join(...userDataPath, 'currentItem'));
      rmSync(join(...userDataPath, 'currentBackground'));
    }
    rmSync(join(...userDataPath, 'user-data.json'));
  });
};

const menu = new Menu();
menu.append(
  new MenuItem({
    label: 'Collections',
    submenu: [
      {
        label: 'New',
        click: () => {
          return mainWindow.webContents.send('new-collection');
        },
      },
      {
        label: 'Open',
        click: () => {
          return mainWindow.webContents.send('open-collection');
        },
      },
      {
        label: 'Save',
        click: () => {
          return mainWindow.webContents.send('save-collection');
        },
      },
    ],
  }),
);

Menu.setApplicationMenu(menu);

unhandled();

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(() => {
  ipcMain.handle('set-user-data', (_e, key: string, value: unknown) => {
    store.set(key, value);
  });

  ipcMain.handle('get-user-data', (_e, key: string) => {
    return store.get(key);
  });

  ipcMain.handle('collection-page', () => {
    globalShortcut.register('esc', () => {
      mainWindow.webContents.send('collection-page-esc-handler');
    });
  });

  ipcMain.handle('leave-collection-page', () => {
    if (globalShortcut.isRegistered('esc')) {
      globalShortcut.unregister('esc');
    }
  });

  ipcMain.handle(
    'create-collection',
    async (_e, data: CollectionConfigData) =>
      await createCollection(data, mainWindow, store),
  );

  ipcMain.handle(
    'open-collection',
    async () => await openCollection(mainWindow, store),
  );

  ipcMain.handle(
    'update-collection-details',
    async (_e, data: CollectionConfigData, mute?: boolean) =>
      await updateCollectionDetails(data, mainWindow, store, mute),
  );

  ipcMain.handle('get-all-items', async () => await getAllItems(store));

  ipcMain.handle(
    'add-new-background',
    async () => await addNewBackground(mainWindow, store),
  );

  ipcMain.handle(
    'create-new-item',
    async (_e, name: string, background: string) =>
      await createNewItem(name, background, mainWindow, store),
  );

  ipcMain.handle(
    'open-item',
    async (_e, filename: string) =>
      await openItem(filename, mainWindow, store, app),
  );

  ipcMain.handle(
    'save-and-close-item',
    async () => await saveAndCloseItem(app, store, mainWindow),
  );

  ipcMain.handle('save-item', async () => await saveItem(app, store));

  ipcMain.handle('save-feature-to-temp-file', async (_e, geojson: GeoJSON) => {
    await saveFeaturesToTempFile(app, geojson);
  });

  ipcMain.handle(
    'export-collection',
    async () => await exportCollection(mainWindow, store),
  );

  ipcMain.handle(
    'export-svg',
    async (_e, extent: Extent, geojson: Feature<MultiPolygon | Polygon>[]) =>
      await exportSVG(app, mainWindow, extent, geojson),
  );

  ipcMain.handle(
    'export-bone-svg',
    async (
      _e,
      extent: Extent,
      base: Feature<MultiPolygon | Polygon>,
      item: Feature<MultiPolygon | Polygon>,
    ) => await exportBoneSVG(app, mainWindow, extent, base, item),
  );

  ipcMain.handle('get-version', () => ({ name, version }));

  ipcMain.handle('toggle-hint', (_e, data: boolean) => toggleHint(data, store));
  ipcMain.handle('get-config', () => store.get('currentCollectionConfig'));
  ipcMain.handle('set-config', (_e, data: CollectionConfigData) =>
    store.set('currentCollectionConfig', data),
  );

  ipcMain.handle('log-error', (_e, message: string, error?: unknown) => {
    logErr(message, error);
  });

  if (process.env.NODE_ENV === 'development') {
    ipcMain.on('InspectMeAtPos', (ev, cursorPos) => {
      const senderWd = BrowserWindow.fromWebContents(ev.sender);
      console.log('InspectMeAtPos : ', cursorPos);
      senderWd.webContents.inspectElement(cursorPos.x, cursorPos.y);
    });
  }
});
