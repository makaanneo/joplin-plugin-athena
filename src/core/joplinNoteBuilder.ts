import { inject, injectable } from 'inversify';
import { EOL } from 'os';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iRawFile } from './rawFile';
import { joplinResource as jResource } from './joplinResource';
import { stringify } from 'yaml';
import { iPreparedNote, preparedNote } from './iPreparedNote';
import { documentFrontMatter } from './documentFrontMatter';
import { iJoplinApiBc } from './joplinApiBc';
import { iJoplinFolderProcessor } from './joplinFolderProcessor';

export interface iJoplinNoteBuilder {
  buildNote(loadedFile: iRawFile, resource: jResource): Promise<iPreparedNote>;
}

@injectable()
export class joplinNoteBuilder implements iJoplinNoteBuilder {
  private _settings: iAthenaConfiguration;
  private _jApi: iJoplinApiBc;
  private _jfp: iJoplinFolderProcessor;
  constructor(
    @inject(TYPES.iAthenaConfiguration) settings: iAthenaConfiguration,
    @inject(TYPES.iJoplinApiBc) japi: iJoplinApiBc,
    @inject(TYPES.iJoplinFolderProcessor) jfp: iJoplinFolderProcessor
  ) {
    this._settings = settings;
    this._jApi = japi;
    this._jfp = jfp;
  }
  async mapFileToPreparedNote(
    file: iRawFile,
    jResource: jResource
  ): Promise<documentFrontMatter> {
    return {
      Name: (await file.fileNameWithoutExtension(file.Name)).trim(),
      Author: (file.Metadata.Author ?? '').trim(),
      Content: file.Content,
      Sender: '',
      Captured: file.Captured,
      Created: file.Metadata?.CreationDate ?? null,
      FileHash: {
        Algorithm: this._settings.Values.fileHashAlgorithm,
        Hash: file.FileHash
      },
      Metadata: null, // map from to
      Modified: file.Metadata?.ModificationDate ?? null,
      Recipient: '',
      ResourceLing: await jResource.buildResourceLink(
        jResource.Title,
        jResource.Id,
        jResource.Mime
      )
    };
  }

  async prepareFrontMatterText(
    frontMatter: documentFrontMatter
  ): Promise<string> {
    const yaml_string = stringify(frontMatter);

    let result: string = '';
    result += '---';
    result += EOL;
    result += yaml_string;
    result += EOL;
    result += '---';

    return result;
  }

  async prepareNoteBody(
    frontMatterText: string,
    resourceTitle: string,
    resourceLink: string
  ): Promise<string> {
    let bodyText: string = '';

    bodyText += frontMatterText;
    bodyText += EOL;
    bodyText += resourceTitle;
    bodyText += EOL;
    bodyText += resourceLink;
    bodyText += EOL;
    return bodyText;
  }

  async buildNote(
    loadedFile: iRawFile,
    resource: jResource
  ): Promise<iPreparedNote> {
    console.log('START build note.');
    const frontMatter = await this.mapFileToPreparedNote(loadedFile, resource);
    const frontMatterText = await this.prepareFrontMatterText(frontMatter);
    const resourceTitleBlock = await resource.buildResourceTitle(
      loadedFile.Name
    );
    const resourceLink = await resource.buildResourceLink(
      loadedFile.Name,
      resource.Id,
      resource.Mime
    );
    const note = new preparedNote();
    note.Body = await this.prepareNoteBody(
      frontMatterText,
      resourceTitleBlock,
      resourceLink
    );
    note.Title = frontMatter.Name;
    note.Tags = new Array<string>();
    note.Folder = (
      await this._jfp.getImportFolderId(this._settings.Values.importNotebook)
    ).id;
    return note;
  }
}
