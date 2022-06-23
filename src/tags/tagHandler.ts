import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import crypto = require('crypto');
import fs = require('fs-extra');
import joplin from 'api';

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
}
export { tagHandler };
