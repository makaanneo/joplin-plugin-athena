import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { iFileTypeHandler } from './typeHandlerBase';
import { iRawFile, rawFile } from './rawFile';
import { iFileTypeHandlerFactory } from './fileTypeHandlerFactory';

export interface iFileTypeProcessor {
  loadFile(filePath: string): Promise<iRawFile>;
}

@injectable()
export class fileTypeProcessor implements iFileTypeProcessor {
  private _settings: iAthenaConfiguration;
  private _factory: iFileTypeHandlerFactory;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iFileTypeHandlerFactory) factory: iFileTypeHandlerFactory
  ) {
    this._settings = settings;
    this._factory = factory;
  }
  async loadFile(filePath: string): Promise<iRawFile> {
    console.log('Start Load file');
    const handler: iFileTypeHandler = await this._factory.getTypeHandler(
      filePath
    );
    const file: rawFile = await handler.loadFile(filePath);
    return file;
  }
}
