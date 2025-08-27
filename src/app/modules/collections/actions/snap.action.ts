import { Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { Snap } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';

export function setupSnapFragmentInteraction(
  source: VectorSource<Feature<Geometry>>,
): TAction<Snap> {
  return (_dispatch, getState) => {
    const { snapFragmentRef } = getState().interactions;
    const { olMapRef } = getState().layers;
    if (snapFragmentRef) {
      olMapRef.removeInteraction(snapFragmentRef);
    }
    const snap = new Snap({ source });
    snap.setActive(false);
    olMapRef.addInteraction(snap);
    return snap;
  };
}
