export interface iOldNoteFormat {
  Title: string;
  Body: string;
  Tags: Array<string>;
  PDFMETADATATEXT: iOldPDFMetaData;
  PDFCONTENTTEXT: string;
  FILEHASHSTART: string;
  Folder: string;
}

export interface iOldPDFMetaData {
  Title: string;
  Subject: string;
  Author: string;
  CreationDate: Date;
  Keywords: string;
}

export class oldNoteFormat implements iOldNoteFormat {
  Title: string;
  Body: string;
  Tags: string[];
  PDFMETADATATEXT: iOldPDFMetaData;
  PDFCONTENTTEXT: string;
  FILEHASHSTART: string;
  Folder: string;
}
