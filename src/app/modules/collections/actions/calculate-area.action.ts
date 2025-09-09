import { Feature, Geometry, MultiPolygon, Polygon } from 'geojson';

import { TAction } from '../../../../types/store.types';
import { calculateArea, geojsonFormat } from '../../../../utils';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { setFragmentsArea } from '../slices/selected.slice';

export function recalculateAreas(): TAction {
  return async (dispatch, getState) => {
    const { layersData, layers } = getState().layers;

    const updatedLayersData = layersData.map((layer) => {
      const fragments = layer.fragments.features;

      const mapped = fragments.reduce<{ [key: number]: Feature<Geometry>[] }>(
        (acc, current) => {
          const targetId = current.properties.targetId;
          if (acc[targetId]) {
            acc[targetId].push(current);
          } else {
            acc[targetId] = [current];
          }
          return acc;
        },
        {},
      );

      const values = Object.fromEntries(
        Object.entries(mapped).map(([key, fragments]) => {
          return [
            key,
            fragments.reduce((acc, current) => {
              const area = Number(
                current.properties["Fragment's area"]?.match(/\d+(\.\d+)/gm)[0], // eslint-disable-line
              );
              return (acc += area || 0);
            }, 0),
          ];
        }),
      );
      const updatedLayers = [...layers];

      updatedLayers.forEach((layer) => {
        layer.source.getFeatures().forEach((feature) => {
          const targetId = feature.get('targetId');
          feature.set('Preserved bone area', `${values[targetId]}%`);
        });
      });

      dispatch(setLayers(updatedLayers));

      const updatedFragments = fragments.map((fragment) => {
        return {
          ...fragment,
          properties: {
            ...fragment.properties,
            'Preserved bone area': `${values[fragment.properties.targetId]}%`, // eslint-disable-line
          },
        };
      });

      return {
        ...layer,
        fragments: {
          ...layer.fragments,
          features: updatedFragments,
        },
      };
    });

    dispatch(setLayersData(updatedLayersData));
    dispatch(calculateFragmentsArea());
    await window.electron.saveFeaturesToTempFile(updatedLayersData);
  };
}

export function calculateFragmentsArea(): TAction {
  return async (dispatch, getState) => {
    const { layersData } = getState().layers;
    const area = layersData.reduce((acc, current) => {
      const fragments = current.fragments.features;
      const fragmentsArea = fragments.reduce((acc, current) => {
        const item = current as Feature<Polygon | MultiPolygon>;
        const area = calculateArea(item);
        if (area) {
          return (acc += calculateArea(item));
        } else {
          return acc;
        }
      }, 0);
      return (acc += fragmentsArea);
    }, 0);

    dispatch(setFragmentsArea(area));
  };
}

export function recalculateAreaByTargetId(targetId: string): TAction {
  return async (dispatch, getState) => {
    const { layers, layersData, activeLayerIdx, baseSourceRef } =
      getState().layers;
    const currentLayer = layers[activeLayerIdx];
    const currentLayerData = layersData[activeLayerIdx];

    const targetArea = calculateArea(
      geojsonFormat.writeFeatureObject(
        baseSourceRef.getFeatureById(targetId),
      ) as Feature<Polygon | MultiPolygon>,
    );

    const recalculatedFragments = currentLayerData.fragments.features.map(
      (fragment) => {
        if (fragment.properties.targetId === targetId) {
          const item = fragment as Feature<Polygon | MultiPolygon>;
          const area = ((calculateArea(item) * 100) / targetArea).toFixed(2);
          const feature = currentLayer.source.getFeatureById(fragment.id);
          feature.set("Fragment's area", `${area}%`); // eslint-disable-line

          return {
            ...fragment,
            properties: {
              ...fragment.properties,
              "Fragment's area": `${area}%`, // eslint-disable-line
            },
          };
        } else {
          return fragment;
        }
      },
    );

    const newLayersData = [...layersData];

    newLayersData[activeLayerIdx] = {
      ...currentLayerData,
      fragments: {
        ...currentLayerData.fragments,
        features: recalculatedFragments,
      },
    };
    dispatch(setLayersData(newLayersData));

    dispatch(recalculateAreas());
    await window.electron.saveFeaturesToTempFile(newLayersData);
  };
}
