import * as path from 'path';
import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';

export interface fileNameTokens {
  DateTime: Date;
  Tokens: Array<string>;
}

export interface iFileNameTokenizer {
  tokenize(filename: string): Promise<fileNameTokens>;
  getDatetimeFromFileNameIfPresent(fileName: string): Promise<string>;
}

@injectable()
export class fileNameTokenizer {
  private _settings: iAthenaConfiguration;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    this._settings = settings;
  }

  private dateTimeRegEx =
    /^([\+-]?\d{4}(?!\d{2}\b))((-?)((0[1-9]|1[0-2])(\3([12]\d|0[1-9]|3[01]))?|W([0-4]\d|5[0-2])(-?[1-7])?|(00[1-9]|0[1-9]\d|[12]\d{2}|3([0-5]\d|6[1-6])))([T\s]((([01]\d|2[0-3])((:?)[0-5]\d)?|24\:?00)([\.,]\d+(?!:))?)?(\17[0-5]\d([\.,]\d+)?)?([zZ]|([\+-])([01]\d|2[0-3]):?([0-5]\d)?)?)?)?/;
  private tokenRegEx: RegExp = /[a-zA-Z]+[0-9]*[^\W_]/g;

  public async tokenize(filename: string): Promise<fileNameTokens> {
    const extractedDateTime = await this.getDatetimeFromFileNameIfPresent(
      path.basename(filename)
    );
    const result: fileNameTokens = { DateTime: null, Tokens: null };
    let cleanName = filename;
    const baseName = path.basename(filename);
    const extension = path.extname(baseName);
    const clean = baseName.replace(extension, '');
    cleanName = clean;
    if (
      typeof extractedDateTime !== undefined &&
      extractedDateTime !== null &&
      extractedDateTime !== ''
    ) {
      cleanName = cleanName.replace(extractedDateTime, '').trim();
      if (!isNaN(Date.parse(extractedDateTime))) {
        result.DateTime = new Date(extractedDateTime);
      }
    }
    if (result.DateTime === null) {
      result.DateTime = new Date(Date.now());
    }
    console.log(`datetime: ${result.DateTime}`);
    let tokens = cleanName.match(this.tokenRegEx);
    result.Tokens = tokens;
    return result;
  }

  public async getDatetimeFromFileNameIfPresent(
    fileName: string
  ): Promise<string> {
    console.info(`Match for datetime on filename: ${fileName}`);
    let useDates = fileName.match(this.dateTimeRegEx);
    if (
      (typeof useDates !== undefined && useDates == null) ||
      useDates.length == 0
    ) {
      console.info(`No suitable datetime in filename: ${fileName} match`);
      return '';
    }
    console.info(
      `Found datetime: ${useDates[0]} in filename: ${fileName} match`
    );

    return useDates[0];
  }

  public async getFileNameTokens(): Promise<fileNameTokens> {
    return null;
  }
}
