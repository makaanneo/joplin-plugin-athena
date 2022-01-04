import { fileNameTokenizer } from '../src/file_handler/file_name_tokenizer';
import type { fileNameTokens } from '../src/file_handler/file_name_tokenizer';

jest.mock('../src/settings/settings');

const mockDateNow = new Date('2022-01-04T11:11:11.135Z');

describe('Tokenize filesnames without date', function () {
  beforeEach(() => {
    jest
      .spyOn(global.Date, 'now')
      .mockImplementationOnce(() => mockDateNow.valueOf());
  });

  it(`should tokenize: test_file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test_file_name.pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test-file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test-file_name.pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test[file, name].pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test[file, name].pdf`);
    expect(actual).toEqual(expected);
  });
  it(`should tokenize: test[file, name].pdf and return date now`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: mockDateNow,
      Tokens: ['test', 'file', 'name']
    };
    const actual: fileNameTokens = await sut.tokenize(`test[file, name].pdf`);
    expect(actual).toEqual(expected);
  });
});

describe('Tokenize filesnames with date', function () {
  it(`should tokenize: 2021-10-14-test_file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 20211014-test_file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 14102021-test_file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should tokenize: 10142021-test_file_name.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: new Date('2021-10-14T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name']
    };
    expect(await sut.tokenize(`2021-10-14-test_file_name.pdf`)).toEqual(
      expected
    );
  });
  it(`should handle wired numbers: 29102-234-23-test_file_name 2345/12/41.pdf`, async () => {
    const sut = new fileNameTokenizer();
    const expected: fileNameTokens = {
      DateTime: new Date('2910-01-01T00:00:00.000Z'),
      Tokens: ['test', 'file', 'name', '234', '23']
    };
    expect(
      await sut.tokenize(`29101-01-01-test_file_name 2345/12/41.pdf`)
    ).not.toEqual(expected);
  });
});
