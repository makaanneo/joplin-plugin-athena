// file inversify.config.ts

import { Container } from 'inversify';
import { fileExtensions, iFileExtensions } from './core/fileExtensions';
import {
  fileTypeHandlerFactory,
  iFileTypeHandlerFactory
} from './core/fileTypeHandlerFactory';
import {
  fileTypeProcessor,
  iFileTypeProcessor
} from './core/fileTypeProcessor';
import {
  iJoplinNoteBuilder,
  joplinNoteBuilder
} from './core/joplinNoteBuilder';
import { archiveFile, iArchiveFile } from './core/archiveFile';
import {
  fileNameTokenizer,
  iFileNameTokenizer
} from './file_handler/file_name_tokenizer';
import { iPdf, pdf } from './pdf/pdf';
import {
  athenaConfiguration,
  iAthenaConfiguration
} from './settings/athenaConfiguration';
import { TYPES } from './types';
import { iDirectoryMonitoreWorker, directoryMonitoreWorker } from './worker';
import {
  iJoplinNoteProcessor,
  joplinNoteProcessor
} from './core/joplinNoteProcessor';
import { iFileTypeHandler } from './core/typeHandlerBase';
import { pdfTypeHandler } from './core/pdfTypeHandler';
import {
  defaultFileHandler,
  iDefaultFileHandler
} from './core/defaultFileHandler';
import { plainTextFileHandler } from './core/plainTextFileHandler';
import { iJoplinApiBc, joplinApiBc } from './core/joplinApiBc';
import {
  iJoplinTagProcessor,
  joplinTagProcessor
} from './core/joplinTagProcessor';
import {
  iJoplinFolderProcessor,
  joplinFolderProcessor
} from './core/joplinFolderProcessor';
import {
  iMigrateFileImportFormatV1toV2,
  migrateFileImportFormatV1toV2
} from './core/migrateFileImportFormatV1toV2';
import {
  iMigrateExistingResourceToDocumentNote,
  migrateExistingResourceToDocumentNote
} from './core/migrateExistingResourceToDocumentNote';
import { iJoplinAttachment, joplinAttachment } from './core/joplinAttachment';

const dIContainer = new Container();
dIContainer
  .bind<iAthenaConfiguration>(TYPES.iAthenaConfiguration)
  .to(athenaConfiguration)
  .inSingletonScope();
dIContainer
  .bind<iDirectoryMonitoreWorker>(TYPES.iDirectoryMonitoreWorker)
  .to(directoryMonitoreWorker)
  .inSingletonScope();
dIContainer.bind<iArchiveFile>(TYPES.iArchiveFile).to(archiveFile);
dIContainer.bind<iFileExtensions>(TYPES.iFileExtensions).to(fileExtensions);
dIContainer
  .bind<iJoplinNoteBuilder>(TYPES.iJoplinNoteBuilder)
  .to(joplinNoteBuilder);
dIContainer.bind<iPdf>(TYPES.iPdf).to(pdf);
dIContainer
  .bind<iFileTypeHandlerFactory>(TYPES.iFileTypeHandlerFactory)
  .to(fileTypeHandlerFactory);
dIContainer.bind<iJoplinApiBc>(TYPES.iJoplinApiBc).to(joplinApiBc);
dIContainer.bind<iFileTypeHandler>(TYPES.iFileTypeHandler).to(pdfTypeHandler);
dIContainer
  .bind<iDefaultFileHandler>(TYPES.iDefaultFileHandler)
  .to(defaultFileHandler);
dIContainer
  .bind<iFileTypeHandler>(TYPES.iFileTypeHandler)
  .to(defaultFileHandler);
dIContainer
  .bind<iFileTypeHandler>(TYPES.iFileTypeHandler)
  .to(plainTextFileHandler);
dIContainer
  .bind<iFileTypeProcessor>(TYPES.iFileTypeProcessor)
  .to(fileTypeProcessor);
dIContainer
  .bind<iFileNameTokenizer>(TYPES.iFileNameTokenizer)
  .to(fileNameTokenizer);
dIContainer
  .bind<iJoplinNoteProcessor>(TYPES.iJoplinNoteProcessor)
  .to(joplinNoteProcessor);
dIContainer
  .bind<iJoplinTagProcessor>(TYPES.iJoplinTagProcessor)
  .to(joplinTagProcessor);
dIContainer
  .bind<iJoplinFolderProcessor>(TYPES.iJoplinFolderProcessor)
  .to(joplinFolderProcessor);
dIContainer
  .bind<iMigrateFileImportFormatV1toV2>(TYPES.iMigrateFileImportFormatV1toV2)
  .to(migrateFileImportFormatV1toV2);
dIContainer
  .bind<iMigrateExistingResourceToDocumentNote>(
    TYPES.iMigrateExistingResourceToDocumentNote
  )
  .to(migrateExistingResourceToDocumentNote);
dIContainer
  .bind<iJoplinAttachment>(TYPES.iJoplinAttachment)
  .to(joplinAttachment);

export { dIContainer as myContainer };
