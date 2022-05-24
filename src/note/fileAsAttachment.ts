import { noteBase } from '../note/note_base';
import { importNoteData } from './importNoteData';
import joplin from 'api';
import * as path from 'path';
import { noteImportTemplate } from '../core/noteImportTemplate';
import { pdfImportHandler } from '../mime_type_handler/pdf.import.handler';
import { EOL } from 'os';

class fileAsAttachment extends noteBase {

  public constructor(readonly skipPDFTextBody: boolean) {
    super();
  }

  async import(
    file: string,
    noteTitle: string,
    noteFolder: string
  ): Promise<importNoteData> {
    const fileName = path.basename(file);
    const resource = await this.createResources(file, fileName);
    if (resource.id) {
      const isPdf = resource.mime === 'application/pdf';
      let preparedNote: noteImportTemplate = null;
      if (isPdf) {
        const pdfImport = new pdfImportHandler();
        preparedNote = await pdfImport.importFile(file, noteTitle, resource, this.skipPDFTextBody);
      }

      for (let loop: number = 0; loop <= preparedNote.Tags.length; loop++) {
        console.warn(`Tag in list: ${preparedNote.Tags[loop]}`);
      }
      const hash = await super.buildFileHash(file);
      preparedNote.Body += EOL;
      preparedNote.Body += EOL;
      preparedNote.Body += await super.buildHashCommentBlock(hash);
      return {
        JoplinNote: await joplin.data.post(['notes'], null, {
          body: preparedNote.Body,
          title: preparedNote.Title,
          parent_id: noteFolder
        }),
        Tags: preparedNote.Tags
      };
    }
  }

  private async createResources(file: string, fileName: string): Promise<any> {
    try {
      return await joplin.data.post(
        ['resources'],
        null,
        {
          title: fileName,
          fileName: fileName
        },
        [
          {
            path: file
          }
        ]
      );
    } catch (e) {
      console.error('Error on create resources');
      console.error(e);
      return null;
    }
  }
}

export { fileAsAttachment };
