import 'reflect-metadata';
import { describe, expect, jest, it } from '@jest/globals';
import { iJoplinResource, joplinResource } from '../core/joplinResource';

jest.mock('../settings/settings');

describe('IoC Container works', function () {
  it(`should return instance of atthenasettings`, async () => {
    const sut: iJoplinResource = new joplinResource();
    sut.title = 'test';
    sut.id = 'id';
    sut.mime = 'mime';
    const actual = await sut.buildResourceLink(sut.title, sut.id, sut.mime);
    expect(actual).not.toEqual(undefined);
  });
});
