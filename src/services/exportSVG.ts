import Flatten from '@flatten-js/core';
import { FeatureCollection } from '@turf/helpers';
import { DOMParser } from '@xmldom/xmldom';
import { BrowserWindow, dialog, SaveDialogReturnValue } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import { Feature, MultiLineString, MultiPolygon, Polygon } from 'geojson';
import { JSDOM } from 'jsdom';
import { Extent } from 'ol/extent';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

import { rgbToHex } from '../utils';
import {
  isGeoJsonMultiLineString,
  isGeoJsonMultiPolygon,
  isGeoJsonPolygon,
} from '../utils/type-guards';

export async function exportSVG(
  app: Electron.App,
  mainWindow: BrowserWindow,
  extent: Extent,
  geojson: Feature<MultiPolygon | Polygon>[],
) {
  const {
    window: { document },
  } = new JSDOM();
  const userDataPath = [app.getPath('appData'), app.getName()];

  const file: SaveDialogReturnValue = await dialog.showSaveDialog(mainWindow, {
    title: 'Export svg',
    filters: [{ name: 'Scalable Vector Graphics', extensions: ['svg'] }],
    properties: ['showOverwriteConfirmation'],
    defaultPath: 'export.svg',
  });
  if (file.canceled || !file.filePath) {
    return;
  }
  const parser = new DOMParser();
  const svgElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'svg',
  );
  svgElement.setAttribute('xmlns:svg', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute(
    'xmlns:inkscape',
    'http://www.inkscape.org/namespaces/inkscape',
  );
  svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svgElement.setAttribute('viewBox', '0 0 350.28576 834.81352');

  // parse background
  const back = readFileSync(join(...userDataPath, 'currentBackground'), {
    encoding: 'utf8',
  });
  const backgroundContent: FeatureCollection<
    MultiPolygon | Polygon | MultiLineString
  > = JSON.parse(back);

  const processFeature = (
    feature: Feature<MultiPolygon | Polygon | MultiLineString>,
  ) => {
    const poly = new Flatten.Polygon();
    const multiLines: Flatten.Multiline[] = [];
    if (isGeoJsonMultiLineString(feature)) {
      feature.geometry.coordinates.forEach((l) => {
        const lines = l.reduce<Flatten.Segment[]>((acc, current, index, a) => {
          if (index !== 0) {
            const prev = a[index - 1];
            const start = new Flatten.Point(prev[0], prev[1] * -1);
            const end = new Flatten.Point(current[0], current[1] * -1);
            if (!start.equalTo(end)) {
              const line = new Flatten.Segment(start, end);
              acc.push(line);
            }
          }
          return acc;
        }, []);
        multiLines.push(new Flatten.Multiline(lines));
      });
    }
    if (isGeoJsonPolygon(feature)) {
      feature.geometry.coordinates.forEach((p) => {
        const point = p.map(([x, y]) => new Flatten.Point(x, y * -1));
        poly.addFace(point);
      });
    } else if (isGeoJsonMultiPolygon(feature)) {
      feature.geometry.coordinates.forEach((p) => {
        const point = p[0].map(([x, y]) => new Flatten.Point(x, y * -1));
        poly.addFace(point);
      });
    }
    const path = parser
      .parseFromString(poly.svg(), 'image/svg+xml')
      .getElementsByTagName('path')[0];

    if (!path) {
      return;
    }

    const createStyle = (
      featureStroke = feature.properties?.stroke,
      featureFill = feature.properties?.fill,
    ) => {
      const stroke = rgbToHex(featureStroke || 'rgba(0,0,0,1)');
      const fill = rgbToHex(featureFill || 'rgba(0,0,0,0)');
      return `stroke:${stroke.hex}; stroke-opacity: ${stroke.alfa}; fill: ${fill.hex}; fill-opacity: ${fill.alfa}`;
    };

    path.setAttribute('style', createStyle());

    if (feature.properties) {
      Object.entries(feature.properties).forEach(([key, value]) => {
        path.setAttribute(key.replace(/'+|\s+/g, '-'), value);
      });
    }

    path.removeAttribute('fill');
    path.removeAttribute('stroke');

    svgElement.innerHTML += path;
    for (const multiline of multiLines) {
      const line = parser
        .parseFromString(multiline.svg(), 'image/svg+xml')
        .getElementsByTagName('path')[0];

      if (!line) {
        continue;
      }

      line.setAttribute('style', createStyle('rgba(0,0,0,1)', 'rgba(0,0,0,0)'));
      line.setAttribute('id', uuid());
      line.removeAttribute('fill');
      line.removeAttribute('stroke');
      svgElement.innerHTML += line;
    }
  };

  for (const feature of backgroundContent.features) {
    processFeature(feature);
  }

  geojson.forEach((feature) => processFeature(feature));

  svgElement.setAttribute(
    'viewBox',
    `${extent[0]} ${
      extent[1] * -1 - Math.abs(extent[1] - extent[3])
    } ${Math.abs(extent[0] - extent[2])} ${Math.abs(extent[1] - extent[3])}`,
  );

  writeFileSync(file.filePath, svgElement.outerHTML, { encoding: 'utf8' });

  dialog.showMessageBox(mainWindow, {
    title: 'Success',
    message: 'Exported successfully.',
  });
  return;
}
