# Athena

[![build](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml/badge.svg)](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml)

Athena is an open-source plugin. You can use the plugin to manage your PDFs with the power of Joplin and cary all your documents inside your pocket.

The plugin in currently under development and in beta stage. You can specify a folder and start importing files from this folder into your joplin notebooks. For PDFs it will extract the text inside the pdf and place it as a comment inside of the note.

Due to the fact that the PDF text and metadata are stored inside the note they as well available on all platforms.

## Usage

Fill in the required values for the options.
![Image](assets/JoplinOptions.png)

And copy PDF files inside the import path to start working.

## How it works
These plugin imort files from certain folders, specified inside the settings. For pdf files it will extract some meta data if there as well as text stored inside the pdf (OCR must be done by the scanner application) and stores the text inside a comment block of the note itself.

```xml
<!--
PDFMETADATATEXTSTART
CreationDate: 2022-01-01T11:11:11.000Z

PDFMETADATATEXTEND
PDFCONTENTTEXTSTART
some text
PDFCONTENTTEXTEND
FILEHASHSTART
FILEHASHEND
-->
<!--
FILEHASHSTART
d99111f398d7e3lot0481ce53748ac6e095f6700610f5601900d6f1edb563553b0df463dd325abe4e41d278a849658f087b2b1246fkdbaea5c9acac05d59cd78d59
FILEHASHEND
-->
```

### duplication detection
The import handels as well duplicates before the file will be imported into joplin. For this the file is loaded and a SHA256 hashcode will be calculated and looked up if there is any note with the same filehash in comments.

## Further imporvements
For the time being the meta data of files is stored inside the note as comment blocks. May it could be stored somewhere in the future somewhere else.

## Roadmap

- [x] Research on better location for metadata and pdf text
- [ ] Show import status in a status bar with progress
- [ ] Improve tag handling on import (will be moved to other plugin)
- [ ] Integrate OCR
~~ - [ ] Integrate Import of already existing Resources (attached to notes)~~
- [x] Build on export of files to a special folder for backups (archive directory)
~~ - [ ] Handle email attachments (other plugin)~~
- [ ] and a lot more

## Misc

This plugin is still in beta phase.

Any PR / Issue / Discussion is welcome!

## License

[MIT](LICENSE.md)

## Thanks

Basically, this plugin is inspired by:

- [Resource Search Plugin](https://github.com/roman-r-m/joplin-plugin-resource-search)
- [Hotfolder](https://github.com/JackGruber/joplin-plugin-hotfolder)

## Development

During my development I decided to upgrade webpack to the latest version. The webpack config is changed heaviely.
and [how to build](GENERATOR_DOC.md)

### webpack

For this plugin webpack is updated to version 5. the [webpackconfig](webpack.config.js) is configured accordingly.
