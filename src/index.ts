import 'reflect-metadata';
import joplin from 'api';
import { ContentScriptType, MenuItemLocation } from 'api/types';
import { iDirectoryMonitoreWorker } from './worker';
import { myContainer } from './inversify.config';
import { TYPES } from './types';
import { register } from './settings/settings';
import {
  athenaConfiguration,
  iAthenaConfiguration
} from './settings/athenaConfiguration';
import { ContextMsg, ContextMsgType } from './common';
import { iMigrateFileImportFormatV1toV2 } from './core/migrateFileImportFormatV1toV2';
import { iMigrateExistingResourceToDocumentNote } from './core/migrateExistingResourceToDocumentNote';

joplin.plugins.register({
  onStart: async () => {
    console.info('Athena plugin started!');
    // register settings
    await register();

    const settings = myContainer.get<iAthenaConfiguration>(
      TYPES.iAthenaConfiguration
    );
    await settings.initilize();
    const directoryMonitore = myContainer.get<iDirectoryMonitoreWorker>(
      TYPES.iDirectoryMonitoreWorker
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any
    joplin.settings.onChange(async (event: any) => {
      console.log('Settings changed');
      if (await settings.verify()) {
        await settings.initilize();
        await directoryMonitore.removeWatcher();
        await directoryMonitore.watchDirectory();
      }
    });

    // register business logic
    console.info('Athena plugin start watching!');
    myContainer.snapshot();
    myContainer.unbind(TYPES.iAthenaConfiguration);
    myContainer
      .bind<iAthenaConfiguration>(TYPES.iAthenaConfiguration)
      .to(athenaConfiguration)
      .inSingletonScope();
    myContainer.restore();

    if (await settings.verify()) {
      await directoryMonitore.removeWatcher();
      await directoryMonitore.watchDirectory();
    }

    if (settings.Values.frontMatterRenderRule) {
      await joplin.contentScripts.register(
        ContentScriptType.MarkdownItPlugin,
        'enhancement_front_matter',
        './driver/markdownItRuler/frontMatter/index.js'
      );
    }

    await joplin.commands.register({
      name: 'foldPlugin',
      label: 'Fold all ',
      execute: async () => {
        await joplin.commands.execute('editor.execCommand', {
          name: 'foldPlugin',
          args: []
        });
      }
    });

    await joplin.commands.register({
      name: 'unfoldPlugin',
      label: 'Unfold all ',
      execute: async () => {
        await joplin.commands.execute('editor.execCommand', {
          name: 'unfoldPlugin',
          args: []
        });
      }
    });

    await joplin.commands.register({
      name: 'migrateNoteFromV1ToV2',
      label: 'Athena: Migrate from file import version V1 to V2.',
      execute: async (noteIds: string[]) => {
        const notes = [];
        for (const noteId of noteIds) {
          notes.push(await joplin.data.get(['notes', noteId]));
        }

        const migrator = myContainer.get<iMigrateFileImportFormatV1toV2>(
          TYPES.iMigrateFileImportFormatV1toV2
        );

        notes.forEach((note) => {
          console.log(`START: Migrate of note ${note.title}`);
          migrator.migrate(note.id);
          console.log(`END: Migrate of note ${note.title}`);
        });
      }
    });
    await joplin.commands.register({
      name: 'importAttachedResourceAppendToNote',
      label: 'Athena: Append note attachment to documentNote. (Beta)',
      execute: async (noteIds: string[]) => {
        const notes = [];
        for (const noteId of noteIds) {
          notes.push(await joplin.data.get(['notes', noteId]));
        }

        const migrator =
          myContainer.get<iMigrateExistingResourceToDocumentNote>(
            TYPES.iMigrateExistingResourceToDocumentNote
          );

        notes.forEach((note) => {
          console.log(`START: Import to document note ${note.title}`);
          migrator.migrate(note.id, false);
          console.log(`END: Import to document note ${note.title}`);
        });
      }
    });

    await joplin.commands.register({
      name: 'importAttachedResourceOverrideNoteBodyOfNote',
      label:
        'Athena: Override note body and add all Attachment to documentNote. (Beta)',
      execute: async (noteIds: string[]) => {
        const notes = [];
        for (const noteId of noteIds) {
          notes.push(await joplin.data.get(['notes', noteId]));
        }

        const migrator =
          myContainer.get<iMigrateExistingResourceToDocumentNote>(
            TYPES.iMigrateExistingResourceToDocumentNote
          );

        notes.forEach((note) => {
          console.log(`START: Import to document note ${note.title}`);
          migrator.migrate(note.id, true);
          console.log(`END: Import to document note ${note.title}`);
        });
      }
    });

    await joplin.views.menuItems.create(
      'migrateNoteFromV1ToV2Context',
      'migrateNoteFromV1ToV2',
      MenuItemLocation.NoteListContextMenu
    );
    await joplin.views.menuItems.create(
      'importAttachedResourceAppendToNoteContext',
      'importAttachedResourceAppendToNote',
      MenuItemLocation.NoteListContextMenu
    );
    await joplin.views.menuItems.create(
      'importAttachedResourceOverrideNoteBodyOfNoteContext',
      'importAttachedResourceOverrideNoteBodyOfNote',
      MenuItemLocation.NoteListContextMenu
    );
    await joplin.views.menuItems.create(
      'foldAllMenuItem',
      'foldPlugin',
      MenuItemLocation.Tools,
      { accelerator: 'CmdOrCtrl+Alt+F' }
    );
    await joplin.views.menuItems.create(
      'unfoldAllMenuItem',
      'unfoldPlugin',
      MenuItemLocation.Tools,
      { accelerator: 'CmdOrCtrl+Alt+U' }
    );

    if (settings.Values.codemirrorFrontMatter) {
      console.log('Load codemirror contentscript.');
      await joplin.contentScripts.register(
        ContentScriptType.CodeMirrorPlugin,
        'athena-codemirror',
        './driver/codemirror/frontmatter/index.js'
      );

      await joplin.contentScripts.onMessage(
        'athena-codemirror',
        async (msg: ContextMsg) => {
          if (msg.type === ContextMsgType.GET_SETTINGS) {
            return settings;
          }
        }
      );
    }
  }
});
