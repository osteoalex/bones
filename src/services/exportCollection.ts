import { stringify } from 'csv-stringify';
import { BrowserWindow, dialog } from 'electron';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { FeatureCollection, Polygon } from 'geojson';
import { basename, join, normalize } from 'path';

import {
  CollectionConfigData,
  ItemContent,
} from '../types/collection-config-data.interface';
import { logErr } from './logger';
import { Store } from './store';

export async function exportCollection(
  mainWindow: BrowserWindow,
  store: Store,
) {
  const folder = dialog.showOpenDialogSync(mainWindow, {
    title: 'Export Collection',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (!folder) {
    return;
  }

  const config: CollectionConfigData = store.get('currentCollectionConfig');
  const items = config.items;
  const outputFolder = normalize(join(folder[0], basename(config.name)));
  if (!existsSync(outputFolder)) {
    mkdirSync(outputFolder, { recursive: true });
  }

  let errorCount = 0;
  const errorFiles: string[] = [];
  for await (const item of items) {
    try {
      const itemContent = readFileSync(
        normalize(join(config.path, item.itemPath)),
        { encoding: 'utf8' },
      );
      const background = readFileSync(
        normalize(join(config.path, item.background)),
        { encoding: 'utf8' },
      );
      const itemObject: ItemContent = JSON.parse(itemContent);
      const backgroundFeaturesCollection: FeatureCollection<Polygon> =
        JSON.parse(background);

      for (const layer of itemObject) {
        const columns: string[] = layer.propertiesConfig.map(
          (conf) => conf.name,
        );
        columns.push(
          'id',
          'targetId',
          "Fragment's area", // eslint-disable-line
          'fill',
          'stroke',
          'geometry',
          'target geometry',
          'item',
          'layer',
          'isAnnotation',
          'annotation',
        );

        const filePath = normalize(
          join(
            outputFolder,
            `${basename(item.itemPath, '.json')}_${layer.name}.csv`,
          ),
        );
        const output = createWriteStream(filePath, { encoding: 'utf-8' });
        const stringifier = stringify({ header: true, columns });

        // Export fragment features
        layer.fragments.features.forEach((row) => {
          const rowContent = {
            ...row.properties,
            id: row.id,
            geometry: JSON.stringify(
              (row.geometry as Polygon).coordinates.map((p) =>
                p.map(([x, y]) => [x, y * -1]),
              ),
            ),
            'target geometry': JSON.stringify(
              backgroundFeaturesCollection.features
                .find((fr) => fr.id === row.properties.targetId)
                .geometry.coordinates.map((p) =>
                  p.map(([x, y]) => [x, y * -1]),
                ),
            ),
            item: basename(item.itemPath, '.json'),
            layer: layer.name,
            annotation: '', // empty for fragments
            isAnnotation: 'no',
          };
          stringifier.write(rowContent, 'utf8');
        });
        // Export annotation features if present
        if (Array.isArray(layer.annotations.features)) {
          layer.annotations.features.forEach((annotation) => {
            const rowContent = {
              ...annotation.properties,
              id: annotation.id,
              geometry: JSON.stringify(annotation.geometry.coordinates),
              'target geometry': '',
              item: basename(item.itemPath, '.json'),
              layer: layer.name,
              isAnnotation: 'yes', // mark as annotation
              annotation: JSON.stringify(annotation.properties.annotation),
            };
            stringifier.write(rowContent, 'utf8');
          });
        }

        stringifier.pipe(output);
      }
    } catch (error) {
      errorCount++;
      errorFiles.push(item.itemPath);
      logErr('Error exporting item', error);
    }
  }

  if (errorCount === items.length) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Error',
      message: 'All items failed to export.',
    });
    return;
  }

  let message = `Exported successfully. Errors: ${errorCount}`;
  if (errorFiles.length > 0) {
    message += '\nFiles with errors:\n' + errorFiles.join('\n');
  }
  dialog.showMessageBoxSync(mainWindow, {
    title: 'Success',
    message,
  });
}
