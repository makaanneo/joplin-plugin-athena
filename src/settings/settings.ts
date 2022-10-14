import joplin from 'api';
import { SettingItemType } from 'api/types';
import type { pluginSettings } from './pluginSettings';

export async function register(): Promise<void> {
  await joplin.settings.registerSection('importerSection', {
    label: 'Athena',
    iconName: 'fas fa-file-import',
    description:
      `♾️ Imports files into joplin by monitoring a specific folder. ♾️

      It will do not OCR the PDFs for you but will extract existing text from the PDF and will bring it to the global search of joplin.

			Feel free to show some ⭐-love, create an issue (https://github.com/makaanneo/joplin-plugin-athena) if you run into issues.`
  });

  await joplin.settings.registerSettings({
    importPath: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Monitore Directory (for import)',
      description: 'Directory to monitor for import new files.'
    },
    importNotebook: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Import into Notebook',
      description:
        'If no notebook is specified, the import is made to the current notebook.'
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
      label: 'Directe import as text.',
      description:
        'Comma separated list of file extensions, which will be imported as text. Like *.md or *.txt.'
    },
    archiveImportedFiles: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Archive imported files',
      description:
        'Move files after import into seperate folder with sub folder per year.',
      advanced: false
    },
    archiveImportedFilesTarget: {
      value: '',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Archive imported files target',
      description:
        'Move files after import into seperate folder with sub folder per year.',
      advanced: false
    },
    tagNewFilesAsNew: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Add tags to imported files',
      description:
        'Tag new files automatically with a special tag to identify for later processing.',
      advanced: false
    },
    tagNewFilesAsNewWithTag: {
      value: 'document: new_file',
      type: SettingItemType.String,
      section: 'importerSection',
      public: true,
      label: 'Tag imported file with value',
      description:
        'Tag new files automatically with a special tag to identify for later processing.',
      advanced: false
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
    },
    frontMatterRender: {
      value: false,
      type: SettingItemType.Bool,
      section: 'importerSection',
      public: true,
      label: 'Enable front matter markdown-it rule',
      description: 'It just ignores the front matter instead of rendering them as content between two lines. It is used to allow other plugins can take use of the front matter without breaking the rendered html. (requires restart)',
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
  const frontMatterRender = await joplin.settings.value('frontMatterRender');

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
    skipPDFBodyText: skipPDFBodyText,
    frontMatterRender: frontMatterRender
  };
}
