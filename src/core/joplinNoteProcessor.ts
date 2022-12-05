import 'reflect-metadata';
import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iJoplinNoteBuilder } from './joplinNoteBuilder';
import { iJoplinApiBc } from './joplinApiBc';
import { iArchiveFile } from './archiveFile';
import { iJoplinTagProcessor } from './joplinTagProcessor';
import { iFileTypeProcessor } from './fileTypeProcessor';

export interface iJoplinNoteProcessor {
  buildNoteFromFile(file: string): Promise<void>;
}

@injectable()
export class joplinNoteProcessor implements iJoplinNoteProcessor {
  private _settings: iAthenaConfiguration;
  private _ftp: iFileTypeProcessor;
  private _nb: iJoplinNoteBuilder;
  private _jdapi: iJoplinApiBc;
  private _af: iArchiveFile;
  private _jtp: iJoplinTagProcessor;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iFileTypeProcessor) ftp: iFileTypeProcessor,
    @inject(TYPES.iJoplinNoteBuilder) nb: iJoplinNoteBuilder,
    @inject(TYPES.iJoplinApiBc) jdapi: iJoplinApiBc,
    @inject(TYPES.iArchiveFile) af: iArchiveFile,
    @inject(TYPES.iJoplinTagProcessor) jTp: iJoplinTagProcessor
  ) {
    this._settings = settings;
    this._ftp = ftp;
    this._nb = nb;
    this._jdapi = jdapi;
    this._af = af;
    this._jtp = jTp;
  }

  public async buildNoteFromFile(file: string): Promise<void> {
    console.log(
      `START: import file: ${file} from folder ${this._settings.Values.importPath}.`
    );
    try {
      const lodedFile = await this._ftp.loadFile(file);
      const isDuplicate = await this._jdapi.findNoteByHash(lodedFile.FileHash);
      if (isDuplicate && !this._settings.Values.importDuplicateFiles) {
        console.log('Skip duplicated file.');
        return;
      }
      const jRes = await this._jdapi.postResource(file);
      const preparedNote = await this._nb.buildNote(lodedFile, jRes);
      const jNote = await this._jdapi.postNote(preparedNote);

      if (this._settings.Values.tagNewFiles) {
        console.log('Tag imported files with pre defined tags.');
        const jTags = await this._jtp.buildTags(jNote);
      }

      if (this._settings.Values.archiveImportedFiles) {
        const targetPath = await this._af.archive(lodedFile);
        console.log(`File archived in path: ${targetPath}.`);
      } else {
        await this._af.cleanUp(lodedFile);
      }
      console.log(
        `END: import file: ${file} from folder ${this._settings.Values.importPath}.`
      );
    } catch (e) {
      console.error(
        `ERROR: import file: ${file} from folder ${this._settings.Values.importPath} failed due to error ${e}.`
      );
    }
  }
}
