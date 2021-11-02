import joplin from 'api';
import * as settings from './settings/settings';
import { watchAndImport } from './importer';
import { ContentScriptType } from 'api/types';

joplin.plugins.register({
  onStart: async function () {
    console.info('Paperless plugin started!');
    // register settings
    await settings.register();

    // register extra scripts
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      'markdownFolding',
      './codeMirror/markdownFolding.js'
    );

    // register business logic
    const plugin = new watchAndImport();
    await plugin.watchDirectory();
  }
});
