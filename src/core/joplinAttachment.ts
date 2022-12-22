import { injectable } from 'inversify';

export interface iJoplinAttachment {
  type: string;
  body: Uint8Array;
  contentType: string;
  attachmentFilename: string;
}

@injectable()
export class joplinAttachment implements iJoplinAttachment {
  type: string;
  body: Uint8Array;
  contentType: string;
  attachmentFilename: string;
}
