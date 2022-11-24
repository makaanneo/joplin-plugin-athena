import { describe, expect, beforeEach, jest, it } from '@jest/globals';
import { documentFrontMatter } from '../core/documentFrontMatter';
import { parse, stringify } from 'yaml';

describe('IoC Container works', function () {
  it(`should return instance of atthenasettings`, async () => {
    stringify(3.14159);
    // '3.14159\n'

    stringify([true, false, 'maybe', null]);
    // `- true
    // - false
    // - maybe
    // - null
    // `
    const sut: documentFrontMatter = {
      Name: 'Title',
      Author: 'Author',
      Content: 'Content',
      Sender: 'Sender',
      Captured: new Date(Date.now()),
      Created: new Date(Date.now()),
      FileHash: {
        Algorithm: 'Algorithm',
        Hash: 'Hash'
      },
      Metadata: null,
      Modified: new Date(Date.now()),
      Recipient: 'Recipient',
      ResourceLink: 'ResourceLing'
    };

    const actual = stringify(sut);
    ('Title: TitleAuthor: Author\nContent: Content\nSender: Sender\nCaptured: 2022-10-20T14:17:44.397Z\nCreated: 2022-10-20T14:17:44.397Z\nFileHash:\n  Algorithm: Algorithm\n  Hash: Hash\nMetadata: null\nModified: 2022-10-20T14:17:44.397Z\nRecipient: Recipient\nResourceLing: ResourceLing\n');
    expect(actual).not.toEqual(null);
  });
});
