interface Window extends Window {
  electron: {
    createCollection: (data: CollectionConfigData) => Promise<boolean>;
    openCollection: () => Promise<CollectionConfigData>;
    readCollection: () => Promise<CollectionConfigData>;
    resetCurrentlyLoadedConfig: () => Promise<void>;
    setDrawerWidth: (width: number) => Promise<void>;
    getDrawerWidth: () => Promise<number>;
    updateCollectionDetails: (
      data: CollectionConfigData,
      mute?: boolean,
    ) => Promise<CollectionConfigData>;
    getAllItems: () => Promise<string[]>;
    addNewBackground: () => Promise<CollectionConfigData>;
    createNewItem: (name: string, background: string) => Promise<string>;
    openItem: (filename: string) => Promise<{
      itemContentString: string;
      backgroundJSONString: string;
    }>;
    saveAndCloseItem: () => Promise<void>;
    saveItem: () => Promise<void>;
    saveFeaturesToTempFile: (
      itemData: import('./types/collection-config-data.interface').ItemContent,
    ) => Promise<void>;
    openCollectionFromMenu: (callback: () => Promise<void>) => void;
    newCollectionFromMenu: (callback: () => Promise<void>) => void;
    saveCollectionFromMenu: (callback: () => Promise<void>) => void;
    onCollectionPageEnter: () => Promise<void>;
    onCollectionPageLeave: () => Promise<void>;
    collectionPageEscHandler: (callback: () => Promise<void>) => void;
    exportCollection: () => Promise<void>;
    exportSVG: (extent: Extent, fragment?: Feature) => Promise<void>;
    exportBoneSVG: (
      extent: Extent,
      base: Feature<MultiPolygon | Polygon>,
      item: Feature<MultiPolygon | Polygon>,
    ) => Promise<void>;
    getVersion: () => Promise<{ version: string; name: string }>;
    toggleHint: (data: boolean) => void;
    getConfig: () => Promise<CollectionConfigData>;
    setConfig: (data: CollectionConfigData) => Promise<void>;
  };
}

declare module 'svg-path-to-polygons';
declare module 'polygon-splitter';
declare module 'geojson-to-svg';
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement>
  >;
  const src: string;
  export default src;
}
