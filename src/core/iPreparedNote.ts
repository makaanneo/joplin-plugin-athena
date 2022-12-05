export interface iPreparedNote {
  Title: string;
  Body: string;
  Tags: Array<string>;
  Folder: string;
  created_time: Date;
}
export class preparedNote implements iPreparedNote {
  Title: string;
  Body: string;
  Tags: string[];
  Folder: string;
  created_time: Date;
}
