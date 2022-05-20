import DocumentFolder from './documentFolder';

module.exports = {
  default: function (_context) {
    return {
      plugin: function (CodeMirror) {
        CodeMirror.defineOption(
          'documentFolder',
          [],
          async function (cm, val, old) {
            await new DocumentFolder(_context, cm);
          }
        );
      },
      codeMirrorOptions: { documentFolder: true },
      assets: function () {
        return [];
      }
    };
  }
};
