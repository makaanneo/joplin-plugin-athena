import path = require('path');
import { metaData } from './fileMetaData';

export interface iRawFile {
  Name: string;
  Extension: string;
  Metadata: metaData;
  Content: string;
  FileHash: string;
  FullPath: string;
  Captured: Date;
  fileNameWithoutExtension(fullFileName: string): Promise<string>;
}

export class rawFile implements iRawFile {
  Name: string;
  Extension: string;
  Metadata: metaData;
  private _content = '';
  get Content(): string {
    return this._content;
  }
  set Content(value: string) {
    this._content = value.replaceAll('\r', '');
  }
  FileHash: string;
  FullPath: string;
  Captured: Date;

  async fileNameWithoutExtension(fullFileName: string): Promise<string> {
    const fileName = path.basename(fullFileName);
    const fileExt = path.extname(fullFileName);
    const withOutExtension = fileName.replaceAll(fileExt, '');
    return withOutExtension;
  }
}
