import 'reflect-metadata';
import {
  describe,
  expect,
  beforeEach,
  afterEach,
  jest,
  it
} from '@jest/globals';
import fs = require('fs-extra');
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { pluginSettings } from '../common';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { iMigrateFileImportFormatV1toV2 } from '../core/migrateFileImportFormatV1toV2';
import {
  iJoplinApiBc,
  iJoplinNote,
  joplinNote,
  joplinTag
} from '../core/joplinApiBc';
import { iPreparedNote } from '../core/iPreparedNote';
import { iJoplinResource, joplinResource } from '../core/joplinResource';
import { inject, injectable } from 'inversify';
import { iJoplinNotebook, joplinNotebook } from '../core/JoplinNotebook';
import { iJoplinAttachment } from 'src/core/joplinAttachment';

const testNote2: iJoplinNote = new joplinNote();
testNote2.id = 'id';
testNote2.title = 'prepared_title';
testNote2.created_time = 1658929497229;
testNote2.body =
  '[2022-06-11-1639-a-file](:/someresourceid)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
@injectable()
class joplinApiBcMock implements iJoplinApiBc {
  private _resource: iJoplinResource;
  private _notebook: iJoplinNotebook;
  constructor(
    @inject(TYPES.iJoplinResource) resource: iJoplinResource,
    @inject(TYPES.iJoplinNotebook) notebook: iJoplinNotebook
  ) {
    this._resource = resource;
    this._notebook = notebook;
  }
  getResourceById(resourceId: string): Promise<iJoplinResource> {
    throw new Error('Method not implemented.');
  }
  async getAttachmentById(resourceId: string): Promise<iJoplinAttachment> {
    throw new Error('Method not implemented.');
  }
  async getResourcesOfNote(noteId: string): Promise<joplinResource[]> {
    const result: joplinResource[] = [];
    result.push(this._resource);
    return result;
  }
  async getNote(noteId: string): Promise<joplinNote> {
    const testNote: iJoplinNote = new joplinNote();
    testNote.id = 'id';
    testNote.title = 'title';
    testNote.created_time = 1658929497229;
    testNote.body =
      '[2022-06-11-1639-a-file](:/someresourceid)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    return testNote;
  }
  async postResource(file: string): Promise<joplinResource> {
    throw new Error('Method not implemented.');
  }
  async postNote(note: iPreparedNote): Promise<joplinNote> {
    throw new Error('Method not implemented.');
  }
  async findNoteByHash(hash: string): Promise<joplinNote[]> {
    throw new Error('Method not implemented.');
  }
  async findNotebookByName(name: string): Promise<iJoplinNotebook> {
    return this._notebook;
  }
  async postNotebook(name: string): Promise<iJoplinNotebook> {
    throw new Error('Method not implemented.');
  }
  async findTagByName(tag: string): Promise<joplinTag> {
    throw new Error('Method not implemented.');
  }
  async postTagToNote(noteId: string, tagId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async postTag(tagName: string): Promise<joplinTag> {
    throw new Error('Method not implemented.');
  }
  async putNoteBody(noteId: string, noteBody: string): Promise<joplinNote> {
    return testNote2;
  }
}
jest.mock('../settings/settings');

const mockDateNow = new Date('2022-01-04T11:11:11.135Z');

function getMock(): pluginSettings {
  console.info('Load mock values');
  const config = new pluginSettings();
  config.importPath = '';
  config.archiveTarget = '';
  config.archiveImportedFiles = true;
  config.archiveTarget = '';
  config.extractTagsFromFile = false;
  config.frontMatterRenderRule = true;
  config.ignoreFiles = '';
  config.importDuplicateFiles = false;
  config.importNotebook = '';
  config.importRecursive = true;
  config.skipFileContent = false;
  config.tagNewFiles = false;
  config.tagNewFilesTags = '';
  config.importRecursiveDepth = 5;
  config.pluginDataDir = '';
  config.documentsSectionHeader = 'test';
  return config;
}

describe('Migrate v1 File import to v2 import Version', function () {
  beforeEach(() => {
    myContainer.snapshot();
    const athenaSettingsMock = {
      Values: getMock(),
      initilize: null,
      verify: null
    };

    const testResource: iJoplinResource = new joplinResource();
    testResource.id = 'someresourceid';
    testResource.title = 'title';
    testResource.mime = 'application/pdf';
    testResource.file_extension = 'PDF';
    testResource.size = '13';
    const testNotebook = new joplinNotebook();
    testNotebook.id = 'id';
    testNotebook.parent_id = 'parent_id';
    testNotebook.title = 'title';
    myContainer.unbind(TYPES.iAthenaConfiguration);
    myContainer.unbind(TYPES.iJoplinApiBc);
    myContainer
      .bind<iJoplinNotebook>(TYPES.iJoplinNotebook)
      .toConstantValue(testNotebook);
    myContainer
      .bind<iJoplinResource>(TYPES.iJoplinResource)
      .toConstantValue(testResource);
    myContainer.bind<iJoplinApiBc>(TYPES.iJoplinApiBc).to(joplinApiBcMock);
    myContainer
      .bind<iAthenaConfiguration>(TYPES.iAthenaConfiguration)
      .toConstantValue(athenaSettingsMock);
    jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementationOnce(() => console.log('mkdirSync'));
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDateNow.valueOf());
  });

  afterEach(() => {
    myContainer.restore();
  });

  it(`on 2 filemetadata with data should loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/someresourceid)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    const expected = {
      Author: 'author test',
      CreationDate: new Date('2022-01-01T14:39:05.000Z'),
      Keywords: 'keyword1, keyword2',
      Subject: 'subject test',
      Title: '2022-06-11-1639-a-file'
    };
    const actual = await sut.loadPDFMETADATATEXT(noteBody);
    expect(actual.Author).toEqual(expected.Author);
    expect(actual.CreationDate.toISOString()).toEqual(
      expected.CreationDate.toISOString()
    );
    expect(actual.Subject).toEqual(expected.Subject);
    expect(actual.Title).toEqual(expected.Title);
    expect(actual.Keywords).toEqual(expected.Keywords);
  });
  it(`on 2 filemetadata without data should loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/7a1d68564e3c4ffabfa70555533b428e)\n\n<!--\nPDFMETADATATEXTSTART\n\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    const expected = {
      Author: '',
      CreationDate: null,
      Keywords: '',
      Subject: '',
      Title: ''
    };
    const actual = await sut.loadPDFMETADATATEXT(noteBody);
    expect(actual).toEqual(expected);
  });
  it(`on 2 filehashblocks the one with data should loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/someresourceid)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    const expected = 'somehash1234567890';
    const actual = await sut.loadFILEHASH(noteBody);
    expect(actual).toEqual(expected);
  });
  it(`if no filehash specified empty string should be loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/7a1d68564e3c4ffabfa70555533b428e)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nFILEHASHEND\n-->\n';
    const expected = '';
    const actual = await sut.loadFILEHASH(noteBody);
    expect(actual).toEqual(expected);
  });
  it(`on 2 filehashblocks the one with data should loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/someresourceid)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nsome text\n\nsome more text\n\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    const expected = '\nsome text\n\nsome more text\n\n';
    const actual = await sut.loadPDFCONTENTTEXT(noteBody);
    expect(actual).toEqual(expected);
  });

  it(`if no filehash specified empty string should be loaded`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const noteBody =
      '[2022-06-11-1639-a-file](:/7a1d68564e3c4ffabfa70555533b428e)\n\n<!--\nPDFMETADATATEXTSTART\nTitle: 2022-06-11-1639-a-file\nCreationDate: 2022-01-01T14:39:05.000Z\nAuthor: author test\nSubject: subject test\nKeywords: keyword1, keyword2\n\n\nPDFMETADATATEXTEND\nPDFCONTENTTEXTSTART\nPDFCONTENTTEXTEND\nFILEHASHSTART\nFILEHASHEND\n-->\n\n\n<!--\nFILEHASHSTART\nsomehash1234567890\nFILEHASHEND\n-->\n';
    const expected = '\n';
    const actual = await sut.loadPDFCONTENTTEXT(noteBody);
    expect(actual).toEqual(expected);
  });

  it(`full migrate of note with body and resource work`, async () => {
    const sut = myContainer.get<iMigrateFileImportFormatV1toV2>(
      TYPES.iMigrateFileImportFormatV1toV2
    );
    const expected =
      '# test\n## title\n[title](:/someresourceid)\n\n## metadata\n``` yaml document header\nName: title\nAuthor: author test\nContent: |+\n  \n  some text\n\n  some more text\n\nSender: ""\nCaptured: 2022-07-27T13:44:57.229Z\nCreated: &a1 2022-01-01T14:39:05.000Z\nFileHash:\n  Hash: somehash1234567890\nMetadata: null\nModified: *a1\nRecipient: ""\nResourceLink: "[title](:/someresourceid)"\n\n```\n';
    const noteId = 'noteId';
    const actual = await sut.migrate(noteId);
    expect(actual.Body).toEqual(expected);
  });
});
