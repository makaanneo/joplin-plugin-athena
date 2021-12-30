import * as chokidar from 'chokidar';
import * as filePattern from './core/filePattern';
import * as path from 'path';
import * as helper from './core/helper';
import * as settings from './settings/settings';
import fs = require('fs-extra');
import { notebookBc } from './notebooks/notebook.bc';
import { fileHandler } from './file_handler/file_handler.bc';
import { fileNameTokenizer } from './file_handler/file_name_tokenizer';
import { fileAsAttachment } from './note/fileAsAttachment';
import { fielAsNote } from './note/fielAsNote';
import { fileExtensions } from './core/fileExtensions';
import type { importNoteData } from './note/importNoteData';
import type { pluginSettings } from './settings/pluginSettings';

let watcher: Array<any> = [];

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
      this._pluginSettings = await settings.getImportSettings();
    } catch (error) {
      console.error(error);
    }
  }

  public async watchDirectory(): Promise<void> {
    console.log(`start watch of ${this._pluginSettings.importPath}`);
    const recursiveDepth = this._pluginSettings.importRecursive
      ? this._pluginSettings.importRecursiveDepth
      : 0;
    if (this._pluginSettings.importPath.trim() !== '') {
      const ownObject = this;
      if (watcher.length > 0) {
        watcher.forEach(async (element) => {
          console.log(`End watching directory: ${element}`);
          await element.close();
        });
        watcher = [];
      }
      let chokidarWatcher = null;
      try {
        chokidarWatcher = chokidar
          .watch(this._pluginSettings.importPath, {
            persistent: true,
            awaitWriteFinish: true,
            depth: recursiveDepth,
            usePolling: false // set true to successfully watch files over a network
          })
          .on('ready', async function () {
            console.log('Newly watched import path:', this.getWatched());
          })
          .on('add', async function on(path) {
            console.log('watchAndImport File', path, 'has been added');
            await ownObject.processFile(path);
          });
      } catch (error) {
        console.error(error);
      }
      watcher.push(chokidarWatcher);
    }
  }

  public async processFile(file: string): Promise<void> {
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

    const fntokenizer = new fileNameTokenizer();
    const tokens = await fntokenizer.tokenize(file);
    let noteDate = tokens.DateTime;
    if (typeof noteDate === undefined || noteDate != null) {
      noteDate = new Date();
    }
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
    this.tagNote(data, tokens.Tokens);

    this.archiveFile(file, fileName, duplicated, noteDate);
  }

  public async tagNote(note: importNoteData, tokens: Array<string>) {
    let tags: Array<string> = [];
    if (
      this._pluginSettings.extractTagsFromFile ||
      this._pluginSettings.tagNewFilesAsNew
    ) {
      if (this._pluginSettings.importTags !== '') {
        tags.push(this._pluginSettings.importTags);
      }
      tags = [...new Set(note.Tags), ...note.Tags];
      if (this._pluginSettings.tagNewFilesAsNew) {
        tags.push(this._pluginSettings.tagNewFilesAsNewWithTag);
      }
      if (tokens.length > 0) {
        tags = [...new Set(tags), ...new Set(tokens)];
      }
      console.log(`Tags to apply: ${tags}`);
      await helper.tagNote(note.JoplinNote.id, tags.join(', '));
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
      if (!duplicated) {
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
