import 'reflect-metadata';
import * as chokidar from 'chokidar';
import { injectable, inject } from 'inversify';
import { TYPES } from './types';
import { iAthenaConfiguration } from './settings/athenaConfiguration';
import { iJoplinNoteProcessor } from './core/joplinNoteProcessor';

let watcher: Array<any> = [];

export interface iDirectoryMonitoreWorker {
  watchDirectory(): Promise<void>;
  removeWatcher(): Promise<void>;
}

@injectable()
export class directoryMonitoreWorker implements iDirectoryMonitoreWorker {
  private _settings: iAthenaConfiguration;
  private _jnp: iJoplinNoteProcessor;
  private _directoryWatcher: Array<any> = new Array<any>();
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iJoplinNoteProcessor) jnp: iJoplinNoteProcessor
  ) {
    this._settings = settings;
    this._jnp = jnp;
  }
  async removeWatcher(): Promise<void> {
    if (this._directoryWatcher.length > 0) {
      this._directoryWatcher.forEach(async (element) => {
        console.log(`End watching directory: ${element}`);
        await element.close();
      });
    }
  }

  async watchDirectory(): Promise<void> {
    await this._settings.initilize();
    console.log(`start watch of ${this._settings.Values.importPath}`);
    const recursiveDepth = this._settings.Values.importRecursive
      ? this._settings.Values.importRecursiveDepth
      : 0;
    if (
      this._settings.Values.importPath !== '' ||
      this._settings.Values.importPath !== undefined ||
      this._settings.Values.importPath !== null
    ) {
      const ownObject = this;
      if (this._directoryWatcher.length > 0) {
        this._directoryWatcher.forEach(async (element) => {
          console.log(`End watching directory: ${element}`);
          await element.close();
        });
        this._directoryWatcher = [];
      }
      let chokidarWatcher = null;
      try {
        chokidarWatcher = chokidar
          .watch(this._settings.Values.importPath, {
            persistent: true,
            awaitWriteFinish: true,
            ignored: this._settings.Values.ignoreFiles,
            depth: recursiveDepth,
            usePolling: false // set true to successfully watch files over a network
          })
          .on('add', async (path) => {
            console.log('watchAndImport File', path, 'has been added');
            await this._jnp.buildNoteFromFile(path);
          });
      } catch (error) {
        console.error(error);
      }
      this._directoryWatcher.push(chokidarWatcher);
    } else {
      console.log('Nothing to monitore!');
    }
  }
}
