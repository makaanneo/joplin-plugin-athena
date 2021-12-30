import joplin from 'api';
import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import fs = require('fs-extra');
import crypto = require('crypto');

class fileExtensions {
  private _pluginSettings: pluginSettings;
  constructor() {
    this.initialize();
  }

  /**
   * initialize the controller component.
   */
  private async initialize() {
    try {
      this._pluginSettings = await settings.getImportSettings();
    } catch (error) {
      console.error(error);
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
    return true;
  }

  public async buildFileHash(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha512');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }
}
export { fileExtensions };
