export async function escapeRegExp(str: string): Promise<string> {
  return str.replace(
    /((?<!\\)\\(?![*\\])|(?<!\\)\*|[-[\]{}()+!<=:?./^$|#,])/g,
    '\\$&'
  );
}

export async function match(file: string, pattern: string): Promise<number> {
  let regExp = null;
  let regExpStr = null;

  // pattern1, pattern2, pattern3, ...
  const matchPatterns = pattern.split(/\s*,\s*/);
  for (const check of matchPatterns) {
    if (pattern !== '') {
      // Dot file filter
      if (check === '.*' && file.match(/^\..*$/)) return 1;

      // Text match (RegEx escaped)
      regExpStr = await this.escapeRegExp(check);
      regExp = await this.getRegExp('^' + regExpStr + '$');
      if (file.match(regExp)) return 2;

      // Wildcard match (RegEx escaped, but * converted to .*)
      regExpStr = check.replace(/(?<!\\)\*/g, 'µWILDCARDµ');
      regExpStr = await this.escapeRegExp(regExpStr);
      regExpStr = regExpStr.replace(/µWILDCARDµ/g, '.*');
      regExp = await this.getRegExp('^' + regExpStr + '$');
      if (file.match(regExp)) return 3;
    }
  }

  // Full RegEx
  regExp = await this.getRegExp(pattern);
  if (pattern !== '' && pattern !== '.*' && file.match(regExp)) return 4;

  return 0;
}

export async function getRegExp(str: string): Promise<RegExp> {
  try {
    let regExp = new RegExp(str, 'i');
    if (regExp == undefined) regExp = null;
    return regExp;
  } catch (error) {
    return null;
  }
}
