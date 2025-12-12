import { BrowserWindow, dialog } from 'electron';
import { readFileSync, writeFileSync } from 'fs';
import {
  Feature as GeoJSONFeature,
  Geometry,
  MultiPolygon,
  Polygon,
} from 'geojson';
import yaml from 'js-yaml';
import { basename, join, normalize, relative, resolve } from 'path';

import { CollectionConfigData } from '../types/collection-config-data.interface';
import { multiPolygonToPolygons } from '../utils';
import { isCollectionConfigData } from '../utils/type-guards';
import { cleanConfigItems } from './cleanConfigItems';
import { cleanItemContent } from './cleanItemContent';
import { logErr } from './logger';
import { migrateAnnotations } from './migrateAnnotations';
import { showError } from './showError';
import { Store } from './store';

export async function openCollection(mainWindow: BrowserWindow, store: Store) {
  const folder = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open collection',
  });
  if (folder.canceled) {
    return false;
  }
  try {
    const file = readFileSync(
      resolve(normalize(join(folder.filePaths[0], 'config.yml'))),
      {
        encoding: 'utf8',
      },
    );
    const config = yaml.load(file);
    if (!isCollectionConfigData(config)) {
      showError(
        'Missing configuration',
        'There is no configuration file in selected directory.',
      );
      return false;
    }

    if (Array.isArray(config.items)) {
      for (const item of config.items) {
        if (
          item.itemPath &&
          config.path &&
          !item.itemPath.startsWith('items')
        ) {
          // Make itemPath relative to config.path using path.relative
          const relPath = relative(config.path, item.itemPath).replace(
            /\\/g,
            '/',
          );
          item.itemPath = relPath;
        }
        if (
          item.background &&
          config.path &&
          !item.background.startsWith('backgrounds')
        ) {
          // Make background relative to config.path using path.relative
          const relBg = relative(config.path, item.background).replace(
            /\\/g,
            '/',
          );
          item.background = relBg;
        }
      }
    }

    // Ensure config.path matches the selected folder path
    if (config.path !== folder.filePaths[0]) {
      config.path = folder.filePaths[0];
      // Update the config file on disk
      writeFileSync(
        resolve(normalize(join(folder.filePaths[0], 'config.yml'))),
        yaml.dump(config),
        { encoding: 'utf8' },
      );
    }

    // Clean config items if any are missing
    const cleanedConfig =
      cleanConfigItems(config as CollectionConfigData) ||
      (config as CollectionConfigData);

    for (const item of cleanedConfig.items) {
      try {
        const filePath = normalize(
          join(cleanedConfig.path || '', item.itemPath),
        );
        const backgroundPath = normalize(
          join(cleanedConfig.path || '', item.background),
        );
        const itemContentString = readFileSync(filePath, {
          encoding: 'utf8',
        });
        const itemContent = JSON.parse(itemContentString);
        let cleanedContent = cleanItemContent(itemContent);

        // Split MultiPolygon features into separate Polygon features and
        // deduplicate identical polygons by merging their properties.
        try {
          cleanedContent = cleanedContent.map((layer) => {
            if (!layer.fragments || !Array.isArray(layer.fragments.features))
              return layer;
            const expanded: GeoJSONFeature<Geometry>[] = [];
            for (const feat of layer.fragments.features) {
              if (
                feat &&
                feat.geometry &&
                feat.geometry.type === 'MultiPolygon'
              ) {
                const parts = multiPolygonToPolygons(
                  feat as GeoJSONFeature<MultiPolygon>,
                );
                for (const p of parts) {
                  // copy properties
                  expanded.push({
                    type: 'Feature',
                    geometry: p.geometry,
                    properties: { ...(feat.properties || {}) },
                  });
                }
              } else {
                expanded.push(feat as GeoJSONFeature<Geometry>);
              }
            }

            // Deduplicate identical polygon geometries by coordinates
            const seen = new Map<string, GeoJSONFeature<Polygon>>();
            const deduped: GeoJSONFeature<Geometry>[] = [];
            for (const f of expanded) {
              if (!f || !f.geometry || f.geometry.type !== 'Polygon') {
                deduped.push(f);
                continue;
              }
              const key = JSON.stringify((f.geometry as Polygon).coordinates);
              if (!seen.has(key)) {
                seen.set(key, f as GeoJSONFeature<Polygon>);
                deduped.push(f);
                continue;
              }
              const existing = seen.get(key) as GeoJSONFeature<Polygon>;
              const existingProps = existing.properties || {};
              const newProps = f.properties || {};
              const merged: Record<string, string | number> = {
                ...existingProps,
              };
              for (const [k, v] of Object.entries(newProps)) {
                if (k === 'id' || k === 'targetId') continue;
                const cur = merged[k];
                const vs = String(v);
                if (cur === undefined) {
                  merged[k] = v as string | number;
                } else if (String(cur) !== vs) {
                  const parts = Array.from(new Set([String(cur), vs]));
                  merged[k] = parts.join(' | ');
                }
              }
              existing.properties = merged;
            }

            return {
              ...layer,
              fragments: {
                ...layer.fragments,
                features: deduped,
              },
            };
          });
        } catch (err) {
          logErr(
            `Error splitting multipolygons for item ${item.itemPath}`,
            err,
          );
        }

        if (JSON.stringify(itemContent) !== JSON.stringify(cleanedContent)) {
          writeFileSync(filePath, JSON.stringify(cleanedContent, null, 2));
        }
        // Migrate annotations to ensure targetId
        migrateAnnotations(filePath, backgroundPath);
      } catch (e) {
        console.log(e);
        logErr(`Error cleaning item file: ${item.itemPath}`, e);
      }
    }

    // cleanup backgrounds paths if needed
    const backgroundsSet = new Set<string>();
    for (const bcg of cleanedConfig.backgrounds || []) {
      if (bcg && !bcg.startsWith('backgrounds')) {
        const relBg = normalize(join('backgrounds', basename(bcg)));
        backgroundsSet.add(relBg);
      }
    }

    if (backgroundsSet.size !== 0) {
      cleanedConfig.backgrounds = Array.from(backgroundsSet);
    }

    writeFileSync(
      resolve(normalize(join(folder.filePaths[0], 'config.yml'))),
      yaml.dump(cleanedConfig),
      { encoding: 'utf8' },
    );

    store.set('currentCollectionConfig', cleanedConfig);
    return cleanedConfig;
  } catch (error) {
    logErr('Error opening collection', error);
    showError(
      'Missing configuration',
      'There is no configuration file in selected directory.',
    );
    // navigate back to home
  }
}
