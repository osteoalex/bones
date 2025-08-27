import { Feature } from 'ol';
import { Geometry } from 'ol/geom';

import { fragmentsStyle } from '../components/collection-home/editor-styles';

export function resetFeatureStyle(item: Feature<Geometry>) {
  item.setStyle((fragment) => {
    const style = fragmentsStyle.clone();
    const fill = fragment.get('fill') || 'rgba(0, 255, 64, 0.1)';
    style.getFill().setColor(fill);
    const stroke = fragment.get('stroke') || 'rgba(0, 94, 23, 1)';
    style.getStroke().setColor(stroke);
    return style;
  });
}

export const resetBaseFeatureStyle = (item: Feature<Geometry>) => {
  item.setStyle(() => {
    const style = fragmentsStyle.clone();
    const fill = 'rgba(0, 0, 0, 0)';
    style.getFill().setColor(fill);
    const stroke = 'rgba(0, 0, 0, 1)';
    style.getStroke().setColor(stroke);
    style.getStroke().setWidth(2);
    return style;
  });
};
