import 'reflect-metadata';
import {
  describe,
  expect,
  beforeEach,
  afterEach,
  jest,
  it
} from '@jest/globals';
import { iJoplinNoteBuilder } from '../core/joplinNoteBuilder';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { iRawFile, rawFile } from '../core/rawFile';
import { iJoplinResource, joplinResource } from '../core/joplinResource';
import { pluginSettings } from '../common';
import fs = require('fs-extra');
import * as path from 'path';
import { iAthenaConfiguration } from 'src/settings/athenaConfiguration';
jest.mock('../settings/settings');
jest.mock('path');

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
  config.fileHashAlgorithm = 'sha256';
  config.importRecursiveDepth = 5;
  return config;
}
describe('IoC Container works', function () {
  beforeEach(() => {
    myContainer.snapshot();
    const athenaSettingsMock = {
      Values: getMock(),
      initilize: null,
      verify: null
    };
    myContainer.unbind(TYPES.iAthenaConfiguration);
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
  it(`should return instance of atthenasettings`, async () => {
    const sut: iJoplinNoteBuilder = myContainer.get<iJoplinNoteBuilder>(
      TYPES.iJoplinNoteBuilder
    );
    const file: iRawFile = new rawFile();
    file.Name = 'name';
    file.Metadata = {
      Title: 'Title',
      Subject: 'Subject',
      Author: 'Author',
      Keywords: ['key1,key2'],
      CreationDate: new Date(Date.now()),
      ModificationDate: new Date(Date.now())
    };
    const resource: iJoplinResource = new joplinResource();
    resource.mime = 'dummy/pdf';
    resource.id = 'id';
    resource.title = 'title';
    const actual = await sut.mapFileToPreparedNote(file, resource);
    expect(actual).not.toEqual(undefined);
  });
});
