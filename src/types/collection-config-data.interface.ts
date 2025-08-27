import { FeatureCollection } from 'geojson';
import { Feature } from 'ol';
import { Geometry, Point } from 'ol/geom';
import { Draw, Select, Snap } from 'ol/interaction';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
export interface CollectionConfigData {
  name: string;
  description?: string;
  path?: string;
  backgrounds: string[];
  items: Item[];
  showHints: boolean;
}

export interface Item {
  itemPath: string;
  background: string;
}

export interface Layer {
  name: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  propertiesConfig: {
    name: string;
    defaultValue: string;
  }[];
  fragments: FeatureCollection;
  annotations: FeatureCollection;
  visible: boolean;
}

export type ItemContent = Layer[];

export interface LayersAndSources {
  splitLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  addByRectangleLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  vectorLayer: VectorLayer<VectorSource<Feature<Geometry>>>;
  linesLayers: VectorLayer<VectorSource<Feature<Geometry>>>;
  vectorSource: VectorSource<Feature<Geometry>>;
  backgroundFeatures: Feature<Geometry>[];
  splitSource: VectorSource<Feature<Geometry>>;
  addByRectangleSource: VectorSource<Feature<Geometry>>;
  layers: DrawLayer[];
}

export interface DrawLayer {
  base: VectorLayer<VectorSource<Feature<Geometry>>>;
  source: VectorSource<Feature<Geometry>>;
  snap: Snap;
  delete: Select;
  hover: Select;
  draw: Draw;
  subtract: Draw;
  annotationLayer: VectorLayer<VectorSource<Feature<Point>>>;
  annotationSource: VectorSource<Feature<Geometry>>;
  annotationDraw: Draw;
}
