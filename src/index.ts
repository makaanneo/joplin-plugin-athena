import joplin from 'api';
import * as settings from './settings/settings';
import { watchAndImport } from './importer';
import { ContentScriptType } from 'api/types';
import { ENABLE_DOCUMENT_FOLDER, ENABLE_CODE_FOLD } from './common';

joplin.plugins.register({
  onStart: async function () {
    console.info('Athena plugin started!');
    // register settings
    await settings.register();
    const documentFolder = await joplin.settings.value(ENABLE_DOCUMENT_FOLDER);
    const enableCodeFolder = await joplin.settings.value(ENABLE_CODE_FOLD);

    if (enableCodeFolder) {
      // register extra scripts
      await joplin.contentScripts.register(
        ContentScriptType.CodeMirrorPlugin,
        'markdownFolding',
        './driver/codemirror/fold/markdownFolding.js'
      );
    }

    if (documentFolder) {
      await joplin.contentScripts.register(
        ContentScriptType.CodeMirrorPlugin,
        'athena_document_folder',
        './driver/codemirror/documentFolder/index.js'
      );
    }

    const watcher = new watchAndImport();
    console.log(await settings.getImportSettings());
    joplin.settings.onChange(async (event: any) => {
      console.log('Settings changed');
      await watcher.initialize(); // refreshes as well settings in object.
      await watcher.watchDirectory();
    });
    // register business logic
    console.info('Athena plugin start watching!');
    await watcher.initialize();
    await watcher.watchDirectory();
  }
});
