import { TAction } from '../../../../types/store.types';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import { setMode } from '../slices/editor.slice';
import { setInfoDetails } from '../slices/selected.slice';
import { resetFeatureStyle } from './reset.action';

export function changeEditMode(newMode?: EDIT_MODE_TYPE): TAction {
  return (dispatch, getState) => {
    dispatch(turnOffAllModes());

    const {
      drawFragmentRef,
      splitFragmentRef,
      subtractFragmentRef,
      deleteSelectRef,
      snapFragmentRef,
      addByRectangleDrawRef,
      infoSelectRef: selectRef,
      drawAnnotationRef,
      boneSelectRef,
    } = getState().interactions;
    const { layers, activeLayerIdx } = getState().layers;
    // Clear selection and reset styles if switching to a mode other than SELECT
    if (newMode !== EDIT_MODE_TYPE.SELECT) {
      dispatch(setInfoDetails([]));
      if (layers[activeLayerIdx] && layers[activeLayerIdx].source) {
        layers[activeLayerIdx].source.getFeatures().forEach((f) => {
          resetFeatureStyle(f);
        });
      }
    }
    switch (newMode) {
      case EDIT_MODE_TYPE.SELECT_RECTANGLE:
        addByRectangleDrawRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.ADDITION:
        drawFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.SUBTRACTION:
        subtractFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.SPLIT:
        splitFragmentRef.setActive(true);
        snapFragmentRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.DELETE:
        deleteSelectRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.SELECT:
        selectRef.setActive(true);
        boneSelectRef.setActive(true);
        break;
      case EDIT_MODE_TYPE.ANNOTATION:
        selectRef.setActive(false);
        drawAnnotationRef.setActive(true);
        break;

      default:
        selectRef.setActive(true);
        boneSelectRef.setActive(true);
        break;
    }

    dispatch(setMode(newMode));
  };
}

export function turnOffAllModes(): TAction {
  return (_dispatch, getState) => {
    const {
      drawFragmentRef,
      splitFragmentRef,
      subtractFragmentRef,
      deleteSelectRef,
      snapFragmentRef,
      addByRectangleDrawRef,
      infoSelectRef,
      drawAnnotationRef,
    } = getState().interactions;
    if (drawFragmentRef) {
      drawFragmentRef.setActive(false);
    }
    if (splitFragmentRef) {
      splitFragmentRef.setActive(false);
    }
    if (subtractFragmentRef) {
      subtractFragmentRef.setActive(false);
    }
    if (deleteSelectRef) {
      deleteSelectRef.setActive(false);
    }
    if (snapFragmentRef) {
      snapFragmentRef.setActive(false);
    }
    if (addByRectangleDrawRef) {
      addByRectangleDrawRef.setActive(false);
    }
    if (infoSelectRef) {
      infoSelectRef.setActive(false);
    }
    if (drawAnnotationRef) {
      drawAnnotationRef.setActive(false);
    }
  };
}
