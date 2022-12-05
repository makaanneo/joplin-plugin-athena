import 'reflect-metadata';
import {
  describe,
  expect,
  beforeEach,
  afterEach,
  jest,
  it
} from '@jest/globals';
import {
  fileNameTokens,
  iFileNameTokenizer
} from '../file_handler/file_name_tokenizer';
import { myContainer } from '../inversify.config';
import { TYPES } from '../types';
import { pluginSettings } from '../common';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';

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

describe('Tokenize filesnames without date', function () {
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
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDateNow.valueOf());
  });
  afterEach(() => {
    myContainer.restore();
  });

  it(`should tokenize: test_file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test_file_name.pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test-file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test-file_name.pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test[file, name].pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test[file, name].pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test[file, name].pdf and return date now`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test[file, name].pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test-12345545-test123.pdf and return date now`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'test123']
    };
    const actual: fileNameTokens = await sut.tokenize(
      `test-12345545-test123.pdf`
    );
    expect(actual).toEqual(expected);
  });
});

describe('Tokenize filesnames with date', function () {
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
  });
  afterEach(() => {
    myContainer.restore();
  });
  it(`should tokenize: 2021-10-14-test_file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 20211014-test_file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 14102021-test_file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 10142021-test_file_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should handle wired numbers: 29102-234-23-test_file_name 2345/12/41.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2910-01-01T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name', '234', '23']
    };
    expect(
      await sut.tokenize(`29101-01-01-test_file_name 2345/12/41.pdf`)
    ).not.toEqual(expected);
  });
  it(`should handle number tokens: 2099-12-12-test_file123-2934_name.pdf`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    const expected: fileNameTokens = {
      DateTime: new Date('2099-12-12T00:00:00.000Z'),
      Tokens: ['test', 'file123', 'name']
    };
    expect(await sut.tokenize(`2099-12-12-test_file123-2934_name.pdf`)).toEqual(
      expected
    );
  });
});
