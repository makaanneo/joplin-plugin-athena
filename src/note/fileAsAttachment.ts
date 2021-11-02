import { noteBase } from '../note/note_base';
import { importNoteData } from './importNoteData';
import joplin from 'api';
import * as fileType from 'file-type';
import * as path from 'path';
import { noteImportTemplate } from '../core/noteImportTemplate';
import { pdfImportHandler } from '../mime_type_handler/pdf.import.handler';

class fileAsAttachment extends noteBase {
  async import(
    file: string,
    noteTitle: string,
    noteFolder: string
  ): Promise<importNoteData> {
    const mimeType = await fileType.fromFile(file);
    const fileName = path.basename(file);
    const resource = await this.createResources(file, noteTitle, fileName);
    if (resource.id) {
      const isPdf = resource.mime === 'application/pdf';
      let preparedNote: noteImportTemplate = null;
      if (isPdf) {
        const pdfImport = new pdfImportHandler();
        preparedNote = await pdfImport.importFile(file, noteTitle, resource);
      }

      for (let loop: number = 0; loop <= preparedNote.Tags.length; loop++) {
        console.warn(`Tag in list: ${preparedNote.Tags[loop]}`);
      }
      const hash = await super.buildFileHash(file);
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

  private async createResources(
    file: string,
    title: string,
    fileName: string
  ): Promise<any> {
    try {
      return await joplin.data.post(
        ['resources'],
        null,
        {
          title: title,
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
