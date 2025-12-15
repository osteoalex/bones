import centroid from '@turf/centroid';
import distance from '@turf/distance';
import { readFileSync, writeFileSync } from 'fs';
import { FeatureCollection, Polygon } from 'geojson';

import { ItemContent } from '../types/collection-config-data.interface';
import { logErr } from './logger';

export function migrateAnnotations(itemPath: string, backgroundPath: string) {
  const itemContentString = readFileSync(itemPath, { encoding: 'utf8' });
  const itemContent: ItemContent = JSON.parse(itemContentString);

  const backgroundContentString = readFileSync(backgroundPath, {
    encoding: 'utf8',
  });
  const backgroundContent: FeatureCollection<Polygon> = JSON.parse(
    backgroundContentString,
  );

  let changed = false;

  for (const layer of itemContent) {
    if (
      layer.annotations &&
      Array.isArray(layer.annotations.features) &&
      backgroundContent.features.length > 0
    ) {
      const bonesCentroids = backgroundContent.features.map((frag) => ({
        id: frag.id,
        centroid: centroid(frag),
      }));

      for (const annotation of layer.annotations.features) {
        if (!annotation.properties) continue;
        if (!annotation.properties.targetId) {
          let minDist = Infinity;
          let closestId = null;
          for (const frag of bonesCentroids) {
            try {
              const annCoord = annotation.geometry.coordinates;
              const fragCoord = frag.centroid.geometry.coordinates;
              const d = distance(annCoord, fragCoord);
              if (d < minDist) {
                minDist = d;
                closestId = frag.id;
              }
            } catch (error) {
              logErr(
                'Error calculating distance between annotation and fragment centroid',
                error,
              );
            }
          }
          annotation.properties.targetId = closestId;
          changed = true;
        }
      }
    }
  }

  if (changed) {
    writeFileSync(itemPath, JSON.stringify(itemContent, null, 2));
  }
}
