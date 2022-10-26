import 'reflect-metadata';
import { describe, expect, beforeEach, jest, it } from '@jest/globals';
import { myContainer } from '../inversify.config';
import { iAthenaConfiguration } from '../settings/athenaConfiguration';
import { TYPES } from '../types';
import { iDirectoryMonitoreWorker } from '../worker';
import { iFileExtensions } from '../core/fileExtensions';
import { iFileNameTokenizer } from '../file_handler/file_name_tokenizer';
import { iArchiveFile } from '../core/archiveFile';
import { iJoplinNoteProcessor } from '../core/joplinNoteProcessor';
import { iFileTypeHandler } from '../core/typeHandlerBase';
import { iFileTypeHandlerFactory } from '../core/fileTypeHandlerFactory';

jest.mock('../settings/settings');

describe('IoC Container works', function () {
  it(`should return instance of atthenasettings`, async () => {
    const sut = myContainer.get<iAthenaConfiguration>(
      TYPES.iAthenaConfiguration
    );
    expect(await sut).not.toEqual(undefined);
  });
  it(`should return instance of iDirectoryMonitoreWorker`, async () => {
    const sut = myContainer.get<iDirectoryMonitoreWorker>(
      TYPES.iDirectoryMonitoreWorker
    );
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iFileExtensions`, async () => {
    const sut = myContainer.get<iFileExtensions>(TYPES.iFileExtensions);
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iDirectoryMonitoreWorker`, async () => {
    const sut = myContainer.get<iFileNameTokenizer>(TYPES.iFileNameTokenizer);
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iFileHandler`, async () => {
    const sut = myContainer.get<iArchiveFile>(TYPES.iArchiveFile);
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iJoplinNoteProcessor`, async () => {
    const sut = myContainer.get<iJoplinNoteProcessor>(
      TYPES.iJoplinNoteProcessor
    );
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iFileTypeProcessor`, async () => {
    const sut = myContainer.get<iFileTypeProcessor>(TYPES.iFileTypeProcessor);
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iFileTypeHandler`, async () => {
    const sut = myContainer.getAll<iFileTypeHandler>(TYPES.iFileTypeHandler);
    expect(sut).not.toEqual(null);
  });
  it(`should return instance of iFileTypeHandlerFactory`, async () => {
    const sut = myContainer.get<iFileTypeHandlerFactory>(
      TYPES.iFileTypeHandlerFactory
    );
    expect(sut).not.toEqual(null);
  });
});
