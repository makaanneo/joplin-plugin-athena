export class joplinResource {
  Title: string;
  Id: string;
  Mime: string;
  JoplinResourceType: any;

  public async buildResourceLink(
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

  public async buildResourceTitle(name: string): Promise<string> {
    return `# ${name}`;
  }
}
