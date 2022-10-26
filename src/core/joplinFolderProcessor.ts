import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iJoplinApiBc } from './joplinApiBc';
import { JoplinNotebook } from './JoplinNotebook';

export interface iJoplinFolderProcessor {
  getImportFolderId(folderName: string): Promise<JoplinNotebook>;
  findFolder(folderName: string): Promise<JoplinNotebook>;
  createFolder(folderName: string): Promise<JoplinNotebook>;
}

@injectable()
export class joplinFolderProcessor implements iJoplinFolderProcessor {
  private _japi: iJoplinApiBc;
  private _settings: iAthenaConfiguration;
  constructor(
    @inject(TYPES.iJoplinApiBc) japi: iJoplinApiBc,
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration
  ) {
    this._japi = japi;
    this._settings = settings;
  }
  async findFolder(folderName: string): Promise<JoplinNotebook> {
    return await this._japi.findNotebookByName(
      this._settings.Values.importNotebook
    );
  }
  async getImportFolderId(folderName: string): Promise<JoplinNotebook> {
    let folder = await this.findFolder(folderName);
    if (folder !== undefined && folder !== null) {
      return folder;
    }
    folder = await this.createFolder(folderName);
  }
  async createFolder(folderName: string): Promise<JoplinNotebook> {
    return await this._japi.postNotebook(this._settings.Values.importNotebook);
  }
}
