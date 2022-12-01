import * as pdfjsLib from 'pdfjs-dist/build/pdf.js';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';
import { PDFDateString } from 'pdfjs-dist';
import { EOL } from 'os';
import { injectable } from 'inversify';
import { metaData } from '../core/fileMetaData';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface iPdf {
  extractPdfText(path: string): Promise<string>;
  extractPdfMetadata(path: string): Promise<metaData>;
  parsePDFDate(inputDate): Promise<Date>;
}

@injectable()
export class pdf implements iPdf {
  async extractPdfText(path: string): Promise<string> {
    const pdf = await pdfjsLib.getDocument(path).promise;
    let complete = 0;
    const total = pdf.numPages;
    const pages = {};
    for (let pagei = 1; pagei <= total; pagei++) {
      const page = await pdf.getPage(pagei);
      const pageNumber = page.pageNumber;
      const textContent = await page.getTextContent();
      if (null != textContent.items) {
        let page_text = '';
        let last_item = null;
        for (let itemsi = 0; itemsi < textContent.items.length; itemsi++) {
          const item = textContent.items[itemsi];
          if (
            last_item != null &&
            last_item.str[last_item.str.length - 1] != ' '
          ) {
            const itemX = item.transform[5];
            const lastItemX = last_item.transform[5];
            const itemY = item.transform[4];
            const lastItemY = last_item.transform[4];
            if (itemX < lastItemX) page_text += EOL;
            else if (
              itemY != lastItemY &&
              last_item.str.match(/^(\s?[a-zA-Z])$|^(.+\s[a-zA-Z])$/) == null
            )
              page_text += ' ';
          }

          page_text += item.str;
          last_item = item;
        }
        pages[pageNumber] = page_text + EOL;
      }
      ++complete;
      if (complete == total) {
        let full_text = '';
        const num_pages = Object.keys(pages).length;
        for (let pageNum = 1; pageNum <= num_pages; pageNum++)
          full_text += pages[pageNum];
        return full_text;
      }
    }
    return '';
  }

  async extractPdfMetadata(path: string): Promise<metaData> {
    const pdf = await pdfjsLib.getDocument(path).promise;
    const metadata = await pdf.getMetadata();

    let title = '';
    let subject = '';
    let author = '';
    let keywords: Array<string> = [];
    let creationDate = null;
    let modDate = null;

    if (metadata.info.Title !== undefined) {
      title = metadata.info.Title;
    }
    if (metadata.info.Subject !== undefined) {
      subject = metadata.info.Subject;
    }
    if (metadata.info.Author !== undefined) {
      author = metadata.info.Author;
    }
    if (metadata.info.Keywords !== undefined) {
      keywords = metadata.info.Keywords.split(',');
    }
    if (metadata.info.CreationDate !== undefined) {
      creationDate = await this.parsePDFDate(metadata.info.CreationDate);
    }
    if (metadata.info.ModDate !== undefined) {
      modDate = await this.parsePDFDate(metadata.info.ModDate);
    }

    return {
      Title: title,
      Author: author,
      CreationDate: creationDate,
      ModificationDate: modDate,
      Keywords: keywords,
      Subject: subject
    };
  }

  async parsePDFDate(inputDate): Promise<Date> {
    const dateObject = PDFDateString.toDateObject(inputDate);
    if (!dateObject) {
      return undefined;
    }
    return dateObject;
  }
}
