import { Circle, Fill, Stroke, Style } from 'ol/style';

export const selectStyle = new Style({
  stroke: new Stroke({
    color: 'red',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
});

export const selectMultipleStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(255, 0, 0, 1)',
    width: 4,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)',
  }),
});

export const infoSelectedStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0, 0, 180, 1)',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 180, 0.1)',
  }),
  image: new Circle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 180, 1)',
      width: 2,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 180, 0.1)',
    }),
  }),
});

export const deleteStyle = new Style({
  stroke: new Stroke({
    color: 'orange',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.1)',
  }),
});

export const fragmentsStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0, 94, 23, 1)',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(0, 255, 64, 0.1)',
  }),
});

export const baseStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)',
  }),
});

export const selectedBoneStyle = new Style({
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 8,
  }),
  fill: new Fill({
    color: 'rgba(0, 0, 0, 0)',
  }),
});

export const annotationStyle = (fillColor: string, strokeColor: string) =>
  new Style({
    image: new Circle({
      radius: 5,
      stroke: new Stroke({
        color: strokeColor,
        width: 2,
      }),
      fill: new Fill({
        color: fillColor,
      }),
    }),
  });
