import joplin from 'api';
import { SettingItemSubType, SettingItemType } from 'api/types';
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
  FILE_HASH_ALGORITHM,
  CODEMIRROR_FRONT_MATTER,
  FOLD_FRONT_MATTER,
  DOCUMENTS_SECTION_HEADER
} from '../common';

export async function register(): Promise<void> {
  console.log('register settings');
  await joplin.settings.registerSection('importerSection', {
    label: 'Athena',
    iconName: 'fas fa-file-import',
    description: `♾️ Imports files into joplin by monitoring a specific folder. ♾️

      It will do not OCR the PDFs for you but will extract existing text from the PDF and will bring it to the global search of joplin.

			Feel free to show some ⭐-love, create an issue (https://github.com/makaanneo/joplin-plugin-athena) if you run into issues.`
  });
  const settings = {};
  settings[IMPORT_PATH] = {
    value: '',
    type: SettingItemType.String,
    subType: SettingItemSubType.DirectoryPath,
    section: 'importerSection',
    public: true,
    label: 'Monitore Directory (for import)',
    description: 'Directory to monitor for import new files.'
  };
  settings[IMPORT_NOTEBOOK] = {
    value: 'Inbox',
    type: SettingItemType.String,
    section: 'importerSection',
    public: true,
    label: 'Import into Notebook',
    description:
      'If no notebook is specified, the import is made to the current notebook.'
  };
  settings[IGNORE_FILES] = {
    value: '**/*.js',
    type: SettingItemType.String,
    section: 'importerSection',
    public: true,
    label: 'Ignore Files',
    description: 'Comma separated list of files which will be ignored.'
  };
  settings[ARCHIVE_IMPORTED_FILES] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Archive imported files',
    description:
      'Move files after import into seperate folder with sub folder per year.',
    advanced: false
  };
  settings[ARCHIVE_TARGET] = {
    value: '',
    type: SettingItemType.String,
    subType: SettingItemSubType.DirectoryPath,
    section: 'importerSection',
    public: true,
    label: 'Archive imported files target',
    description:
      'Move files after import into seperate folder with sub folder per year.',
    advanced: false
  };
  settings[TAG_NEW_FILES] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Add tags to imported files',
    description:
      'Tag new files automatically with a special tag to identify for later processing.',
    advanced: false
  };
  settings[TAG_NEW_FILES_TAGS] = {
    value: 'paperless: document: new_file',
    type: SettingItemType.String,
    section: 'importerSection',
    public: true,
    label: 'Tag imported file with value',
    description:
      'Tag new files automatically with a special tag to identify for later processing.',
    advanced: false
  };
  settings[EXTRACT_TAGS_FROM_FILE] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: false,
    label: 'Extract Tags from file',
    description:
      'Experiementel: Try to extract tags from file name and pdf file meta data. (Alpha)',
    advanced: true
  };
  settings[IMPORT_RECURSIVE] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Import recursive',
    description: 'Scan sub folders for new files and import as well.',
    advanced: true
  };
  settings[IMPORT_RECURSIVE_DEPTH] = {
    value: 5,
    type: SettingItemType.Int,
    section: 'importerSection',
    public: true,
    label: 'Import recursive depth',
    description: 'Specifies the depth for the recursive import.',
    advanced: true
  };
  settings[IMPORT_DUPLICATE_FILES] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Force import of duplicates',
    description: 'Force import of duplicates.',
    advanced: true
  };
  settings[SKIP_FILE_CONTENT] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Skip PDF Text body import',
    description: 'PDF Text will be skipped on import.',
    advanced: true
  };
  settings[FRONT_MATTER_RENDER_RULE] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Enable front matter markdown-it rule',
    description:
      'It just ignores the front matter instead of rendering them as content between two lines. It is used to allow other plugins can take use of the front matter without breaking the rendered html. (requires restart)',
    advanced: true
  };
  settings[CODEMIRROR_FRONT_MATTER] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Enable front matter codemirror hyligthing.',
    description:
      'It renders the front matter as yaml-frontmatter - only yaml is supported. (requires restart)',
    advanced: true
  };
  settings[FOLD_FRONT_MATTER] = {
    value: false,
    type: SettingItemType.Bool,
    section: 'importerSection',
    public: true,
    label: 'Enable front matter codemirror fold all.',
    description: 'It fold on command front matter as well.',
    advanced: true
  };
  settings[FILE_HASH_ALGORITHM] = {
    value: 'sha512',
    type: SettingItemType.String,
    section: 'importerSection',
    public: true,
    label: 'File hash algorithm',
    description:
      'Algortihm used by crypto to build hash for the imported file. The default value ist sha512',
    advanced: true
  };
  settings[DOCUMENTS_SECTION_HEADER] = {
    value: 'documents',
    type: SettingItemType.String,
    section: 'importerSection',
    public: true,
    label: 'Document section header',
    description: 'Header for document section as level one header.',
    advanced: true
  };
  await joplin.settings.registerSettings(settings);
}
