import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import crypto = require('crypto');
import fs = require('fs-extra');

class tagHandler {
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
}
export { tagHandler };
