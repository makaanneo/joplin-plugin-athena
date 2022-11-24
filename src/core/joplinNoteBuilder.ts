import { inject, injectable } from 'inversify';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iRawFile } from './rawFile';
import { stringify } from 'yaml';
import { iPreparedNote, preparedNote } from './iPreparedNote';
import { documentFrontMatter } from './documentFrontMatter';
import { iJoplinApiBc } from './joplinApiBc';
import { iJoplinFolderProcessor } from './joplinFolderProcessor';
import { iJoplinResource } from './joplinResource';

export interface iJoplinNoteBuilder {
  buildNote(
    loadedFile: iRawFile,
    resource: iJoplinResource
  ): Promise<iPreparedNote>;
  mapFileToPreparedNote(
    file: iRawFile,
    resource: iJoplinResource
  ): Promise<documentFrontMatter>;
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
    resource: iJoplinResource
  ): Promise<documentFrontMatter> {
    const resourceLink = await resource.buildResourceLink(
      resource.title,
      resource.id,
      resource.mime
    );
    return {
      Name: (await file.fileNameWithoutExtension(file.Name)).trim(),
      Author: (file.Metadata.Author ?? '').trim(),
      Content: ` \n ${file.Content}\n`,
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
      ResourceLink: resourceLink
    };
  }

  async prepareMetadataBlock(
    frontMatter: documentFrontMatter
  ): Promise<string> {
    const yaml_string = stringify(frontMatter);

    let result = '';
    result += '``` yaml document header';
    result += '\n';
    result += yaml_string;
    result += '\n';
    result += '```';

    return result;
  }

  async prepareNoteBody(
    metadataBlockText: string,
    resourceTitle: string,
    resourceLink: string
  ): Promise<string> {
    let bodyText = '';

    bodyText += resourceTitle;
    bodyText += '\n';
    bodyText += resourceLink;
    bodyText += '\n';
    bodyText += '\n';
    bodyText += '# metadata';
    bodyText += '\n';
    bodyText += metadataBlockText;
    bodyText += '\n';

    return bodyText;
  }

  async buildNote(
    loadedFile: iRawFile,
    resource: iJoplinResource
  ): Promise<iPreparedNote> {
    console.log('START build note.');
    const metaData = await this.mapFileToPreparedNote(loadedFile, resource);
    const metaDataText = await this.prepareMetadataBlock(metaData);
    const resourceTitleBlock = await resource.buildResourceTitle(
      loadedFile.Name
    );
    const resourceLink = await resource.buildResourceLink(
      loadedFile.Name,
      resource.id,
      resource.mime
    );
    const note = new preparedNote();
    note.Body = await this.prepareNoteBody(
      metaDataText,
      resourceTitleBlock,
      resourceLink
    );
    note.Title = metaData.Name;
    note.Tags = new Array<string>();
    note.Folder = (
      await this._jfp.getImportFolderId(this._settings.Values.importNotebook)
    ).id;
    return note;
  }
}
