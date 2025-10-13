import { singleClick } from 'ol/events/condition';
import { Select } from 'ol/interaction';

import { TAction } from '../../../../types/store.types';
import { infoSelectedStyle } from '../components/collection-home/editor-styles';
import { setInfoSelectRef } from '../slices/interactions.slice';
import { setInfoDetails, setSelectedBone } from '../slices/selected.slice';
import { resetBaseFeatureStyle, resetFeatureStyle } from './reset.action';

export function setupFragmentSelectInteraction(): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef, baseLayerRef, layers, activeLayerIdx, baseSourceRef } =
      getState().layers;
    const { infoSelectRef } = getState().interactions;
    const { shift } = getState().hotkeys;

    if (infoSelectRef) {
      olMapRef.removeInteraction(infoSelectRef);
    }

    const infoClick = new Select({
      layers: [
        baseLayerRef,
        ...layers.flatMap(({ base, annotationLayer }) => [
          base,
          annotationLayer,
        ]),
      ],
      condition: (event) => {
        const original = event.originalEvent;
        const ctrlPressed =
          (original && original.ctrlKey) || getState().hotkeys.ctrl;
        return singleClick(event) && !ctrlPressed;
      },
      style: () => {
        if (getState().hotkeys.ctrl) return null;
        return infoSelectedStyle;
      },
      filter: (_feature, layer) => {
        const { layers, activeLayerIdx } = getState().layers;
        return (
          layer.getClassName() ===
            layers[activeLayerIdx]?.base.getClassName() ||
          layer.getClassName() ===
            layers[activeLayerIdx]?.annotationLayer.getClassName()
        );
      },
    });
    infoClick.setActive(false);
    olMapRef.addInteraction(infoClick);

    dispatch(setInfoSelectRef(infoClick));
    infoClick.on('select', (e) => {
      const event = e.mapBrowserEvent;
      const shiftPressed =
        (event && event.originalEvent && event.originalEvent.shiftKey) || shift;
      const selectedFeatures = getState().selected.infoDetails || [];
      const allFeatures = layers[activeLayerIdx].source.getFeatures();
      const ctrlPressed = getState().hotkeys.ctrl;
      if (ctrlPressed) {
        return;
      }

      if (!e.selected?.length) {
        allFeatures.forEach((f) => resetFeatureStyle(f));
        dispatch(setInfoDetails([]));
        return;
      }

      const clickedFeature = e.selected[0];
      const isAnnotation = !!clickedFeature.getProperties().annotation;
      let newSelection: typeof selectedFeatures;
      if (clickedFeature) {
        dispatch(setSelectedBone([]));
        baseSourceRef.getFeatures().forEach((f) => {
          resetBaseFeatureStyle(f);
        });

        allFeatures.forEach((f) => {
          if (f !== clickedFeature) {
            resetFeatureStyle(f);
          }
        });
      }
      if (isAnnotation) {
        newSelection = [clickedFeature];
      } else if (shiftPressed) {
        const alreadySelected = selectedFeatures.find(
          (f) => f.getId() === clickedFeature.getId(),
        );
        if (!alreadySelected) {
          newSelection = [
            ...selectedFeatures.filter((f) => !f.getProperties().annotation),
            clickedFeature,
          ];
        } else {
          newSelection = selectedFeatures.filter(
            (f) =>
              f.getId() !== clickedFeature.getId() &&
              !f.getProperties().annotation,
          );
        }
      } else {
        newSelection = [clickedFeature];
      }
      infoClick.getFeatures().clear();
      allFeatures.forEach((f) => {
        if (newSelection.includes(f)) {
          f.setStyle(infoSelectedStyle);
        } else {
          resetFeatureStyle(f);
        }
      });
      dispatch(setInfoDetails(newSelection));
    });
    return infoClick;
  };
}
