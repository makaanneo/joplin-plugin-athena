import 'reflect-metadata';
import joplin from 'api';
import { basename } from 'path';
import { injectable } from 'inversify';
import { iPreparedNote } from './iPreparedNote';
import { iJoplinResource, joplinResource } from './joplinResource';
import { iJoplinNotebook } from './JoplinNotebook';

export interface iJoplinNote {
  id: string;
  title: string;
  tags: Array<string>;
  parent_id: string;
  body: string;
  created_time: number;
}

@injectable()
export class joplinNote implements iJoplinNote {
  id: string;
  title: string;
  tags: Array<string>;
  parent_id: string;
  body: string;
  created_time: number;
}

export class joplinTag {
  id: string;
  title: string;
}

export interface iJoplinApiBc {
  getResourcesOfNote(noteId: string): Promise<Array<iJoplinResource>>;
  getNote(noteId: string): Promise<iJoplinNote>;
  postResource(file: string): Promise<iJoplinResource>;
  postNote(note: iPreparedNote): Promise<iJoplinNote>;
  findNoteByHash(hash: string): Promise<Array<iJoplinNote>>;
  findNotebookByName(name: string): Promise<iJoplinNotebook>;
  postNotebook(name: string): Promise<iJoplinNotebook>;
  findTagByName(tag: string): Promise<joplinTag>;
  postTagToNote(noteId: string, tagId: string): Promise<void>;
  postTag(tagName: string): Promise<joplinTag>;
  putNoteBody(noteId: string, noteBody: string): Promise<iJoplinNote>;
}

@injectable()
export class joplinApiBc implements iJoplinApiBc {
  putNoteBody(noteId: string, noteBody: string): Promise<iJoplinNote> {
    console.log('Put note body to Joplin note.');
    try {
      const jNote = joplin.data.put(['notes', noteId], null, {
        body: noteBody
      });
      return jNote;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }
  async getResourcesOfNote(noteId: string): Promise<Array<iJoplinResource>> {
    console.log('get resource of note by id.');
    const result = await joplin.data.get(['notes', noteId, 'resources'], {
      fields: ['id', 'size', 'title', 'filename', 'file_extension', 'mime']
    });
    if (
      typeof result === undefined ||
      result == null ||
      (result != null && result.items.length === 0) ||
      typeof result.items[0] === undefined
    ) {
      return null;
    }
    const jr: Array<iJoplinResource> = result.items.map((resource) => {
      const result: iJoplinResource = new joplinResource();
      result.id = resource.id;
      result.filename = resource.filename;
      result.mime = resource.mime;
      result.file_extension = resource.file_extension;
      result.size = resource.size;
      result.title = resource.titel;
      return result;
    });
    return jr;
  }
  async getNote(noteId: string): Promise<iJoplinNote> {
    console.log('get note by id.');
    const result = await joplin.data.get(['notes', noteId], {
      fields: ['id', 'title', 'body', 'parent_id', 'created_time']
    });
    if (typeof result === undefined || result == null) {
      return null;
    }
    return result;
  }
  async postNotebook(name: string): Promise<iJoplinNotebook> {
    console.log('Post notebook (folder) to Joplin.');
    try {
      const jNotebook = await joplin.data.post(['folders'], null, {
        title: name
      });
      return jNotebook;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }
  async findNoteByHash(hash: string): Promise<Array<iJoplinNote>> {
    console.log('Find note by hash.');
    const result = await joplin.data.get(['search'], {
      query: hash,
      type: 'note'
    });
    if (
      typeof result === undefined ||
      result == null ||
      (result != null && result.items.length === 0) ||
      typeof result.items[0] === undefined
    ) {
      return null;
    }
    return result.items;
  }

  async postNote(note: iPreparedNote): Promise<iJoplinNote> {
    console.log('Post note to Joplin.');
    try {
      const jNote = await joplin.data.post(['notes'], null, {
        body: note.Body,
        title: note.Title,
        parent_id: note.Folder
      });
      return jNote;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }

  async postResource(file: string): Promise<iJoplinResource> {
    console.log('Post Resource to Joplin.');
    try {
      const resource = await joplin.data.post(
        ['resources'],
        null,
        {
          title: basename(file)
        },
        [
          {
            path: file
          }
        ]
      );
      const result: iJoplinResource = new joplinResource();
      result.id = resource.id;
      result.filename = resource.filename;
      result.mime = resource.mime;
      result.file_extension = resource.file_extension;
      result.size = resource.size;
      result.title = resource.titel;
      return result;
    } catch (e) {
      console.error('Error on create resources');
      console.error(e);
      return null;
    }
  }

  async findNotebookByName(name: string): Promise<iJoplinNotebook> {
    if (typeof name === undefined || name == null || name == '') {
      console.log(`Not value for folder title`);
      return null;
    }

    console.info(`Search for folders: ${name}`);

    const query = await joplin.data.get(['search'], {
      type: 'folder',
      query: name
    });

    if (
      typeof query === undefined ||
      query == null ||
      (query != null && query.length === 0) ||
      typeof query.items[0] === undefined
    ) {
      return null;
    }

    if (query.items.length > 1) {
      console.warn(`Retrieved more then one folder for titel: ${query.length}`);
    }
    const folder = query.items[0];
    console.log(`Retrieved folder ${folder.title}`);
    return folder;
  }

  async postTagToNote(noteId: string, tagId: string): Promise<void> {
    console.log(`Tag note with id: ${noteId} with tag with id: ${tagId}`);
    try {
      await joplin.data.post(['tags', tagId, 'notes'], null, {
        id: noteId
      });
    } catch (e) {
      console.error('note tagging error');
      console.error(e);
    }
  }

  async findTagByName(tag: string): Promise<joplinTag> {
    console.log('Find tag by name.');
    const result = await joplin.data.get(['search'], {
      query: tag,
      type: 'tag'
    });
    if (
      typeof result === undefined ||
      result == null ||
      (result != null && result.items.length === 0) ||
      typeof result.items[0] === undefined
    ) {
      return null;
    }
    const jTag = result.items[0];
    return jTag;
  }

  async postTag(tagName: string): Promise<joplinTag> {
    console.log('Post tag to Joplin.');
    try {
      const jTag = await joplin.data.post(['tags'], null, {
        title: tagName
      });
      return jTag;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }
}
