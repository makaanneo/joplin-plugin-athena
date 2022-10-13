import joplin from 'api';
import * as settings from './settings/settings';
import { watchAndImport } from './importer';
import { ContentScriptType } from 'api/types';

joplin.plugins.register({
  onStart: async function () {
    console.info('Athena plugin started!');
    // register settings
    await settings.register();

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
