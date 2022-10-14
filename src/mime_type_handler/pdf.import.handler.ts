import { EOL } from 'os';
import * as pdf from '../pdf/pdf';
import { baseHandler } from './base.import.handler';
import { noteImportTemplate } from '../core/noteImportTemplate';
import * as path from 'path';
import { Metadata } from 'pdfjs-dist/types/src/display/metadata';

class pdfImportHandler extends baseHandler {
  constructor() {
    super();
    super.initialize();
  }

  public async importFile(
    file: string,
    noteTitle: string,
    resource: any,
    skipPDFTextBody: boolean
  ): Promise<noteImportTemplate> {
    let pdfFullText = '';
    console.log(`Skip Content set: ${skipPDFTextBody}`);
    if (skipPDFTextBody === false) {
      pdfFullText = await pdf.extractPdfText(file);
      console.log(`DO not Skip Content: ${pdfFullText}`);
    }
    const metaInformation = await pdf.extractPdfMetadata(file);
    const fileName = path.basename(file);

    console.log(
      `extracted meta data from ${resource.id}/${resource.title}: ${metaInformation}`
    );
    let tags = metaInformation.Keywords;
    tags = tags.concat(await this.pdfMetadataToTagArray(metaInformation));
    let body: string = '';
    body += await this.buildResourceLink(fileName, resource);
    console.log(
      `extracted text from ${resource.id}/${
        resource.title
      }: ${pdfFullText.substring(0, 100)}`
    );
    body += EOL;
    body += EOL;
    const pdfImporter = new pdfImportHandler();
    body += await pdfImporter.buildCommentBlockForNote(
      await pdfImporter.buildMetadataString(metaInformation),
      pdfFullText
    );
    return {
      Body: body,
      Tags: tags,
      Title: noteTitle
    };
  }

  private async buildTags(): Promise<string[]> {
    return null;
  }

  private async buildResourceLink(
    fileName: string,
    resource: any
  ): Promise<string> {
    let link: string = '[' + fileName + '](:/' + resource.id + ')';
    if (
      resource.mime !== undefined &&
      resource.mime.split('/')[0] === 'image'
    ) {
      link = '!' + link;
    }
    return link;
  }

  async pdfMetadataToTagArray(metaData: pdf.pdfMetaData): Promise<string[]> {
    let result: string[] = [];
    if (
      typeof metaData.Title !== undefined &&
      metaData.Title != null &&
      metaData.Title != ''
    ) {
      result.push(`Title: ${metaData.Title}`);
    }
    if (
      typeof metaData.Subject !== undefined &&
      metaData.Subject != null &&
      metaData.Subject != ''
    ) {
      result.push(`Subject: ${metaData.Subject}`);
    }
    if (
      typeof metaData.Author !== undefined &&
      metaData.Author != null &&
      metaData.Author != ''
    ) {
      result.push(`Author: ${metaData.Author}`);
    }
    if (
      typeof metaData.CreationDate !== undefined &&
      metaData.CreationDate != null
    ) {
      result.push(
        `CreationDate: ${await this.formatDate(metaData.CreationDate)}`
      );
    }

    return result;
  }

  private async formatDate(date: Date): Promise<string> {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  async buildMetadataString(metaData: pdf.pdfMetaData): Promise<string> {
    let result = '';
    if (
      typeof metaData.Title !== undefined &&
      metaData.Title != null &&
      metaData.Title != ''
    ) {
      result += `Title: ${metaData.Title}`;
      result += EOL;
    }
    if (
      typeof metaData.Subject !== undefined &&
      metaData.Subject != null &&
      metaData.Subject != ''
    ) {
      result += `Subject: ${metaData.Subject}`;
      result += EOL;
    }
    if (
      typeof metaData.Author !== undefined &&
      metaData.Author != null &&
      metaData.Author != ''
    ) {
      result += `Author: ${metaData.Author}`;
      result += EOL;
    }
    if (
      typeof metaData.CreationDate !== undefined &&
      metaData.CreationDate != null
    ) {
      result += `CreationDate: ${metaData.CreationDate.toISOString()}`;
      result += EOL;
    }
    if (
      typeof metaData.Keywords !== undefined &&
      metaData.Keywords != null &&
      metaData.Keywords.length > 0
    ) {
      result += `Keywords: ${metaData.Keywords.join(', ')}`;
    }
    return result;
  }

  async buildKeyVaulePais(
    metaInformation: string,
    pdfText: string
  ): Promise<Array<[key:string, value:string]>> {
    return null;
  }

  async buildCommentBlockForNote(
    metaInformation: string,
    pdfText: string
  ): Promise<string> {
    const startTag = '<!--';
    const endTag = '-->';
    const pdfMetaDataStart = 'PDFMETADATATEXTSTART';
    const pdfMetaDataEnd = 'PDFMETADATATEXTEND';
    const pdfTextStart = 'PDFCONTENTTEXTSTART';
    const pdfTextEnd = 'PDFCONTENTTEXTEND';
    const hashStart = 'FILEHASHSTART';
    const hashEnd = 'FILEHASHEND';

    let commentBlock = '';

    commentBlock += startTag;
    commentBlock += EOL;
    commentBlock += pdfMetaDataStart;
    commentBlock += EOL;
    commentBlock += metaInformation;
    commentBlock += EOL;
    commentBlock += pdfMetaDataEnd;
    commentBlock += EOL;
    commentBlock += pdfTextStart;
    commentBlock += EOL;
    commentBlock += pdfText;
    commentBlock += EOL;
    commentBlock += pdfTextEnd;
    commentBlock += EOL;
    commentBlock += hashStart;
    commentBlock += EOL;
    commentBlock += hashEnd;
    commentBlock += EOL;
    commentBlock += endTag;
    commentBlock += EOL;
    return commentBlock;
  }
}
export { pdfImportHandler };
