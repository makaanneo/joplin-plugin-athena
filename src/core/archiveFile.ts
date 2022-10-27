import fs = require('fs-extra');
import * as path from 'path';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { iRawFile } from 'src/core/rawFile';
import { readdirSync } from 'fs';

export interface iArchiveFile {
  archiveFile(
    file: string,
    fileName: string,
    archivePath: string,
    fileExtension: string
  ): Promise<string>;
  archive(file: iRawFile): Promise<string>;
  cleanUp(file: iRawFile): Promise<void>;
  createArchiveFolder(
    archiveBaseFolder: string,
    dateTime: Date
  ): Promise<string>;
  getFileNameNoise(fileName: string, archiveTarget: string): Promise<string>;
}

@injectable()
export class archiveFile implements iArchiveFile {
  private _settings: iAthenaConfiguration;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    this._settings = settings;
  }
  async getFileNameNoise(
    fileName: string,
    archiveTarget: string
  ): Promise<string> {
    const currentDate = new Date(Date.now());
    return currentDate.getUTCMilliseconds().toString();
  }

  async archive(file: iRawFile): Promise<string> {
    const archiveTarget = this._settings.Values.archiveTarget;
    try {
      console.log(`Archive file: ${file.Name} to: ${archiveTarget}.`);
      const target = await this.createArchiveFolder(
        archiveTarget,
        file.Captured
      );
      const fileExt = path.extname(file.FullPath);
      await this.archiveFile(file.FullPath, file.Name, target, fileExt);
    } catch (e) {
      console.error(e);
      return undefined;
    }
    return '';
  }

  public async archiveFile(
    sourceFile: string,
    fileName: string,
    archivePath: string,
    fileExtension: string
  ): Promise<string> {
    const baseName = path.basename(fileName);
    const extension = path.extname(baseName);
    const clean = baseName.replace(extension, '');
    let target = path.join(archivePath, clean);
    if (fs.existsSync(target)) {
      const newFileName = `${clean}-(${await this.getFileNameNoise(
        clean,
        archivePath
      )})${fileExtension}`;
      target = path.join(archivePath, newFileName);
      fs.moveSync(sourceFile, target, { overwrite: false });
    } else {
      fs.moveSync(sourceFile, target, { overwrite: true });
    }
    return target;
  }

  public async cleanUp(file: iRawFile): Promise<void> {
    fs.removeSync(file.FullPath);
  }

  public async createArchiveFolder(
    archiveTarget: string,
    dateTime: Date
  ): Promise<string> {
    let target = 'no_date';
    try {
      const year = dateTime.getFullYear();
      const month = `${dateTime.getMonth() + 1 < 10 ? '0' : ''}${
        dateTime.getMonth() + 1
      }`;
      target = path.join(archiveTarget, year.toString(), month);
    } catch (error) {
      console.info(`Date is not valid: ${dateTime}`);
    }
    fs.ensureDirSync(target);
    return target;
  }
}
