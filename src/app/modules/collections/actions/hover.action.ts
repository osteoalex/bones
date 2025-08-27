import { Feature } from 'ol';
import { pointerMove } from 'ol/events/condition';
import { Geometry } from 'ol/geom';
import { Select } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import { TAction } from '../../../../types/store.types';
import { hoverStyle } from '../components/collection-home/editor-styles';

export function setupBoneHover(
  layer: VectorLayer<VectorSource<Feature<Geometry>>, Feature<Geometry>>,
): TAction<Select> {
  return (dispatch, getState) => {
    const { olMapRef } = getState().layers;
    const { boneHoverRef } = getState().interactions;

    if (boneHoverRef) {
      olMapRef.removeInteraction(boneHoverRef);
    }

    const hoverSelect = new Select({
      layers: [layer],
      condition: pointerMove,
      style: hoverStyle,
    });

    olMapRef.addInteraction(hoverSelect);

    return hoverSelect;
  };
}
