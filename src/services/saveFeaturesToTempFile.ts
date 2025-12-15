import { writeFileSync } from 'fs';
import { GeoJSON } from 'geojson';
import { join, normalize } from 'path';

export async function saveFeaturesToTempFile(
  app: Electron.App,
  geojson: GeoJSON,
) {
  const userDataPath = [app.getPath('appData'), app.getName()];
  await writeFileSync(
    normalize(join(...userDataPath, 'currentItem')),
    JSON.stringify(geojson),
    {
      encoding: 'utf8',
    },
  );
}
