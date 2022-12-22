import { injectable } from 'inversify';

export interface iJoplinResource {
  title: string;
  id: string;
  mime: string;
  size: string;
  filename: string;
  file_extension: string;
  body: Uint8Array;
  buildResourceLink(name: string, id: string, mime: string): Promise<string>;
  buildResourceTitle(name: string, headerBlock: string): Promise<string>;
}

@injectable()
export class joplinResource implements iJoplinResource {
  title: string;
  id: string;
  mime: string;
  size: string;
  filename: string;
  file_extension: string;
  body: Uint8Array;

  async buildResourceLink(
    name: string,
    id: string,
    mime: string
  ): Promise<string> {
    let link: string = '[' + name + '](:/' + id + ')';
    if (mime.split('/')[0] === 'image') {
      link = '!' + link;
    }
    return link;
  }

  async buildResourceTitle(name: string, headerBlock: string): Promise<string> {
    return `${headerBlock} ${name}`;
  }
}
