import { DOMParser } from '@xmldom/xmldom';
import { BrowserWindow, dialog } from 'electron';
import {
  accessSync,
  constants,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { Feature, GeoJSON, MultiLineString, Polygon, Position } from 'geojson';
import yaml from 'js-yaml';
import { basename, extname, join } from 'path';
import { pathDataToPolys } from 'svg-path-to-polygons';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { Store } from './store';

export async function addNewBackground(
  mainWindow: BrowserWindow,
  store: Store,
) {
  const file = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [{ name: 'Scalable Vector Graphics', extensions: ['svg'] }],
    title: 'Select background',
  });
  if (file.canceled) {
    return;
  }
  const ext = extname(file.filePaths[0]);
  const filename = basename(file.filePaths[0], ext);
  const config: CollectionConfigData = store.get('currentCollectionConfig');
  if (!config?.path) {
    throw new Error('Something went wrong!');
  }
  const folderPath = join(config.path, 'backgrounds');
  try {
    accessSync(folderPath, constants.F_OK);
  } catch (error) {
    mkdirSync(folderPath);
  }
  const newBackgroundPath = join(folderPath, filename);

  const geojsonSting = readFileSync(file.filePaths[0], {
    encoding: 'utf8',
  });
  const parser = new DOMParser();
  const svg = parser
    .parseFromString(geojsonSting, 'image/svg+xml')
    .getElementsByTagName('svg')[0];
  if (!svg) {
    throw new Error('Something went wrong!');
  }
  Array.from(svg.getElementsByTagName('g')).forEach((g) => {
    if (g) {
      g.parentNode?.removeChild(g);
    }
  });
  const paths = svg.getElementsByTagName('path');
  const features: Feature<Polygon | MultiLineString, Record<string, string>>[] =
    Array.from(paths).reduce((acc, current) => {
      const d = current.getAttribute('d') || '';
      const regex = new RegExp('.+z$'); // eslint-disable-line

      let coordinates: Position[][] = pathDataToPolys(d);
      if (regex.test(d)) {
        coordinates = coordinates.filter((coords) => coords.length > 3);
      }

      coordinates = coordinates.map((p) => p.map(([x, y]) => [x, y * -1]));

      acc.push({
        type: 'Feature',

        id: current.getAttribute('id'),
        geometry: {
          type: regex.test(d) ? 'Polygon' : 'MultiLineString',
          coordinates,
        },
      });
      return acc;
    }, []);
  const geojson: GeoJSON = {
    type: 'FeatureCollection',
    features,
  };
  writeFileSync(newBackgroundPath, JSON.stringify(geojson), {
    encoding: 'utf8',
  });
  const data = {
    ...config,
    backgrounds: config.backgrounds?.length
      ? [...new Set([...config.backgrounds, newBackgroundPath])]
      : [newBackgroundPath],
  };
  if (!data.path) {
    throw new Error('Something went wrong!');
  }
  const configYaml = yaml.dump(data);
  writeFileSync(join(data.path, 'config.yml'), configYaml);
  store.set('currentCollectionConfig', data);
  await dialog.showMessageBox(mainWindow, {
    title: 'Success',
    message: 'Added successfully.',
  });
  return data;
}
