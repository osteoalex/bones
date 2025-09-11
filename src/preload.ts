import { contextBridge, ipcRenderer } from 'electron';
import { Feature, GeoJSON, MultiPolygon, Polygon } from 'geojson';
import { Extent } from 'ol/extent';

import { CollectionConfigData } from './types/collection-config-data.interface';

contextBridge.exposeInMainWorld('electron', {
  createCollection: async (data: CollectionConfigData) =>
    await ipcRenderer.invoke('create-collection', data),
  openCollectionFromMenu: (callback: () => Promise<void>) => {
    ipcRenderer.off('open-collection', callback);
    ipcRenderer.on('open-collection', callback);
  },
  newCollectionFromMenu: (callback: () => Promise<void>) => {
    ipcRenderer.off('new-collection', callback);
    ipcRenderer.on('new-collection', callback);
  },
  saveCollectionFromMenu: (callback: () => Promise<void>) => {
    ipcRenderer.off('save-collection', callback);
    ipcRenderer.on('save-collection', callback);
  },
  openCollection: async () => await ipcRenderer.invoke('open-collection'),
  readCollection: async () =>
    await ipcRenderer.invoke('get-user-data', 'currentCollectionConfig'),
  resetCurrentlyLoadedConfig: async () => {
    await ipcRenderer.invoke('set-user-data', 'currentCollectionConfig', null);
  },
  setDrawerWidth: async (width: number) => {
    await ipcRenderer.invoke('set-user-data', 'drawerWidth', width);
  },
  getDrawerWidth: async () => {
    return await ipcRenderer.invoke('get-user-data', 'drawerWidth');
  },
  updateCollectionDetails: async (data: CollectionConfigData, mute?: boolean) =>
    await ipcRenderer.invoke('update-collection-details', data, mute),
  getAllItems: async (): Promise<string[]> =>
    await ipcRenderer.invoke('get-all-items'),
  addNewBackground: async () => await ipcRenderer.invoke('add-new-background'),
  createNewItem: async (name: string, background: string) =>
    await ipcRenderer.invoke('create-new-item', name, background),
  openItem: async (filename: string) =>
    await ipcRenderer.invoke('open-item', filename),
  saveAndCloseItem: async () => await ipcRenderer.invoke('save-and-close-item'),
  saveItem: async () => await ipcRenderer.invoke('save-item'),
  saveFeaturesToTempFile: async (geojson: GeoJSON) =>
    await ipcRenderer.invoke('save-feature-to-temp-file', geojson),
  onCollectionPageEnter: async () =>
    await ipcRenderer.invoke('collection-page'),
  onCollectionPageLeave: async () =>
    await ipcRenderer.invoke('leave-collection-page'),
  collectionPageEscHandler: async (callback: () => Promise<void>) => {
    await ipcRenderer.on('collection-page-esc-handler', callback);
  },
  exportCollection: async () => await ipcRenderer.invoke('export-collection'),
  exportSVG: async (
    extent: Extent,
    geojson?: Feature<MultiPolygon | Polygon>,
  ) => await ipcRenderer.invoke('export-svg', extent, geojson),
  exportBoneSVG: async (
    extent: Extent,
    base: Feature<MultiPolygon | Polygon>,
    item: Feature<MultiPolygon | Polygon>,
  ) => await ipcRenderer.invoke('export-bone-svg', extent, base, item),
  getVersion: async () => await ipcRenderer.invoke('get-version'),
  toggleHint: (data: boolean) => ipcRenderer.invoke('toggle-hint', data),
  getConfig: async () => await ipcRenderer.invoke('get-config'),
  setConfig: async (data: CollectionConfigData) =>
    await ipcRenderer.invoke('set-config', data),
  logError: (message: string, error?: unknown) =>
    ipcRenderer.invoke('log-error', message, error),
});

addEventListener('contextmenu', (ev) => {
  ev.shiftKey ? ipcRenderer.send('InspectMeAtPos', { x: ev.x, y: ev.y }) : null;
});
