import joplin from 'api';
import { SettingItemType } from 'api/types';
import type { pluginSettings } from './pluginSettings';

export async function register(): Promise<void> {
  await joplin.settings.registerSection('importerSection', {
    label: 'Athena',
    iconName: 'fas fa-file-import',
    description:
      'Import files in import folder into joplin notes (PDF text in note comment, no OCR)'
  });

  await joplin.settings.registerSettings({
    importPath: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Import Path',
      description: 'Directory to monitor for import new files.'
    },
    autoImportFiles: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Auto import new files from monitored directory.',
      description: 'Auto import new files from monitored Directory.'
    },
    ignoreFiles: {
      value: '.*',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Ignore Files',
      description: 'Comma separated list of files which will be ignored.'
    },
    extensionsAddAsText: {
      value: '.txt, .md',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Add as text',
      description:
        'Comma separated list of file extensions, which will be imported as text.'
    },
    importNotebook: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Notebook',
      description:
        'If no notebook is specified, the import is made to the current notebook.'
    },
    extractTagsFromFile: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Extract Tags from file',
      description:
        'Experiementel: Try to extract tags from file name and pdf file meta data. (Alpha)',
      advanced: true
    },
    importRecursive: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Import recursive',
      description: 'Scan sub folders for new files and import as well.',
      advanced: true
    },
    importRecursiveDepth: {
      value: 5,
      type: SettingItemType.Int,
      section: 'importerSection',
      public: true,
      label: 'Import recursive depth',
      description: 'Specifies the depth for the recursive import.',
      advanced: true
    },
    archiveImportedFiles: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Archive imported files',
      description:
        'Move files after import into seperate folder with sub folder per year.',
      advanced: true
    },
    archiveImportedFilesTarget: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Archive imported files target',
      description:
        'Move files after import into seperate folder with sub folder per year.',
      advanced: true
    },
    tagNewFilesAsNew: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Add tags to imported files',
      description:
        'Tag new files automatically with a special tag to identify for later processing.',
      advanced: true
    },
    tagNewFilesAsNewWithTag: {
      value: 'document: new_file',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Tag imported file with value',
      description:
        'Tag new files automatically with a special tag to identify for later processing.',
      advanced: true
    },
    importDuplicates: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Force import of duplicates',
      description: 'Force import of duplicates.',
      advanced: true
    },
    skipPDFBodyText: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Skip PDF Text body import',
      description: 'PDF Text will be skipped on import.',
      advanced: true
    }
  });
}

export async function getImportSettings(): Promise<pluginSettings> {
  const ignoreFiles = await joplin.settings.value('ignoreFiles');

  const extensionsAddAsText = await joplin.settings.value(
    'extensionsAddAsText'
  );

  const importNotebook = await joplin.settings.value('importNotebook');
  const importPath = await joplin.settings.value('importPath');
  const importWithFolders = false; //await joplin.settings.value('importWithFolders');
  const importRecursiveDepth = await joplin.settings.value(
    'importRecursiveDepth'
  );
  const importRecursive = await joplin.settings.value('importRecursive');
  const extractTagsFromFile = await joplin.settings.value(
    'extractTagsFromFile'
  );
  const archiveImportedFiles = await joplin.settings.value(
    'archiveImportedFiles'
  );
  const archiveImportedFilesTarget = await joplin.settings.value(
    'archiveImportedFilesTarget'
  );
  const tagNewFilesAsNew = await joplin.settings.value('tagNewFilesAsNew');
  const importDuplicates = await joplin.settings.value('importDuplicates');
  const tagNewFilesAsNewWithTag = await joplin.settings.value(
    'tagNewFilesAsNewWithTag'
  );
  const skipPDFBodyText = await joplin.settings.value('skipPDFBodyText');

  return {
    extensionsAddAsText: extensionsAddAsText,
    ignoreFiles: ignoreFiles,
    importPath: importPath,
    importWithFolders: importWithFolders,
    extractTagsFromFile: extractTagsFromFile,
    importRecursiveDepth: importRecursiveDepth,
    importRecursive: importRecursive,
    importNotebook: importNotebook,
    archiveImportedFiles: archiveImportedFiles,
    archiveImportedFilesTarget: archiveImportedFilesTarget,
    tagNewFilesAsNew: tagNewFilesAsNew,
    tagNewFilesAsNewWithTag: tagNewFilesAsNewWithTag,
    importDuplicates: importDuplicates,
    skipPDFBodyText: skipPDFBodyText
  };
}
