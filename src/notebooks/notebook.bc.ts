import joplin from 'api';
import type { pluginSettings } from '../settings/pluginSettings';
import * as settings from '../settings/settings';
import type { JoplinNotebook } from './JoplinNotebook';

class notebookBc {
  private _pluginSettings: pluginSettings;
  constructor() {
    this.initialize();
  }

  /**
   * initialize the controller component.
   */
  private async initialize(): Promise<void> {
    try {
      this._pluginSettings = await settings.getImportSettings();
    } catch (error) {
      console.error(error);
    }
  }

  public async getNotebookByName(name: string): Promise<JoplinNotebook> {
    await this.initialize();
    if (typeof name === undefined || name == null || name == '') {
      console.log(`Not value for folder title`);
      return null;
    }

    console.info(`Search for folders: ${name}`);

    const query = await joplin.data.get(['search'], {
      type: 'folder',
      query: name
    });

    if (
      typeof query === undefined ||
      query == null ||
      (query != null && query.length === 0) ||
      typeof query.items[0] === undefined
    ) {
      return null;
    }

    if (query.items.length > 1) {
      console.warn(`Retrieved more then one folder for titel: ${query.length}`);
    }
    const folder = query.items[0];
    console.log(`Retrieved folder ${folder.title}`);
    return folder;
  }
}
export { notebookBc };
