import 'reflect-metadata';
import joplin from 'api';
import { injectable } from 'inversify';
import {
  ARCHIVE_IMPORTED_FILES,
  ARCHIVE_TARGET,
  EXTRACT_TAGS_FROM_FILE,
  FRONT_MATTER_RENDER_RULE,
  IGNORE_FILES,
  IMPORT_DUPLICATE_FILES,
  IMPORT_NOTEBOOK,
  IMPORT_PATH,
  IMPORT_RECURSIVE,
  IMPORT_RECURSIVE_DEPTH,
  SKIP_FILE_CONTENT,
  TAG_NEW_FILES,
  TAG_NEW_FILES_TAGS,
  pluginSettings,
  FILE_HASH_ALGORITHM,
  CODEMIRROR_FRONT_MATTER,
  FOLD_FRONT_MATTER,
  DOCUMENTS_SECTION_HEADER
} from '../common';

export interface iAthenaConfiguration {
  initilize(): Promise<void>;
  Values: pluginSettings;
  verify(): Promise<boolean>;
}

@injectable()
export class athenaConfiguration implements iAthenaConfiguration {
  async verify(): Promise<boolean> {
    this.initilize();
    const importPathSet =
      (await joplin.settings.value(IMPORT_PATH)) !== undefined &&
      (await joplin.settings.value(IMPORT_PATH)) !== null &&
      (await joplin.settings.value(IMPORT_PATH)) !== '';
    if (!importPathSet) {
      console.log('Import path is not set.');
      return false;
    }
    const importNotebook =
      (await joplin.settings.value(IMPORT_NOTEBOOK)) !== undefined &&
      (await joplin.settings.value(IMPORT_NOTEBOOK)) !== null &&
      (await joplin.settings.value(IMPORT_NOTEBOOK)) !== '';

    if (!importNotebook) {
      console.log('Import notebook is not set.');
      return false;
    }

    const archiveTagetNotSet =
      (await joplin.settings.value(ARCHIVE_TARGET)) !== undefined &&
      (await joplin.settings.value(ARCHIVE_TARGET)) !== null &&
      (await joplin.settings.value(ARCHIVE_TARGET)) !== '';

    if (!archiveTagetNotSet && (await joplin.settings.value(ARCHIVE_TARGET))) {
      console.log('archive target is not set.');
      return false;
    }

    const hashAlgorithm =
      (await joplin.settings.value(FILE_HASH_ALGORITHM)) !== undefined &&
      (await joplin.settings.value(FILE_HASH_ALGORITHM)) !== null &&
      (await joplin.settings.value(FILE_HASH_ALGORITHM)) !== '';

    if (!hashAlgorithm) {
      console.log('hash algorithm is not set.');
      return false;
    }
    return true;
  }
  public Values: pluginSettings;
  async initilize(): Promise<void> {
    console.log('initilize settings');
    if (this.Values === undefined || this.Values === null) {
      console.log('assing settings');
      this.Values = await this.retrieveFromJoplin();
    }
  }
  async retrieveFromJoplin(): Promise<pluginSettings> {
    const config = new pluginSettings();
    config.importPath = await joplin.settings.value(IMPORT_PATH);
    config.archiveTarget = await joplin.settings.value(ARCHIVE_TARGET);
    config.archiveImportedFiles = await joplin.settings.value(
      ARCHIVE_IMPORTED_FILES
    );
    config.archiveTarget = await joplin.settings.value(ARCHIVE_TARGET);
    config.extractTagsFromFile = await joplin.settings.value(
      EXTRACT_TAGS_FROM_FILE
    );
    config.frontMatterRenderRule = await joplin.settings.value(
      FRONT_MATTER_RENDER_RULE
    );
    config.ignoreFiles = await joplin.settings.value(IGNORE_FILES);
    config.importDuplicateFiles = await joplin.settings.value(
      IMPORT_DUPLICATE_FILES
    );
    config.importNotebook = await joplin.settings.value(IMPORT_NOTEBOOK);
    config.importRecursive = await joplin.settings.value(IMPORT_RECURSIVE);
    config.skipFileContent = await joplin.settings.value(SKIP_FILE_CONTENT);
    config.tagNewFiles = await joplin.settings.value(TAG_NEW_FILES);
    config.tagNewFilesTags = await joplin.settings.value(TAG_NEW_FILES_TAGS);
    config.documentsSectionHeader = await joplin.settings.value(
      DOCUMENTS_SECTION_HEADER
    );
    config.codemirrorFrontMatter = await joplin.settings.value(
      CODEMIRROR_FRONT_MATTER
    );
    config.foldFrontMatter = await joplin.settings.value(FOLD_FRONT_MATTER);
    config.fileHashAlgorithm = await joplin.settings.value(FILE_HASH_ALGORITHM);
    config.importRecursiveDepth = await joplin.settings.value(
      IMPORT_RECURSIVE_DEPTH
    );
    config.pluginDataDir = await joplin.plugins.dataDir();
    return config;
  }
}
