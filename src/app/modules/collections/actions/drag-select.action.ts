import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import DragBox from 'ol/interaction/DragBox';

import { TAction } from '../../../../types/store.types';
import { geojsonFormat, getNextId } from '../../../../utils';
import {
  infoSelectedStyle,
  selectedBoneStyle,
} from '../components/collection-home/editor-styles';
import { setAddByRectangleDrawRef } from '../slices/interactions.slice';
import { setLayersData } from '../slices/layers.slice';
import { setInfoDetails, setMultipleAddIds } from '../slices/selected.slice';
import { recalculateAreas } from './calculate-area.action';

// Initialize and set up DragBox interaction for rectangle selection
export function initializeAddByRectangleDraw(): TAction {
  return (dispatch, getState) => {
    const { addByRectangleDrawRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (addByRectangleDrawRef) {
      olMapRef.removeInteraction(addByRectangleDrawRef);
    }

    // Use DragBox for rectangle selection
    const dragBox = new DragBox({
      // Remove condition: always-on drag selection, or use platformModifierKeyOnly for Ctrl/Meta only
      // condition: platformModifierKeyOnly,
    });
    dragBox.setActive(false);
    dispatch(setAddByRectangleDrawRef(dragBox));
    dragBox.on('boxend', () => {
      dispatch(handleDragBoxSelection(dragBox));
    });
    olMapRef.addInteraction(dragBox);
  };
}

// DragBox handler for rectangle selection
export function handleDragBoxSelection(dragBox: DragBox): TAction {
  return (dispatch, getState) => {
    const { layers, activeLayerIdx, baseLayerRef } = getState().layers;
    const { ctrl } = getState().hotkeys;
    const extent = dragBox.getGeometry().getExtent();
    if (ctrl && baseLayerRef) {
      // Select bones (baseLayer) when Ctrl is pressed
      const allBones = baseLayerRef.getSource().getFeatures();
      const selectedBones: Feature<Geometry>[] = allBones.filter((feature) => {
        const [fminx, fminy, fmaxx, fmaxy] = feature.getGeometry().getExtent();
        return (
          extent[0] <= fminx &&
          extent[1] <= fminy &&
          extent[2] >= fmaxx &&
          extent[3] >= fmaxy
        );
      });
      // Reset all fragment styles
      if (layers[activeLayerIdx] && layers[activeLayerIdx].source) {
        layers[activeLayerIdx].source
          .getFeatures()
          .forEach((f) => f.setStyle(undefined));
      }
      allBones.forEach((feature) => {
        if (selectedBones.includes(feature)) {
          feature.setStyle(selectedBoneStyle);
        } else {
          feature.setStyle(undefined);
        }
      });
      dispatch({ type: 'selected/setSelectedBone', payload: selectedBones });
      dispatch(setInfoDetails([]));
    } else if (layers[activeLayerIdx] && layers[activeLayerIdx].source) {
      // Reset all bone styles
      if (baseLayerRef) {
        baseLayerRef
          .getSource()
          .getFeatures()
          .forEach((f) => f.setStyle(undefined));
      }
      // Select fragments (default)
      const selected: string[] = [];
      const selectedFeatures: Feature<Geometry>[] = [];
      const allFeatures = layers[activeLayerIdx].source.getFeatures();
      const featuresList = layers[activeLayerIdx].source
        .getFeaturesInExtent(extent)
        .filter((feature) => {
          const [fminx, fminy, fmaxx, fmaxy] = feature
            .getGeometry()
            .getExtent();
          return (
            extent[0] <= fminx &&
            extent[1] <= fminy &&
            extent[2] >= fmaxx &&
            extent[3] >= fmaxy
          );
        });
      allFeatures.forEach((feature) => {
        if (featuresList.includes(feature)) {
          feature.setStyle(infoSelectedStyle);
        } else {
          feature.setStyle(undefined);
        }
      });
      if (featuresList.length) {
        featuresList.forEach((feature) => {
          selected.push(feature.getId().toString());
          selectedFeatures.push(feature);
        });
        dispatch(setMultipleAddIds(selected));
        dispatch(setInfoDetails(selectedFeatures));
      } else {
        dispatch(setMultipleAddIds([]));
        dispatch(setInfoDetails([]));
      }
      // Deselect bones if any
      if (baseLayerRef) {
        baseLayerRef
          .getSource()
          .getFeatures()
          .forEach((f) => f.setStyle(undefined));
        dispatch({ type: 'selected/setSelectedBone', payload: [] });
      }
    }
  };
}

export function submitMultipleFragmentsHandler(): TAction {
  return async (dispatch, getState) => {
    const { layers, activeLayerIdx, layersData } = getState().layers;
    const { multipleAddIds } = getState().selected;
    const processed: Feature<Geometry>[] = [];

    const properties = layersData[activeLayerIdx].propertiesConfig.reduce<
      Record<string, string | number>
    >((acc, current) => {
      acc[current.name] = current.defaultValue;
      return acc;
    }, {});
    properties.fill = layersData[activeLayerIdx].fill;
    properties.stroke = layersData[activeLayerIdx].stroke;
    properties.strokeWidth = layersData[activeLayerIdx].strokeWidth;

    for (const featureData of multipleAddIds) {
      const feature = layers[activeLayerIdx].source.getFeatureById(featureData);
      const fragmentProps: Record<string, string | undefined> = {
        ...properties,
        targetId: feature.getId().toString(),
        "Fragment's area": '100.00%', // eslint-disable-line
      };
      delete fragmentProps._id;
      feature.setProperties(fragmentProps);
      feature.setId(getNextId(layers[activeLayerIdx].source.getFeatures()));
      processed.push(feature);
    }

    dispatch(setMultipleAddIds([]));
    dispatch(recalculateAreas());

    const geojson = geojsonFormat.writeFeaturesObject(
      layers[activeLayerIdx].source.getFeatures(),
    );
    const newLayersData = [...layersData];

    newLayersData[activeLayerIdx] = {
      ...layersData[activeLayerIdx],
      fragments: geojson,
    };

    dispatch(setLayersData(newLayersData));
    dispatch(recalculateAreas());
    await window.electron.saveFeaturesToTempFile(newLayersData);
  };
}
