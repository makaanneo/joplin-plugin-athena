import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import crypto = require('crypto');
import fs = require('fs-extra');
import joplin from 'api';

class baseHandler {
  private _pluginSettings: pluginSettings;
  constructor() {
    this.initialize();
  }

  /**
   * initialize the controller component.
   */
  protected async initialize() {
    try {
      this._pluginSettings = await settings.getImportSettings();
    } catch (error) {
      console.error(error);
    }
  }

  public async buildFileHash(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha512');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

  public async createResources(
    file: string,
    title: string,
    fileName: string
  ): Promise<any> {
    try {
      return await joplin.data.post(
        ['resources'],
        null,
        {
          title: title,
          fileName: fileName
        },
        [
          {
            path: file
          }
        ]
      );
    } catch (e) {
      console.error('Error on create resources');
      console.error(e);
      return null;
    }
  }

  public async isDuplicate(hash: string): Promise<boolean> {
    console.info(`search for duplicate of file with hash: ${hash}`);
    const query = await joplin.data.get(['search'], {
      query: hash,
      type: 'note'
    });
    if (
      typeof query === undefined ||
      query == null ||
      (query != null && query.items.length === 0) ||
      typeof query.items[0] === undefined
    ) {
      return false;
    }
    if (query.items >= 1) {
      return false;
    }
  }
}

export { baseHandler };
