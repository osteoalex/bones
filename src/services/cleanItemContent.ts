import { ItemContent, Layer } from '../types/collection-config-data.interface';

/**
 * Removes fragments with empty properties from all layers in the item content.
 */
export function cleanItemContent(itemContent: ItemContent): ItemContent {
  return itemContent.map((layer: Layer) => {
    if (!layer.fragments || !Array.isArray(layer.fragments.features))
      return layer;
    const filteredFeatures = layer.fragments.features.filter(
      (fragment) =>
        fragment.properties && Object.keys(fragment.properties).length > 0,
    );
    return {
      ...layer,
      fragments: {
        ...layer.fragments,
        features: filteredFeatures,
      },
    };
  });
}
