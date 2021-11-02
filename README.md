# Joplin Plugin paperless importer

## Special Thanks to

- [JackGruber joplin Plugin hotfolder](https://github.com/JackGruber/joplin-plugin-hotfolder) base for import logic.
- [roman-r-m joplin plugin resource search](https://github.com/roman-r-m/joplin-plugin-resource-search) base for pdf scan.

## Purpose

The Idea behind this plugin to turn Joplin in a working paperless solution.

## Roadmap

- [ ] Scan already OCR(ed) PDFs for text and import as fulltext search entities (notes with comment text)
- [ ] Archive imported PDFs in a date based folder structure like (yyyy/mm)
- [ ] Support for PDF metadata like keywords
- [ ] OCR new added PDFs/Images

### File formats

#### PDF

PDFs will be imported as resource without OCR. If there is already text inside the PDF it will be imported as text into the note as comment. The pdf file will be attached as resource to the note.

- Text gets imported as comment in a new joplin note
- keywords can be transformed into joplin tags

#### text based (such as.txt, .md)

You can specify some file formats which could be imported as plain text. Currently there is a text to note logic implemented (no transform step).

#### other

All other formats will be imported as Resource to a note with a link to the resource.

## Settings

## Development

### webpack

For this plugin webpack is updated to version 5. the webpackconfig is configured accordingy.
