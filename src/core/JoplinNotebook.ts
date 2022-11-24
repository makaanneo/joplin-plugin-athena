export interface iJoplinNotebook {
  id: string;
  title: string;
  parent_id: string;
}

export class joplinNotebook implements iJoplinNotebook {
  id: string;
  title: string;
  parent_id: string;
}
