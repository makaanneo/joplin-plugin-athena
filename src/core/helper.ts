import joplin from 'api';

export async function tagNote(noteId: string, tags: string): Promise<void> {
  let addTags = null;
  console.log(noteId);
  console.log(tags);
  if (tags.trim() !== '') {
    addTags = tags.split(/\s*,\s*/);
  }

  if (addTags != null) {
    for (const tag of addTags) {
      console.debug(`Tag this values: ${tag}`);
      if (tag === '' || tag === null) {
        continue;
      }
      const tagId = await getTagId(tag);

      if (typeof tagId !== undefined && tagId != null && tagId != '') {
        try {
          await joplin.data.post(['tags', tagId, 'notes'], null, {
            id: noteId
          });
        } catch (e) {
          console.error('note tagging error');
          console.error(e);
        }
      }
    }
  }
}

export async function getTagId(tag: string): Promise<string> {
  tag = tag.trim();
  if (typeof tag === undefined || tag == null || tag == '') {
    console.log(`Not value for tag`);
    return '';
  }
  console.info(`search for tags: ${tag}`);
  const query = await joplin.data.get(['tags']);

  console.log(`Look for Tag: ${tag}.`);
  const result = query.filter((x: { title: string }) => x.title == tag);
  let tagId = '';
  if (result.length === 0) {
    console.log(`Tag: ${tag} not found in joplin will create new one.`);
    tagId = (
      await joplin.data.post(['tags'], null, {
        title: tag
      })
    ).id;
  } else {
    tagId = result[0].id;
  }
  return tagId;
}
