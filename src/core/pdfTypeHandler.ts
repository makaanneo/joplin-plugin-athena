import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { pdf } from '../pdf/pdf';
import path = require('path');
import { rawFile, iRawFile } from './rawFile';
import { typeHandlerBase, iFileTypeHandler } from './typeHandlerBase';

@injectable()
export class pdfTypeHandler
  extends typeHandlerBase
  implements iFileTypeHandler
{
  private _pdf: pdf;
  private _name = 'pdfTypeHandler';
  private _supported: Array<string> = new Array<string>();
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iPdf) pdfHandler: pdf
  ) {
    super(settings);
    this._supported.push('.pdf');
    this._pdf = pdfHandler;
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
    const support: string[] = [];
    support.push('pdf');
    return support;
  }
  async loadFile(filePath: string): Promise<rawFile> {
    const pdfFullText = await this._pdf.extractPdfText(filePath);
    const metaInformation = await this._pdf.extractPdfMetadata(filePath);
    const file: iRawFile = new rawFile();
    file.Name = path.basename(filePath);
    file.Extension = path.extname(file.Name);
    file.Content = pdfFullText;
    file.Metadata = metaInformation;
    file.FileHash = await this.buildFileHash(filePath);
    file.FullPath = filePath;
    file.Captured = new Date(Date.now());
    return file;
  }
}
