import { injectable } from 'inversify';

export interface iJoplinResource {
  title: string;
  id: string;
  mime: string;
  size: string;
  filename: string;
  file_extension: string;
  buildResourceLink(name: string, id: string, mime: string): Promise<string>;
  buildResourceTitle(name: string): Promise<string>;
}

@injectable()
export class joplinResource implements iJoplinResource {
  title: string;
  id: string;
  mime: string;
  size: string;
  filename: string;
  file_extension: string;

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

  async buildResourceTitle(name: string): Promise<string> {
    return `# ${name}`;
  }
}
