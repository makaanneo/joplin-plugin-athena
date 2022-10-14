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
    let pluginSettings = await settings.getImportSettings();
    console.log();
    joplin.settings.onChange(async (event: any) => {
      console.log('Settings changed');
      await watcher.initialize(); // refreshes as well settings in object.
      await watcher.watchDirectory();
    });
    // register business logic
    console.info('Athena plugin start watching!');
    await watcher.initialize();
    await watcher.watchDirectory();

    if (pluginSettings.frontMatterRender) {
			await joplin.contentScripts.register(
				ContentScriptType.MarkdownItPlugin,
				'enhancement_front_matter',
				'./driver/markdownItRuler/frontMatter/index.js'
			);
		}
  }
});
