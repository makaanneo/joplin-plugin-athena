export const IGNORE_FILES = 'ignoreFiles';
export const IMPORT_PATH = 'importPath';
export const EXTRACT_TAGS_FROM_FILE = 'extractTagsFromFile';
export const IMPORT_RECURSIVE_DEPTH = 'importRecursiveDepth';
export const IMPORT_RECURSIVE = 'importRecursive';
export const IMPORT_NOTEBOOK = 'importNotebook';
export const ARCHIVE_IMPORTED_FILES = 'archiveImportedFiles';
export const ARCHIVE_TARGET = 'archiveTarget';
export const TAG_NEW_FILES = 'tagNewFiles';
export const TAG_NEW_FILES_TAGS = 'tagNewFilesTags';
export const IMPORT_DUPLICATE_FILES = 'importDuplicateFiles';
export const SKIP_FILE_CONTENT = 'skipFileContent';
export const FRONT_MATTER_RENDER_RULE = 'frontMatterRenderRule';
export const FILE_HASH_ALGORITHM = 'fileHashAlgorithm';
export const CODEMIRROR_FRONT_MATTER = 'codemirrorFrontMatter';
export const FOLD_FRONT_MATTER = 'foldFrontMatter';

export class pluginSettings {
  ignoreFiles: string;
  importPath: string;
  importWithFolders: boolean;
  extractTagsFromFile: boolean;
  importRecursiveDepth: number;
  importRecursive: boolean;
  importNotebook: string;
  archiveImportedFiles: boolean;
  archiveTarget: string;
  tagNewFiles: boolean;
  tagNewFilesTags: string;
  importDuplicateFiles: boolean;
  skipFileContent: boolean;
  frontMatterRenderRule: boolean;
  fileHashAlgorithm: string;
  codemirrorFrontMatter: boolean;
  foldFrontMatter: boolean;
}

export enum ContextMsgType {
  GET_SETTINGS,
  OPEN_URL,
  RESOURCE_PATH,
  SHORTCUT
}
export class CodemirrorConfig {
  public auto_fold_frontmatter: boolean;
  public auto_fold_markdown: boolean;
}
export class ContextMsg {
  type: ContextMsgType;
  content: any;
}
