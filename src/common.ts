import { string } from 'yargs';

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
}
