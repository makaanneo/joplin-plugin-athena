import joplin from 'api';
import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import fs = require('fs-extra');
import crypto = require('crypto');
import { EOL } from 'os';
import type { noteBuilder } from './noteBuilder';
import { importNoteData } from './importNoteData';

abstract class noteBase implements noteBuilder {
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

  abstract import(
    file: string,
    noteTitle: string,
    noteFolder: string
  ): Promise<importNoteData>;

  protected async isDuplicate(hash: string): Promise<boolean> {
    console.info(`search for duplicate of file with hash: ${hash}`);
    const query = await joplin.data.get(['search'], {
      query: hash,
      type: 'note'
    });
    if (
      typeof query === undefined ||
      query == null ||
      (query != null && query.items.length === 0) ||
      typeof query.items[0] === undefined
    ) {
      return false;
    }
    return true;
  }

  protected async buildFileHash(filePath: string): Promise<string> {
    const fileBuffer = fs.readFileSync(filePath);
    const hash = crypto.createHash('sha512');
    hash.update(fileBuffer);
    return hash.digest('hex');
  }

  protected async buildFrontMatter(items: Array<[string, string]>): Promise<string> {
    const startTag = '---';
    const endTag = '---'
    let frontMatterBlock = '';
    frontMatterBlock += startTag;
    items.forEach(element => {
      frontMatterBlock += element[0];
      frontMatterBlock += ' '
      frontMatterBlock += element[1];
    });
    frontMatterBlock += endTag;
    return frontMatterBlock;
  }

  protected async buildHashCommentBlock(hash: string): Promise<string> {
    const startTag = '<!--';
    const endTag = '-->';
    const fileHashStart = 'FILEHASHSTART';
    const fileHashEnd = 'FILEHASHEND';

    let commentBlock = '';

    commentBlock += startTag;
    commentBlock += EOL;
    commentBlock += fileHashStart;
    commentBlock += EOL;
    commentBlock += hash;
    commentBlock += EOL;
    commentBlock += fileHashEnd;
    commentBlock += EOL;
    commentBlock += endTag;
    commentBlock += EOL;
    return commentBlock;
  }
}
export { noteBase };
