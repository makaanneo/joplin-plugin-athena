import { metaData } from './fileMetaData';
import { iFileHash } from './iFileHash';

export interface documentFrontMatter {
  Name: string;
  Author: string;
  Sender: string;
  Recipient: string;
  Created: Date;
  Modified: Date;
  Captured: Date;
  ResourceLing: string;
  FileHash: iFileHash;
  Metadata: Array<metaData>;
  Content: string;
}
