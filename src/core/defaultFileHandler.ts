import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import path = require('path');
import fs = require('fs-extra');
import { rawFile, iRawFile } from './rawFile';
import { typeHandlerBase, iFileTypeHandler } from './typeHandlerBase';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';

export interface iDefaultFileHandler extends iFileTypeHandler {
  IsDefault: boolean;
}

@injectable()
export class defaultFileHandler
  extends typeHandlerBase
  implements iDefaultFileHandler
{
  private _name: string = 'defaultFileHandler';
  private _supported: Array<string> = new Array<string>();

  public IsDefault: boolean = true;

  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    super(settings);
    this._supported.push('.js');
    this._supported.push('.cs');
    this._supported.push('.zip');
    this._supported.push('.rar');
    this._supported.push('.7z');
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
    const fileStats = fs.statSync(filePath);
    const file: iRawFile = new rawFile();
    file.Name = path.basename(filePath);
    file.Extension = path.extname(file.Name);
    file.Content = '';
    file.Metadata = {
      Title: file.Name,
      Author: '',
      CreationDate: fileStats.ctime,
      Keywords: [],
      ModificationDate: fileStats.mtime,
      Subject: file.Name
    };
    file.FileHash = await this.buildFileHash(filePath);
    file.FullPath = filePath;
    file.Captured = new Date(Date.now());
    return file;
  }
}
