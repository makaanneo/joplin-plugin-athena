import { fileHandler } from '../src/file_handler/file_handler.bc';
import fs = require('fs-extra');
import * as path from 'path';

jest.mock('../src/settings/settings');

const mockDateNow = new Date('2022-01-04T11:11:11.135Z');

describe('create correct archive folder based on date', function () {
  beforeEach(() => {
    jest
      .spyOn(fs, 'mkdirSync')
      .mockImplementationOnce(() => console.log('mkdirSync'));
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDateNow.valueOf());
  });

  it(`Should return target by using handed over date`, async () => {
    const sut = new fileHandler();
    const archiveBaseFolder = 'testPath/subPath';
    const dateTime = new Date('2022-01-01T11:11:11.135Z');
    const monthSubFolder = `${dateTime.getMonth() + 1 < 10 ? '0' : ''}${
      dateTime.getMonth() + 1
    }`;
    const expected = path.join(
      archiveBaseFolder,
      dateTime.getFullYear().toString(),
      monthSubFolder
    );
    const actual = await sut.createArchiveFolderIfNotExists(
      archiveBaseFolder,
      dateTime
    );
    expect(actual).toEqual(expected);
  });
  it(`Should return target by using date now by no valid date in parameter`, async () => {
    const sut = new fileHandler();
    const archiveBaseFolder = 'testPath/subPath';
    const dateTime = null;
    const monthSubFolder = `${mockDateNow.getMonth() + 1 < 10 ? '0' : ''}${
      mockDateNow.getMonth() + 1
    }`;
    const expected = path.join(
      archiveBaseFolder,
      mockDateNow.getFullYear().toString(),
      monthSubFolder
    );
    const actual = await sut.createArchiveFolderIfNotExists(
      archiveBaseFolder,
      dateTime
    );
    expect(actual).toEqual(expected);
  });
});
