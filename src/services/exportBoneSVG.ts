import Flatten from '@flatten-js/core';
import { DOMParser } from '@xmldom/xmldom';
import { BrowserWindow, dialog, SaveDialogReturnValue } from 'electron';
import { writeFileSync } from 'fs';
import { Feature, MultiPolygon, Polygon } from 'geojson';
import { JSDOM } from 'jsdom';
import { Extent } from 'ol/extent';
import { v4 as uuid } from 'uuid';

import { rgbToHex } from '../utils';
import { isGeoJsonMultiPolygon, isGeoJsonPolygon } from '../utils/type-guards';

export async function exportBoneSVG(
  app: Electron.App,
  mainWindow: BrowserWindow,
  extent: Extent,
  feature1: Feature<MultiPolygon | Polygon>,
  feature2: Feature<MultiPolygon | Polygon>,
) {
  const {
    window: { document },
  } = new JSDOM();

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

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  svg.setAttribute(
    'viewBox',
    `${extent[0]} ${
      extent[1] * -1 - Math.abs(extent[1] - extent[3])
    } ${Math.abs(extent[0] - extent[2])} ${Math.abs(extent[1] - extent[3])}`,
  );

  const processFeature = (feature: Feature<MultiPolygon | Polygon>) => {
    const poly = new Flatten.Polygon();
    const multiLines: Flatten.Multiline[] = [];

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

    svg.innerHTML += path;
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
      svg.innerHTML += line;
    }
  };

  processFeature(feature1);
  processFeature(feature2);

  writeFileSync(file.filePath, svg.outerHTML);
}
