# Athena

[![build](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml/badge.svg)](https://github.com/makaanneo/joplin-plugin-athena/actions/workflows/ci.yml)

Athena is an open-source plugin. You can use the plugin to manage your PDFs with the power of Joplin and cary all your documents inside your pocket.

The plugin in currently under development and in beta stage. You can specify a folder and start importing files from this folder into your joplin notebooks. For PDFs it will extract the text inside the pdf and place it as a comment inside of the note.

## Usage

Setup like on the screenshot.

![Image](assets/JoplinOptions.png)

## Misc

This plugin is still in beta phase.

## License

[MIT](LICENSE.md)

## Development

During my development I decided to upgrade webpack to the latest version. The webpack config is changed heaviely.
and [how to build](GENERATOR_DOC.md)

### webpack

For this plugin webpack is updated to version 5. the [webpackconfig](webpack.config.js) is configured accordingy.