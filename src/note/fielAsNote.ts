import { noteBase } from '../note/note_base';
import { importNoteData } from './importNoteData';
import joplin from 'api';
import fs = require('fs-extra');
import { EOL } from 'os';

class fielAsNote extends noteBase {
  async import(
    file: string,
    noteTitle: string,
    noteFolder: string
  ): Promise<importNoteData> {
    let fileBuffer = null;
    try {
      fileBuffer = fs.readFileSync(file);
    } catch (e) {
      console.error('Error on readFileSync');
      console.error(e);
      return;
    }
    const hash = await super.buildFileHash(file);
    let noteBody = fileBuffer;
    noteBody += EOL;
    noteBody += EOL;
    noteBody += await super.buildHashCommentBlock(hash);
    return {
      JoplinNote: await joplin.data.post(['notes'], null, {
        body: noteBody,
        title: noteTitle,
        parent_id: noteFolder
      }),
      Tags: []
    };
  }
}

export { fielAsNote };
