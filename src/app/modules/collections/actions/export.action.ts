import { TAction } from '../../../../types/store.types';
import { geojsonFormat } from '../../../../utils';
import { setLoading } from '../slices/ui.slice';

export function exportFragmentHandler(ids?: string[]): TAction {
  return (_dispatch, getState) => {
    const { baseSourceRef, layers } = getState().layers;
    if (ids && ids.length > 1) {
      // Export multiple fragments as one SVG (union extent)
      const features = ids
        .map((id) => {
          for (const layer of layers) {
            const f = layer.source.getFeatureById(id);
            if (f) return f;
          }
          return null;
        })
        .filter(Boolean);
      if (!features.length) return;
      // Calculate union extent
      const extent = features[0].getGeometry().getExtent().slice();
      features.slice(1).forEach((f) => {
        const e = f.getGeometry().getExtent();
        extent[0] = Math.min(extent[0], e[0]);
        extent[1] = Math.min(extent[1], e[1]);
        extent[2] = Math.max(extent[2], e[2]);
        extent[3] = Math.max(extent[3], e[3]);
      });
      // Use the first feature's base as reference
      const base = baseSourceRef.getFeatureById(
        features[0].getProperties().targetId,
      );
      window.electron.exportBoneSVG(
        extent,
        geojsonFormat.writeFeatureObject(base),
        features.map((f) => geojsonFormat.writeFeatureObject(f)),
      );
    } else {
      // Single fragment export (default)
      const infoDetailsArr = getState().selected.infoDetails;
      if (!infoDetailsArr.length) return;
      const infoDetails = infoDetailsArr[0];
      const base = baseSourceRef.getFeatureById(
        infoDetails.getProperties().targetId,
      );
      const extent = base.getGeometry().getExtent();
      window.electron.exportBoneSVG(
        extent,
        geojsonFormat.writeFeatureObject(base),
        geojsonFormat.writeFeatureObject(infoDetails),
      );
    }
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
