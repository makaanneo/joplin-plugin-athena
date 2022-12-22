import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import fs = require('fs-extra');
import crypto = require('crypto');
import { injectable } from 'inversify';
import { iRawFile } from './rawFile';

export interface iFileTypeHandler {
  canHandle(fileExtension: string): Promise<boolean>;
  extension(): Promise<string[]>;
  loadFile(filePath: string): Promise<iRawFile>;
}

@injectable()
export abstract class typeHandlerBase {
  protected _settings: iAthenaConfiguration;
  constructor(settings: iAthenaConfiguration) {
    this._settings = settings;
  }

  public async buildFileHash(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash(this._settings.Values.fileHashAlgorithm);
    hash.update(fileBuffer);
    return hash.digest('hex');
  }
}
