import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import fs = require('fs-extra');
import * as path from 'path';

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
      archivePath,
      dateTime
    );
    var target = path.join(targetFolder, fileName);
    fs.rename(file, target);
    return target;
  }

  public async clean_up_file(file: string): Promise<void> {
    fs.removeSync(file);
  }

  public async createArchiveFolderIfNotExists(
    archiveBaseFolder: string,
    dateTime: Date
  ): Promise<string> {
    await this.initialize();
    let archiveDate: Date = null;
    if (typeof dateTime === undefined || dateTime === null) {
      archiveDate = new Date();
    } else {
      archiveDate = dateTime;
    }
    let target = 'no_date';
    try {
      const year = archiveDate.getFullYear();
      const month = `${archiveDate.getMonth() + 1 < 10 ? '0' : ''}${
        archiveDate.getMonth() + 1
      }`;
      target = path.join(archiveBaseFolder, year.toString(), month);
    } catch (error) {
      console.info(`Date is not valid: ${dateTime}`);
    }
    fs.mkdirSync(target, { recursive: true });
    return target;
  }
}

export { fileHandler };
