import * as chokidar from 'chokidar';
import * as filePattern from './core/filePattern';
import * as path from 'path';
import * as helper from './core/helper';
import { getImportSettings } from './settings/settings';
import fs = require('fs-extra');
import { notebookBc } from './notebooks/notebook.bc';
import { fileHandler } from './file_handler/file_handler.bc';
import { fileNameTokenizer } from './file_handler/file_name_tokenizer';
import { fileAsAttachment } from './note/fileAsAttachment';
import { fielAsNote } from './note/fielAsNote';
import { fileExtensions } from './core/fileExtensions';
import type { importNoteData } from './note/importNoteData';
import type { pluginSettings } from './settings/pluginSettings';

class watchAndImport {
  private _pluginSettings: pluginSettings;
  constructor() {
    this.initialize();
  }

  /**
   * initialize the controller component.
   */
  private async initialize() {
    try {
      this._pluginSettings = await getImportSettings();
    } catch (error) {
      console.error(error);
    }
  }

  public async watchDirectory(): Promise<void> {
    const recursiveDepth = this._pluginSettings.importRecursive
      ? this._pluginSettings.importRecursiveDepth
      : 0;

    if (this._pluginSettings.importPath.trim() != '') {
      const importFolderWatcher = chokidar
        .watch(this._pluginSettings.importPath, {
          persistent: true,
          awaitWriteFinish: true,
          depth: recursiveDepth,
          usePolling: false // set true to successfully watch files over a network
        })
        .on('ready', async function () {
          console.log('Newly watched import path:', this.getWatched());
        })
        .on('add', async function (path) {
          console.log('watchAndImport File', path, 'has been added');
          await this.processFile(path);
        });
    }
  }

  public async processFile(file: string): Promise<void> {
    const nbBc = new notebookBc();
    return await this.processFileInternal(file);
  }

  public async processFileInternal(file: string): Promise<void> {
    console.log(`Process file: ${file}`);
    const fileName = path.basename(file);

    console.log(
      `Path from ${
        this._pluginSettings.importPath
      } to ${file} is relative ${path.relative(
        this._pluginSettings.importPath,
        file
      )}`
    );

    const fe = new fileExtensions();
    const fileHash = await fe.buildFileHash(file);
    const duplicated = await fe.isDuplicate(fileHash);
    const ignoreFileUser = await filePattern.match(
      fileName,
      this._pluginSettings.ignoreFiles
    );
    if (ignoreFileUser !== 0) {
      console.info(`SKIP: File: ${file} => Ignored by user ${ignoreFileUser}!`);
      return;
    }
    if (duplicated) {
      console.info(`SKIP: File: ${file} => already imported!`);
      return;
    }
    let nbBc = new notebookBc();
    const importNotebookId = (
      await nbBc.getNotebookByName(this._pluginSettings.importNotebook)
    ).id;

    const fileExt = path.extname(file);
    let data = null;
    const noteTitle = fileName.replace(fileExt, '');

    if (
      this._pluginSettings.extensionsAddAsText
        .toLowerCase()
        .split(/\s*,\s*/)
        .indexOf(fileExt) !== -1
    ) {
      console.info('Import as Text');
      const importer = new fielAsNote();
      data = await importer.import(file, noteTitle, importNotebookId);
    } else {
      console.info('Import as attachment');

      const importer = new fileAsAttachment();
      data = await importer.import(file, noteTitle, importNotebookId);
    }

    const fntokenizer = new fileNameTokenizer();
    const tokens = await fntokenizer.tokenize(file);
    this.tagNote(data, tokens.Tokens);
    let archiveDate = tokens.DateTime;
    if (typeof archiveDate === undefined || archiveDate != null) {
      archiveDate = new Date();
    }
    this.archiveFile(file, fileName, duplicated, archiveDate);
  }

  public async tagNote(note: importNoteData, tokens: Array<string>) {
    let tags: string = this._pluginSettings.importTags;
    if (
      this._pluginSettings.extractTagsFromFile ||
      this._pluginSettings.tagNewFilesAsNew
    ) {
      if (tags != '') {
        tags += ', ';
      }
      //filter for duplicates before join may do later!
      tags += note.Tags.join(', ');
      if (this._pluginSettings.tagNewFilesAsNew) {
        tags += this._pluginSettings.tagNewFilesAsNewWithTag;
      }

      await helper.tagNote(note.JoplinNote.id, tags);
    }
  }

  public async archiveFile(
    file: string,
    fileName: string,
    duplicated: boolean,
    dateTime: Date
  ) {
    const fileHdl = new fileHandler();
    if (this._pluginSettings.archiveImportedFiles) {
      let archiveTarget = '';
      if (duplicated) {
        archiveTarget = this._pluginSettings.archiveImportedFilesTarget;
      } else {
        archiveTarget =
          this._pluginSettings.archiveImportedFilesTarget + '/duplicate';
        fs.mkdirSync(archiveTarget, { recursive: true });
      }
      try {
        await fileHdl.archive_file(file, fileName, archiveTarget, dateTime);
      } catch (e) {
        console.error(e);
        return;
      }
    } else {
      try {
        await fileHdl.clean_up_file(file);
      } catch (e) {
        console.error(e);
        return;
      }
    }
  }
}

export { watchAndImport };
