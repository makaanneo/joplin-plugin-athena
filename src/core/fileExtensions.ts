import 'reflect-metadata';
import joplin from 'api';
import fs = require('fs-extra');
import crypto = require('crypto');
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';

export interface iFileExtensions {
  isDuplicate(hash: string): Promise<boolean>;
  buildFileHash(filePath: string): Promise<string>;
}

@injectable()
export class fileExtensions implements iFileExtensions {
  private _settings: iAthenaConfiguration;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    this._settings = settings;
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
