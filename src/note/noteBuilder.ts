import type { importNoteData } from './importNoteData';

interface noteBuilder {
  import(
    file: string,
    noteTitle: string,
    noteFolder: string
  ): Promise<importNoteData>;
}

export { noteBuilder };
