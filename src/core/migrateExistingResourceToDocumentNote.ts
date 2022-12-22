import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iJoplinApiBc } from './joplinApiBc';
import { iJoplinFolderProcessor } from './joplinFolderProcessor';
import { iJoplinNoteBuilder } from './joplinNoteBuilder';
import crypto = require('crypto');
import fs = require('fs-extra');
import path = require('path');
import { iFileTypeProcessor } from './fileTypeProcessor';

export interface iMigrateExistingResourceToDocumentNote {
  documentParseBasePath: string;
  migrate(noteToMigrateId: string, overrideBody: boolean): Promise<void>;
  canMigrate(noteBody: string): Promise<boolean>;
  createTempDirectory(uuid: string): Promise<string>;
  constructTempPathName(uuid: string): Promise<string>;
  downloadResourceToTempDirectory(
    noteId: string,
    resourceId: string
  ): Promise<string>;
}

@injectable()
export class migrateExistingResourceToDocumentNote
  implements iMigrateExistingResourceToDocumentNote
{
  private _settings: iAthenaConfiguration;
  private _jApi: iJoplinApiBc;
  private _jfp: iJoplinFolderProcessor;
  private _jnb: iJoplinNoteBuilder;
  private _ftp: iFileTypeProcessor;
  documentParseBasePath = 'migrateToDocumentNote';
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iJoplinApiBc) japi: iJoplinApiBc,
    @inject(TYPES.iJoplinFolderProcessor) jfp: iJoplinFolderProcessor,
    @inject(TYPES.iFileTypeProcessor) ftp: iFileTypeProcessor,
    @inject(TYPES.iJoplinNoteBuilder) jnb: iJoplinNoteBuilder
  ) {
    this._settings = settings;
    this._ftp = ftp;
    this._jApi = japi;
    this._jfp = jfp;
    this._jnb = jnb;
  }

  async canMigrate(noteBody: string): Promise<boolean> {
    return true;
  }

  async constructTempPathName(uuid: string): Promise<string> {
    return path.join(
      this._settings.Values.pluginDataDir,
      this.documentParseBasePath,
      uuid
    );
  }

  async createTempDirectory(tempPath: string): Promise<string> {
    fs.mkdirSync(tempPath, { recursive: true });
    return tempPath;
  }

  async cleanTempFolder(tempFolder: string): Promise<void> {
    if (fs.existsSync(tempFolder)) {
      fs.rmSync(tempFolder, {
        recursive: true,
        maxRetries: 10,
        retryDelay: 10
      });
    }
  }

  async downloadResourceToTempDirectory(
    tempPath: string,
    resourceId: string
  ): Promise<string> {
    const resource = await this._jApi.getResourceById(resourceId);
    const attachment = await this._jApi.getAttachmentById(resourceId);
    let fileName = resource.title;
    if (typeof fileName === undefined || fileName == null) {
      fileName = `${resource.id}.${resource.file_extension}`;
    }
    const target = path.join(tempPath, fileName);
    fs.writeFileSync(target, attachment.body);
    return target;
  }

  async migrate(noteToMigrateId: string, overrideBody: boolean): Promise<void> {
    const uuid = crypto.randomUUID();
    const tempPath = await this.constructTempPathName(uuid);
    try {
      const existingNote = await this._jApi.getNote(noteToMigrateId);
      console.info('note');
      console.info(existingNote);
      if (!this.canMigrate(existingNote.body)) {
        console.log(
          `Note ${existingNote.title} is not compatible for migration.`
        );

        return null;
      }

      const resources = await this._jApi.getResourcesOfNote(noteToMigrateId);
      if (resources === null) {
        console.log(
          `Note ${existingNote.title} has no resource and will be skipped.`
        );
        return null;
      }

      await this.cleanTempFolder(tempPath);
      await this.createTempDirectory(tempPath);
      let documentNoteBody = `# ${this._settings.Values.documentsSectionHeader}`;
      for (let loop = 0; loop < resources.length; loop++) {
        let fileName = resources[loop].title;
        if (typeof fileName === undefined || fileName == null) {
          fileName = resources[loop].id;
        }
        console.info(
          `Download resource ${fileName} to temp location: ${tempPath}`
        );
        const tempFile = await this.downloadResourceToTempDirectory(
          tempPath,
          resources[loop].id
        );
        const lodedFile = await this._ftp.loadFile(tempFile);
        const prepared = await this._jnb.buildNote(
          lodedFile,
          resources[loop],
          2,
          false
        );
        documentNoteBody += '\n\n';
        documentNoteBody += prepared.Body;
      }
      if (documentNoteBody !== '') {
        let updateBody = '';
        if (overrideBody) {
          updateBody = documentNoteBody;
        } else {
          updateBody = `${existingNote.body}\n\n${documentNoteBody}`;
        }
        await this._jApi.putNoteBody(existingNote.id, updateBody);
      }
    } catch (e) {
      console.error('Error on import resource to note');
      console.error(e);
      throw e;
    } finally {
      this.cleanTempFolder(tempPath);
    }
  }
}
