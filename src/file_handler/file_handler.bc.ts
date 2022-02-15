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
    archivePath: string
  ): Promise<string> {
    await this.initialize();
    var target = path.join(archivePath, fileName);
    fs.renameSync(file, target);
    return target;
  }

  public async clean_up_file(file: string): Promise<void> {
    fs.removeSync(file);
  }

  public async createDuplicateArchiveFolder(
    archiveBaseFolder: string
  ): Promise<string> {
    const target = path.join(archiveBaseFolder, 'duplicate');
    if (!fs.pathExistsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }
    return target;
  }

  public async createArchiveFolderIfNotExists(
    archiveBaseFolder: string,
    dateTime: Date
  ): Promise<string> {
    await this.initialize();
    let archiveDate: Date = null;
    if (typeof dateTime === undefined || dateTime === null) {
      archiveDate = new Date(Date.now());
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
    if (!fs.pathExistsSync(target)) {
      console.log(`Create archive target: ${target}`);
      fs.mkdirSync(target, { recursive: true });
    }
    return target;
  }
}

export { fileHandler };
