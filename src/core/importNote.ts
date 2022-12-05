export interface iImportNote {
  title: string;
  author: string;
  sender: string;
  recipient: string;
  date: Date;
  pages: number;
  fileContent: string;
  MiscMetadata: string[];
}
