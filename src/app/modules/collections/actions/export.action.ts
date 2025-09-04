import { TAction } from '../../../../types/store.types';
import { geojsonFormat } from '../../../../utils';
import { setLoading } from '../slices/ui.slice';

export function exportFragmentHandler(): TAction {
  return (_dispatch, getState) => {
    const { baseSourceRef } = getState().layers;
    const infoDetails = getState().selected.infoDetails;
    const base = baseSourceRef.getFeatureById(
      infoDetails.getProperties().targetId,
    );
    const extent = base.getGeometry().getExtent();
    window.electron.exportBoneSVG(
      extent,
      geojsonFormat.writeFeatureObject(base),
      geojsonFormat.writeFeatureObject(infoDetails),
    );
  };
}

export function exportItemHandler(): TAction {
  return async (dispatch, getState) => {
    dispatch(setLoading(true));
    const { baseSourceRef, layers } = getState().layers;
    const geojson = layers
      .filter((l) => l.base.getVisible())
      .flatMap((l) => {
        return l.source
          .getFeatures()
          .map((f) => geojsonFormat.writeFeatureObject(f));
      });
    await window.electron.exportSVG(baseSourceRef.getExtent(), geojson);
    dispatch(setLoading(false));
  };
}
