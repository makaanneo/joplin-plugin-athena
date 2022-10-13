interface pluginSettings {
  extensionsAddAsText: string;
  ignoreFiles: string;
  importPath: string;
  importWithFolders: boolean;
  extractTagsFromFile: boolean;
  importRecursiveDepth: number;
  importRecursive: boolean;
  importNotebook: string;
  archiveImportedFiles: boolean;
  archiveImportedFilesTarget: string;
  tagNewFilesAsNew: boolean;
  tagNewFilesAsNewWithTag: string;
  importDuplicates: boolean;
  skipPDFBodyText: boolean;
}

export { pluginSettings };
