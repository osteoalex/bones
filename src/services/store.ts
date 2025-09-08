import electron from 'electron';
import fs from 'fs';
import path from 'path';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Opts {
  configName: string;
  defaults: Record<string, any>;
}

export class Store {
  path: string;
  data: any;

  constructor(opts: Opts) {
    const userDataPath = electron.app.getPath('userData');
    this.path = path.join(userDataPath, opts.configName + '.json');

    this.data = parseDataFile(this.path, opts.defaults);
  }

  get(key: string) {
    return this.data[key];
  }

  set(key: string, val: any) {
    this.data[key] = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

function parseDataFile(filePath: string, defaults: Record<string, any>) {
  try {
    return JSON.parse(fs.readFileSync(filePath, { encoding: 'utf8' }));
  } catch (error) {
    return defaults;
  }
}
