# Athena

[![build](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml/badge.svg)](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml)

Athena is an open-source plugin. You can use the plugin to manage your PDFs with the power of Joplin and cary all your documents inside your pocket.

The plugin in currently under development and in beta stage. You can specify a folder and start importing files from this folder into your joplin notebooks. For PDFs it will extract the text inside the pdf and place it as a comment inside of the note.

## Usage

Fill in the required values for the options.
![Image](assets/JoplinOptions.png)

And copy PDF files inside the import path to start working.

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
