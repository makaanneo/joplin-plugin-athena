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
import * as path from 'path';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { pluginSettings } from '../common';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { iArchiveFile } from '../core/archiveFile';
import { verify } from 'crypto';

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
  return config;
}

describe('create correct archive folder based on date', function () {
  const archiveBaseFolder = 'testPath/subPath';
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
    fs.rmdirSync(archiveBaseFolder, { recursive: true });
  });

  it(`Should return target by using handed over date`, async () => {
    const sut = myContainer.get<iArchiveFile>(TYPES.iArchiveFile);
    const dateTime = new Date('2022-01-01T11:11:11.135Z');
    const monthSubFolder = `${dateTime.getMonth() + 1 < 10 ? '0' : ''}${
      dateTime.getMonth() + 1
    }`;
    const expected = path.join(
      archiveBaseFolder,
      dateTime.getFullYear().toString(),
      monthSubFolder
    );
    const actual = await sut.createArchiveFolder(archiveBaseFolder, dateTime);
    expect(actual).toEqual(expected);
  });
});
