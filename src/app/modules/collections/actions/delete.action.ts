import { Feature } from 'ol';
import { singleClick } from 'ol/events/condition';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import { SelectEvent } from 'ol/interaction/Select';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import { isPolygon } from '../../../../utils/type-guards';
import { deleteStyle } from '../components/collection-home/editor-styles';
import { setLayersData } from '../slices/layers.slice';
import { recalculateAreas } from './calculate-area.action';
import { saveSnapshot } from './saveSnapshot.action';
export function setupDeleteSelectionInteraction(
  layer: VectorLayer<VectorSource<Feature<Geometry>>>,
): TAction<Select> {
  return (dispatch, getState) => {
    const { deleteSelectRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (deleteSelectRef) {
      olMapRef.removeInteraction(deleteSelectRef);
    }

    const deleteClick = new Select({
      layers: [layer],
      condition: singleClick,
      style: deleteStyle,
    });

    deleteClick.setActive(false);
    deleteClick.on('select', (e: SelectEvent) =>
      dispatch(deleteSelectHandler(e)),
    );

    olMapRef.addInteraction(deleteClick);
    return deleteClick;
  };
}

export function deleteSelectHandler(e: SelectEvent): TAction {
  return (dispatch, getState) => {
    const { deleteSelectRef } = getState().interactions;
    const { layers, activeLayerIdx, layersData } = getState().layers;

    // Prepare updated layersData and record whether anything changed
    const updatedLayersData = [...layersData];
    let didChange = false;

    for (const selected of e.selected) {
      if (!selected) {
        return;
      }
      if (isPolygon(selected.getGeometry())) {
        const id = selected.getId();

        // Remove from OL source
        const olFeat = layers[activeLayerIdx].source.getFeatureById(id);
        if (olFeat) {
          layers[activeLayerIdx].source.removeFeature(olFeat);
        }

        // Remove from layersData fragments list
        const currentLayerData = layersData[activeLayerIdx];
        const filtered = currentLayerData.fragments.features.filter(
          (f) => f.id !== id,
        );
        updatedLayersData.splice(activeLayerIdx, 1, {
          ...currentLayerData,
          fragments: {
            ...currentLayerData.fragments,
            features: filtered,
          },
        });
        didChange = true;
      }
    }

    if (didChange) {
      // save snapshot for undo (captures pre-change state)
      dispatch(saveSnapshot());
      dispatch(setLayersData(updatedLayersData));
      // persist temp file (non-blocking)
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      window.electron.saveFeaturesToTempFile(updatedLayersData);
    }

    deleteSelectRef.getFeatures().clear();
    dispatch(recalculateAreas());
  };
}
