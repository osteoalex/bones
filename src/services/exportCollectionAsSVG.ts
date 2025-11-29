import { app, BrowserWindow, dialog } from 'electron';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import {
  Feature,
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
} from 'geojson';
import { Extent } from 'ol/extent';
import { basename, join, normalize } from 'path';

import {
  CollectionConfigData,
  ItemContent,
  Layer,
} from '../types/collection-config-data.interface';
import { exportSvgDocument } from './exportSVG';
import { logErr } from './logger';
import { Store } from './store';

/**
 * Export the current collection as one SVG file per item.
 * This is implemented as a separate service and does not modify existing services.
 */
export async function exportCollectionAsSVG(
  mainWindow: BrowserWindow,
  store: Store,
) {
  const folder = dialog.showOpenDialogSync(mainWindow, {
    title: 'Export Collection as SVG',
    properties: ['openDirectory', 'createDirectory'],
  });
  if (!folder) return;

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
      const itemObject = JSON.parse(itemContent) as ItemContent;

      // gather features from all layers (fragments + annotations)
      const features: Feature<Geometry>[] = [];
      for (const layer of itemObject as Layer[]) {
        const fr = layer.fragments as FeatureCollection<Geometry> | undefined;
        if (fr && Array.isArray(fr.features)) {
          features.push(...(fr.features as Feature<Geometry>[]));
        }
        const an = layer.annotations as FeatureCollection<Geometry> | undefined;
        if (an && Array.isArray(an.features)) {
          features.push(...(an.features as Feature<Geometry>[]));
        }
      }

      // compute extent for the item's features (simple bbox)
      const computeExtent = (feats: Feature<Geometry>[]): Extent => {
        if (!feats || feats.length === 0) return [0, 0, 100, 100];
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        const addPoint = (x: number, y: number) => {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        };
        for (const ft of feats) {
          const g = ft.geometry as Geometry | undefined;
          if (!g) continue;
          const recurseCoords = (c: unknown): void => {
            if (!Array.isArray(c)) return;
            if (
              c.length >= 2 &&
              typeof c[0] === 'number' &&
              typeof c[1] === 'number'
            ) {
              addPoint(c[0] as number, c[1] as number);
              return;
            }
            for (const inner of c) recurseCoords(inner);
          };
          const maybeCoords = g as unknown as { coordinates?: unknown };
          if (maybeCoords && maybeCoords.coordinates)
            recurseCoords(maybeCoords.coordinates);
        }
        if (!isFinite(minX)) return [0, 0, 100, 100];
        return [minX, minY, maxX, maxY];
      };

      const extent = computeExtent(features);
      // call existing exportSVG service (it will prompt for save)
      const userDataPath = [app.getPath('appData'), app.getName()];

      const filePath = normalize(
        join(outputFolder, `${basename(item.itemPath, '.json')}.svg`),
      );

      // parse background
      const back = readFileSync(
        // move out of this function
        normalize(join(config.path, item.background)),
        {
          encoding: 'utf8',
        },
      );

      await exportSvgDocument(
        userDataPath,
        filePath,
        extent,
        features as unknown as Feature<MultiPolygon | Polygon>[],
        back,
      );
    } catch (err) {
      errorCount++;
      errorFiles.push(item.itemPath);
      logErr('Error exporting item as SVG', err);
      console.log(err);
    }
  }

  if (errorCount === items.length) {
    dialog.showMessageBoxSync(mainWindow, {
      title: 'Error',
      message: 'All items failed to export as SVG.',
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
