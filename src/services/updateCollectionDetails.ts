import { BrowserWindow, dialog } from 'electron';
import { writeFileSync } from 'fs';
import yaml from 'js-yaml';
import { join } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function updateCollectionDetails(
  data: CollectionConfigData,
  mainWindow: BrowserWindow,
  store: Store,
  mute?: boolean,
) {
  if (!data || !data?.path) {
    return;
  }
  const configYaml = yaml.dump(data);
  writeFileSync(join(data.path, 'config.yml'), configYaml);
  store.set('currentCollectionConfig', data);
  if (!mute) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Success',
      message: 'Updated successfully.',
    });
  }
  return data;
}
