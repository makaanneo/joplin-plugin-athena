import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import fs = require('fs-extra');

class fileHandler {
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
  public async archive_file(
    file: string,
    fileName: string,
    archivePath: string,
    dateTime: Date
  ): Promise<string> {
    await this.initialize();
    const targetFolder = await this.createArchiveFolderIfNotExists(
      fileName,
      archivePath,
      dateTime
    );
    var target = targetFolder + fileName;
    fs.rename(file, target);
    return target;
  }

  public async clean_up_file(file: string): Promise<void> {
    fs.removeSync(file);
  }

  public async createArchiveFolderIfNotExists(
    fileName: string,
    archiveBaseFolder: string,
    dateTime: Date
  ): Promise<string> {
    await this.initialize();
    const year = dateTime.getFullYear();
    const month = `${dateTime.getMonth() + 1 < 10 ? '0' : ''}${
      dateTime.getMonth() + 1
    }`;
    const target = archiveBaseFolder + `/${year}/${month}/`;
    fs.mkdirSync(target, { recursive: true });
    return target;
  }
}

export { fileHandler };
