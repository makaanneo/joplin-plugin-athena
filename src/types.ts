// file types.ts

const TYPES = {
  iDirectoryMonitoreWorker: Symbol.for('iDirectoryMonitoreWorker'),
  iArchiveFile: Symbol.for('iArchiveFile'),
  iFileExtensions: Symbol.for('iFileExtensions'),
  iFileNameTokenizer: Symbol.for('iFileNameTokenizer'),
  iAthenaConfiguration: Symbol.for('iAthenaConfiguration'),
  iMimeTypeHandler: Symbol.for('iMimeTypeHandler'),
  iFileTypeHandler: Symbol.for('iFileTypeHandler'),
  iPdf: Symbol.for('iPdf'),
  iFileTypeProcessor: Symbol.for('iFileTypeProcessor'),
  iFileTypeHandlerFactory: Symbol.for('iFileTypeHandlerFactory'),
  iJoplinNoteBuilder: Symbol.for('iJoplinNoteBuilder'),
  iJoplinApiBc: Symbol.for('iJoplinApiBc'),
  iJoplinNoteProcessor: Symbol.for('iJoplinNoteProcessor'),
  iDefaultFileHandler: Symbol.for('iDefaultFileHandler'),
  iJoplinTagProcessor: Symbol.for('iJoplinTagProcessor'),
  iJoplinFolderProcessor: Symbol.for('iJoplinFolderProcessor')
};

export { TYPES };
