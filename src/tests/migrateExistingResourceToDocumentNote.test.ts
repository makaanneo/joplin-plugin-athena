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
import { iMigrateExistingResourceToDocumentNote } from '../core/migrateExistingResourceToDocumentNote';
import crypto = require('crypto');
import path = require('path');
import { iPdf } from '../pdf/pdf';
import { metaData } from '../core/fileMetaData';
import { iJoplinAttachment, joplinAttachment } from '../core/joplinAttachment';

const testNote2: iJoplinNote = new joplinNote();
testNote2.id = 'id';
testNote2.title = 'prepared_title';
testNote2.created_time = 1658929497229;
testNote2.body = '# dummy\n #metadata\n...';
const jr1: iJoplinResource = new joplinResource();
jr1.id = '77541c14-7899-443e-b7bd-7c986211bc40';
jr1.filename = 'f1.pdf';
jr1.mime = 'application/pdf';
jr1.file_extension = 'pdf';
jr1.size = 'result.size';
jr1.title = 'f1.pdf';
const jr2: iJoplinResource = new joplinResource();
jr2.id = 'c2db0878-3f90-4562-b564-27840f982c85';
jr2.filename = 'f2.pdf';
jr2.mime = 'application/pdf';
jr2.file_extension = 'pdf';
jr2.size = 'result.size';
jr2.title = 'f2.pdf';
const jr3: iJoplinResource = new joplinResource();
jr3.id = 'e7243157-ff49-48af-8e9e-21f4c456013e';
jr3.filename = 'unit-test.pdf';
jr3.mime = 'image/jpg';
jr3.file_extension = 'pdf';
jr3.size = 'result.size';
jr3.title = 'latest_1024_211193171.jpg';
const ja1: iJoplinAttachment = new joplinAttachment();
ja1.attachmentFilename = '77541c14-7899-443e-b7bd-7c986211bc40';
ja1.body = fs.readFileSync(path.join(__dirname, './data/f1.pdf'));
const ja2: iJoplinAttachment = new joplinAttachment();
ja2.attachmentFilename = 'c2db0878-3f90-4562-b564-27840f982c85';
ja2.body = fs.readFileSync(path.join(__dirname, './data/f2.pdf'));
const ja3: iJoplinAttachment = new joplinAttachment();
ja3.attachmentFilename = 'e7243157-ff49-48af-8e9e-21f4c456013e';
ja3.body = fs.readFileSync(
  path.join(__dirname, './data/latest_1024_211193171.jpg')
);
const testResources = [jr1, jr2, jr3];
const testAttachments = [ja1, ja2, ja3];

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
  async getResourceById(resourceId: string): Promise<iJoplinResource> {
    return testResources.filter((s) => s.id === resourceId)[0];
  }
  async getAttachmentById(resourceId: string): Promise<iJoplinAttachment> {
    return testAttachments.filter(
      (s) => s.attachmentFilename === resourceId
    )[0];
  }
  async getResourcesOfNote(noteId: string): Promise<joplinResource[]> {
    return testResources;
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
@injectable()
class pdfMock implements iPdf {
  async extractPdfText(path: string): Promise<string> {
    return `
Part I
Lorem ipsum dolor sit amet
1 Lorem
ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor inci-
didunt ut labore et dolore magna aliqua. Nibh sed pulvinar proin gravida.
1
`;
  }
  async extractPdfMetadata(path: string): Promise<metaData> {
    return {
      Title: 'title',
      Author: 'author',
      CreationDate: new Date(Date.now()),
      ModificationDate: new Date(Date.now()),
      Keywords: ['keywords'],
      Subject: 'subject'
    };
  }
  async parsePDFDate(inputDate: any): Promise<Date> {
    return new Date(Date.now());
  }
}

jest.mock('../settings/settings');
const mockDateNow = new Date('2022-01-04T11:11:11.135Z');
const uuid = crypto.randomUUID();
const tempPath = path.join('migrateToDocumentNote', uuid);
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
  config.fileHashAlgorithm = 'sha256';
  return config;
}

describe('Migrate attached resources to document note', function () {
  beforeEach(() => {
    fs.mkdirSync(tempPath, { recursive: true });
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
    myContainer.unbind(TYPES.iPdf);
    myContainer.unbind(TYPES.iJoplinApiBc);
    myContainer
      .bind<iJoplinNotebook>(TYPES.iJoplinNotebook)
      .toConstantValue(testNotebook);
    myContainer
      .bind<iJoplinResource>(TYPES.iJoplinResource)
      .toConstantValue(testResource);
    myContainer.bind<iJoplinApiBc>(TYPES.iJoplinApiBc).to(joplinApiBcMock);
    myContainer.bind<iPdf>(TYPES.iPdf).to(pdfMock);
    myContainer
      .bind<iAthenaConfiguration>(TYPES.iAthenaConfiguration)
      .toConstantValue(athenaSettingsMock);
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDateNow.valueOf());
  });

  afterEach(() => {
    myContainer.restore();
    if (fs.existsSync(tempPath)) {
      fs.rmSync(tempPath, { recursive: true });
    }
  });

  it(`can create temp directory`, async () => {
    const sut = myContainer.get<iMigrateExistingResourceToDocumentNote>(
      TYPES.iMigrateExistingResourceToDocumentNote
    );
    const testRandom = 'uuid-test';
    const actual = await sut.createTempDirectory(testRandom);
    expect(actual).not.toBeNull();
    fs.rmdirSync(actual, { recursive: true });
  });
  it(`can create file form api`, async () => {
    const sut = myContainer.get<iMigrateExistingResourceToDocumentNote>(
      TYPES.iMigrateExistingResourceToDocumentNote
    );
    const actual = await sut.downloadResourceToTempDirectory(
      tempPath,
      testResources[0].id
    );
    expect(actual).not.toBeNull();
    expect(fs.existsSync(actual)).toBe(true);
  });
  it(`can migrate`, async () => {
    const sut = myContainer.get<iMigrateExistingResourceToDocumentNote>(
      TYPES.iMigrateExistingResourceToDocumentNote
    );
    const testNoteId = 'dummy';
    const actual = await sut.migrate(testNoteId, false);
    expect(actual).not.toBeNull();
  });
});
