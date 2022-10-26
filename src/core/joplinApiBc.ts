import 'reflect-metadata';
import joplin from 'api';
import { injectable } from 'inversify';
import path = require('path');
import { iPreparedNote } from './iPreparedNote';
import { joplinResource } from './joplinResource';
import { JoplinNotebook } from './JoplinNotebook';

export class joplinNote {
  Id: string;
  Title: string;
  Tags: Array<string>;
  parent_id: string;
  body: string;
}

export class joplinTag {
  Id: string;
  Title: string;
}

export interface iJoplinApiBc {
  postResource(file: string): Promise<joplinResource>;
  postNote(note: iPreparedNote): Promise<joplinNote>;
  findByHash(hash: string): Promise<Array<joplinNote>>;
  findNotebookByName(name: string): Promise<JoplinNotebook>;
  postNotebook(name: string): Promise<JoplinNotebook>;
  findTagByName(tag: string): Promise<joplinTag>;
  postTagToNote(noteId: string, tagId: string): Promise<void>;
  postTag(tagName: string): Promise<joplinTag>;
}

@injectable()
export class joplinApiBc implements iJoplinApiBc {
  async postNotebook(name: string): Promise<JoplinNotebook> {
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
  async findByHash(hash: string): Promise<Array<joplinNote>> {
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

  async postNote(note: iPreparedNote): Promise<joplinNote> {
    console.log('Post note to Joplin.');
    try {
      const jNote = await joplin.data.post(['notes'], null, {
        body: note.Body,
        title: note.Title,
        parent_id: note.Folder
      });
      const result: joplinNote = new joplinNote();
      result.Id = jNote.id;
      result.Title = jNote.title;
      result.parent_id = jNote.parent_id;
      result.body = jNote.body;
      return result;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }

  async postResource(file: string): Promise<joplinResource> {
    console.log('Post Resource to Joplin.');
    try {
      const resource = await joplin.data.post(
        ['resources'],
        null,
        {
          title: path.basename(file)
        },
        [
          {
            path: file
          }
        ]
      );
      const result: joplinResource = new joplinResource();
      result.Id = resource.id;
      result.Title = resource.title;
      result.Mime = resource.mime;
      return result;
    } catch (e) {
      console.error('Error on create resources');
      console.error(e);
      return null;
    }
  }

  async findNotebookByName(name: string): Promise<JoplinNotebook> {
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
    const retrieved: joplinTag = new joplinTag();
    retrieved.Id = jTag.id;
    retrieved.Title = jTag.title;
    return retrieved;
  }

  async postTag(tagName: string): Promise<joplinTag> {
    console.log('Post tag to Joplin.');
    try {
      const jTag = await joplin.data.post(['tags'], null, {
        title: tagName
      });
      const result: joplinTag = new joplinTag();
      result.Id = jTag.id;
      result.Title = jTag.title;
      return result;
    } catch (e) {
      console.error('Error on create note');
      console.error(e);
      return null;
    }
  }
}
