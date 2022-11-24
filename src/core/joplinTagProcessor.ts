import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iJoplinApiBc, joplinNote, joplinTag } from './joplinApiBc';

export interface iJoplinTagProcessor {
  buildTags(jNote: joplinNote): Promise<Array<joplinTag>>;
}

@injectable()
export class joplinTagProcessor implements iJoplinTagProcessor {
  private _settings: iAthenaConfiguration;
  private _jApi: iJoplinApiBc;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iJoplinApiBc) japi: iJoplinApiBc
  ) {
    this._settings = settings;
    this._jApi = japi;
  }

  async buildTags(jNote: joplinNote): Promise<Array<joplinTag>> {
    const tags = await this.buildTagsFromSettings();
    const result: Array<joplinTag> = new Array<joplinTag>();
    for (let index = 0; index < tags.length; index++) {
      const tag = await this._jApi.findTagByName(tags[index]);
      if (tag !== null) {
        console.log(`Retrieved tag: ${tag.id} and title: ${tag.title}`);
      }
      if (tag === null || tag === undefined) {
        const newTag = await this._jApi.postTag(tags[index]);
        result.push(newTag);
        console.log(`Add new tag: ${newTag.id} and title: ${newTag.title}`);
      } else {
        result.push(tag);
        console.log(`Add existig tag: ${tag.id} and title: ${tag.title}`);
      }
    }
    for (let index = 0; index < result.length; index++) {
      const tagId = result[index].id;
      console.log(`Tag note with id: ${jNote.id} with tag with id: ${tagId}`);
      await this._jApi.postTagToNote(jNote.id, tagId);
    }

    return result;
  }

  async buildTagsFromSettings(): Promise<Array<string>> {
    this._settings.initilize();
    const tagsFromSettings = this._settings.Values.tagNewFilesTags;
    console.log(`Tags from settings: ${tagsFromSettings}`);
    const result = tagsFromSettings.split(/\s*,\s*/);
    return result;
  }
}
