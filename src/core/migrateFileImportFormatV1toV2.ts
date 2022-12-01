import { inject, injectable } from 'inversify';
import { EOL } from 'os';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iOldPDFMetaData as v1PdfMetaData } from './iOldNoteFormat';
import { iPreparedNote } from './iPreparedNote';
import { iJoplinApiBc } from './joplinApiBc';
import { iJoplinFolderProcessor } from './joplinFolderProcessor';
import { iJoplinNoteBuilder } from './joplinNoteBuilder';
import { iRawFile, rawFile } from './rawFile';

export interface iMigrateFileImportFormatV1toV2 {
  migrate(noteToMigrateId: string): Promise<iPreparedNote>;
  loadPDFMETADATATEXT(body: string): Promise<v1PdfMetaData>;
  loadPDFCONTENTTEXT(body: string): Promise<string>;
  loadFILEHASH(body: string): Promise<string>;
  canMigrate(noteBody: string): Promise<boolean>;
}

@injectable()
export class migrateFileImportFormatV1toV2
  implements iMigrateFileImportFormatV1toV2
{
  private _settings: iAthenaConfiguration;
  private _jApi: iJoplinApiBc;
  private _jfp: iJoplinFolderProcessor;
  private _jnb: iJoplinNoteBuilder;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iJoplinApiBc) japi: iJoplinApiBc,
    @inject(TYPES.iJoplinFolderProcessor) jfp: iJoplinFolderProcessor,
    @inject(TYPES.iJoplinNoteBuilder) jnb: iJoplinNoteBuilder
  ) {
    this._settings = settings;
    this._jApi = japi;
    this._jfp = jfp;
    this._jnb = jnb;
  }
  async canMigrate(noteBody: string): Promise<boolean> {
    const startToken = 'PDFMETADATATEXTSTART';
    const canMigrate = noteBody.includes(startToken);
    return canMigrate;
  }
  async loadPDFMETADATATEXT(body: string): Promise<v1PdfMetaData> {
    const startToken = 'PDFMETADATATEXTSTART';
    const endToken = 'PDFMETADATATEXTEND';
    let indexOfFILEHASHSTART = body.indexOf(startToken);
    let indexOfFILEHASHEND = body.indexOf(endToken);
    let result = '';
    let offset = 0;
    // seek for meta data block
    while (result === '' && indexOfFILEHASHEND !== -1) {
      result = body
        .substring(indexOfFILEHASHSTART, indexOfFILEHASHEND)
        .replace(startToken, '')
        .replace(endToken, '');
      if (result !== '') {
        break;
      }
      offset = indexOfFILEHASHEND + endToken.length;
      indexOfFILEHASHSTART = body.indexOf(startToken, offset);
      indexOfFILEHASHEND = body.indexOf(endToken, offset);
    }

    //build meta data object
    const char = '\n';
    let i = 0;
    let j = 0;

    const linesOfMetaData = new Array<string>();
    while ((j = result.indexOf(char, i)) !== -1) {
      linesOfMetaData.push(result.substring(i, j));
      i = j + 1;
    }

    let title = '';
    let subject = '';
    let author = '';
    let creationDate = '';
    let keywords = '';

    linesOfMetaData.forEach(function (value) {
      if (value.includes('Title:')) {
        title = value
          .substring(value.indexOf(':') + 1)
          .replace(EOL, '')
          .trim();
      }
      if (value.includes('Subject:')) {
        subject = value
          .substring(value.indexOf(':') + 1)
          .replace(EOL, '')
          .trim();
      }
      if (value.includes('Author:')) {
        author = value
          .substring(value.indexOf(':') + 1)
          .replace(EOL, '')
          .trim();
      }
      if (value.includes('CreationDate:')) {
        creationDate = value
          .substring(value.indexOf(':') + 1)
          .replace(EOL, '')
          .trim();
      }
      if (value.includes('Keywords:')) {
        keywords = value
          .substring(value.indexOf(':') + 1)
          .replace(EOL, '')
          .trim();
      }
    });

    return {
      Author: author,
      CreationDate: creationDate !== '' ? new Date(creationDate) : null,
      Keywords: keywords,
      Subject: subject,
      Title: title
    };
  }

  async loadPDFCONTENTTEXT(body: string): Promise<string> {
    const startToken = 'PDFCONTENTTEXTSTART';
    const endToken = 'PDFCONTENTTEXTEND';
    let indexOfFILEHASHSTART = body.indexOf(startToken);
    let indexOfFILEHASHEND = body.indexOf(endToken);
    let result = '';
    let offset = 0;
    while (result === '' && indexOfFILEHASHEND !== -1) {
      result = body
        .substring(indexOfFILEHASHSTART, indexOfFILEHASHEND)
        .replace(startToken, '')
        .replace(endToken, '');
      if (result !== '') {
        break;
      }
      offset = indexOfFILEHASHEND + endToken.length;
      indexOfFILEHASHSTART = body.indexOf(startToken, offset);
      indexOfFILEHASHEND = body.indexOf(endToken, offset);
    }
    return result;
  }
  async loadFILEHASH(body: string): Promise<string> {
    const startToken = 'FILEHASHSTART';
    const endToken = 'FILEHASHEND';
    let indexOfFILEHASHSTART = body.indexOf(startToken);
    let indexOfFILEHASHEND = body.indexOf(endToken);
    let result = '';
    let offset = 0;
    while (result === '' && indexOfFILEHASHEND !== -1) {
      result = body
        .substring(indexOfFILEHASHSTART, indexOfFILEHASHEND)
        .replace(startToken, '')
        .replace(endToken, '')
        .replace(EOL, '')
        .replace('\n', '');
      if (result !== '') {
        result = result.replace('\n', '');
        break;
      }
      offset = indexOfFILEHASHEND + endToken.length;
      indexOfFILEHASHSTART = body.indexOf(startToken, offset);
      indexOfFILEHASHEND = body.indexOf(endToken, offset);
    }
    return result;
  }
  async migrate(noteToMigrateId: string): Promise<iPreparedNote> {
    try {
      console.log(noteToMigrateId);
      const existingNote = await this._jApi.getNote(noteToMigrateId);
      console.log(existingNote);
      if (!this.canMigrate(existingNote.body)) {
        console.log(
          `Note ${existingNote.title} is not compatible for migration.`
        );
        return null;
      }
      if (existingNote.body.startsWith('---')) {
        console.log(
          `Note ${existingNote.title} is already migreated to frontmatter format.`
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
      const jResource = resources[0];
      const metaData = await this.loadPDFMETADATATEXT(existingNote.body);
      const loadedFile: iRawFile = new rawFile();
      loadedFile.Content = await this.loadPDFCONTENTTEXT(existingNote.body);
      loadedFile.Captured = new Date(existingNote.created_time);
      loadedFile.Extension = jResource.file_extension;
      loadedFile.FileHash = await this.loadFILEHASH(existingNote.body);
      loadedFile.FullPath = '';
      loadedFile.Metadata = {
        Author: metaData.Author,
        Title: metaData.Title,
        Subject: metaData.Subject,
        Keywords: metaData.Keywords.split(', '),
        CreationDate: metaData.CreationDate,
        ModificationDate: metaData.CreationDate
      };
      loadedFile.Name = existingNote.title;
      const prepared = await this._jnb.buildNote(loadedFile, jResource);
      const migrated = await this._jApi.putNoteBody(
        existingNote.id,
        prepared.Body
      );
      if (migrated === null) {
        return null;
      }
      return prepared;
    } catch (e) {
      console.error('Error on migrate from v1 to v2 of file note!');
      console.error(e);
      throw e;
    }
  }
}
