import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import path = require('path');
import fs = require('fs-extra');
import { rawFile, iRawFile } from './rawFile';
import { typeHandlerBase, iFileTypeHandler } from './typeHandlerBase';

@injectable()
export class plainTextFileHandler
  extends typeHandlerBase
  implements iFileTypeHandler
{
  private _name: string = 'plainTextFileHandler';
  private _supported: Array<string> = new Array<string>();
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    super(settings);
    this._supported.push('.txt');
    this._supported.push('.md');
    this._supported.push('.html');
    this._supported.push('.htm');
    this._supported.push('.tex');
  }
  async canHandle(fileExtension: string): Promise<boolean> {
    const canHandle =
      this._supported.find((e) => e === fileExtension) !== undefined;
    console.log(
      `Handler ${this._name} can Handle: ${canHandle} file extension ${fileExtension}`
    );
    return canHandle;
  }
  async extension(): Promise<Array<string>> {
    return this._supported;
  }
  async loadFile(filePath: string): Promise<rawFile> {
    let fileBuffer: Buffer;
    const fileStats = fs.statSync(filePath);
    try {
      fileBuffer = fs.readFileSync(filePath);
    } catch (e) {
      console.error('Error on readFileSync');
      console.error(e);
      return null;
    }
    const file: iRawFile = new rawFile();
    file.Name = path.basename(filePath);
    file.Extension = path.extname(file.Name);
    file.Content = fileBuffer.toString();
    file.Metadata = {
      Title: file.Name,
      Author: '',
      CreationDate: fileStats.ctime,
      Keywords: new Array<string>(),
      ModificationDate: fileStats.mtime,
      Subject: file.Name
    };
    file.FileHash = await this.buildFileHash(filePath);
    file.FullPath = filePath;
    file.Captured = new Date(Date.now());
    return file;
  }
}
