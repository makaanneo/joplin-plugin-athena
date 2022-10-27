import 'reflect-metadata';
import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { iDirectoryMonitoreWorker } from './worker';
import { myContainer } from './inversify.config';
import { TYPES } from './types';
import { register } from './settings/settings';
import {
  athenaConfiguration,
  iAthenaConfiguration
} from './settings/athenaConfiguration';

joplin.plugins.register({
  onStart: async () => {
    console.info('Athena plugin started!');
    // register settings
    await register();

    const settings = myContainer.get<iAthenaConfiguration>(
      TYPES.iAthenaConfiguration
    );
    let directoryMonitore: iDirectoryMonitoreWorker;
    await settings.initilize();

    directoryMonitore = myContainer.get<iDirectoryMonitoreWorker>(
      TYPES.iDirectoryMonitoreWorker
    );

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
  }
});
