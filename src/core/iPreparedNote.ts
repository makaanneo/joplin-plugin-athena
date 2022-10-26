export interface iPreparedNote {
  Title: string;
  Body: string;
  Tags: Array<string>;
  Folder: string;
}
export class preparedNote implements iPreparedNote {
  Title: string;
  Body: string;
  Tags: string[];
  Folder: string;
}
