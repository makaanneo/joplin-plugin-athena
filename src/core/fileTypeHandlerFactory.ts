import 'reflect-metadata';
import { inject, injectable, multiInject } from 'inversify';
import { TYPES } from '../types';
import {iFileTypeHandler} from './typeHandlerBase'
import {iDefaultFileHandler} from './defaultFileHandler'
import { basename, extname } from 'node:path';

export interface iFileTypeHandlerFactory {
  getTypeHandler(filePath: string): Promise<iFileTypeHandler>;
}

@injectable()
export class fileTypeHandlerFactory implements iFileTypeHandlerFactory {
  private _handler: Array<iFileTypeHandler>;
  private _defaultHandler: iDefaultFileHandler;
  constructor(
    @multiInject(TYPES.iFileTypeHandler) handler: iFileTypeHandler[],
    @inject(TYPES.iDefaultFileHandler) defaultHandler: iDefaultFileHandler
  ) {
    this._handler = handler;
    this._defaultHandler = defaultHandler;
  }
  async getTypeHandler(filePath: string): Promise<iFileTypeHandler> {
    const fileName = basename(filePath);
    const fileExt = extname(fileName);
    let result: iFileTypeHandler = this._defaultHandler;
    for (let index = 0; index < this._handler.length; index++) {
      if (await this._handler[index].canHandle(fileExt)) {
        result = this._handler[index];
        break;
      }
    }
    return result;
  }
}
