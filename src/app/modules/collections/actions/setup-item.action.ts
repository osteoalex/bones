/* eslint-disable */
import { Feature as GeoJSONFeature, MultiPolygon, Polygon } from 'geojson';

import { TAction } from '../../../../types/store.types';
import { calculateArea, geojsonFormat } from '../../../../utils';
import { EDIT_MODE_TYPE } from '../../../../utils/enums';
import { setItems, setMode } from '../slices/editor.slice';
import {
  setBaseBoneHoverRef,
  setBoneHoverRef,
  setDeleteSelectRef,
  setDrawFragmentRef,
  setInfoSelectRef,
  setSnapFragmentRef,
  setSubtractFragmentRef,
} from '../slices/interactions.slice';
import { setLayers, setLayersData } from '../slices/layers.slice';
import { setFullArea } from '../slices/selected.splice';
import {
  abortDrawRectangle,
  abortDrawing,
  abortSplit,
  abortSubtract,
} from './abort.action';
import { setupAddByRectangleDraw } from './add-by-rectangle.action';
import { setupAddMultipleInteraction } from './add-multiple.action';
import { recalculateAreas } from './calculate-area.action';
import { setupBoneHover } from './hover.action';
import { setupInfoClickInteraction } from './info-click.action';
import { changeEditMode } from './mode.action';
import { setupLayersAndSources } from './setup-layers-and-sources.action';
import { setupSplitFragmentInteraction } from './split.action';
/* eslint-enable */

export function getAndSetupItem(currentItem: string): TAction {
  return async (dispatch, getState) => {
    const { olMapRef } = getState().layers;
    dispatch(setMode(EDIT_MODE_TYPE.SELECT));
    if (currentItem !== '') {
      const items = await window.electron.getAllItems();
      dispatch(setItems(items));
      const { itemContentString, backgroundJSONString } =
        await window.electron.openItem(currentItem);
      const itemContent = JSON.parse(itemContentString);
      dispatch(setLayersData(itemContent));

      olMapRef.getLayers().forEach((layer) => {
        olMapRef.removeLayer(layer);
      });

      const {
        splitLayer,
        addByRectangleLayer,
        vectorLayer,
        linesLayers,
        backgroundFeatures,
        layers,
      } = dispatch(setupLayersAndSources(itemContent, backgroundJSONString));

      olMapRef.addLayer(vectorLayer);
      olMapRef.addLayer(linesLayers);
      olMapRef.addLayer(splitLayer);
      olMapRef.addLayer(addByRectangleLayer);
      layers.forEach(({ base, annotationLayer }) => {
        olMapRef.addLayer(base);
        olMapRef.addLayer(annotationLayer);
      });
      const extent = vectorLayer.getSource()?.getExtent();
      if (extent) {
        olMapRef.getView().fit(extent);
      }

      const area = backgroundFeatures.reduce((acc, current) => {
        const item = geojsonFormat.writeFeatureObject(
          current,
        ) as GeoJSONFeature<Polygon | MultiPolygon>;
        const area = calculateArea(item);
        if (area) {
          return (acc += calculateArea(item));
        } else {
          return acc;
        }
      }, 0);
      dispatch(setFullArea(area));

      const baseBoneHoverRef = dispatch(setupBoneHover(vectorLayer));
      dispatch(setupAddByRectangleDraw());
      dispatch(setupAddMultipleInteraction());
      dispatch(setupSplitFragmentInteraction());

      dispatch(setLayers(layers));
      dispatch(setBaseBoneHoverRef(baseBoneHoverRef));
      if (layers.length > 0) {
        const { snap, hover, draw, subtract } = layers[0];
        dispatch(setSnapFragmentRef(snap));
        dispatch(setDeleteSelectRef(layers[0].delete));
        dispatch(setBoneHoverRef(hover));
        dispatch(setDrawFragmentRef(draw));
        dispatch(setSubtractFragmentRef(subtract));
      }
      const infoClickRef = dispatch(setupInfoClickInteraction());
      dispatch(setInfoSelectRef(infoClickRef));

      dispatch(changeEditMode(EDIT_MODE_TYPE.SELECT));
      olMapRef.render();

      await window.electron.collectionPageEscHandler(async () => {
        dispatch(abortDrawing());
        dispatch(abortSubtract());
        dispatch(abortSplit());
        dispatch(abortDrawRectangle());
      });
    }

    dispatch(recalculateAreas());
  };
}
