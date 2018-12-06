# Tab-Indent Space-Align

An extension for those who know the difference between indentation and
alignment.

## Features

This extension provides VSCode editor support for using tabs as indentation but
spaces for alignment.

* Entering a newline will copy the indentation and any alignment from the
  previous line.
* Pressing tab within the indentation will insert a tab, otherwise it will
  insert spaces.
* Block indenting and outdenting will only add/remove leading tabs.
* Full support for multiple selections.

There is nothing to configure, just enable the plugin and benefit!

## Known Issues

* Auto-indentation upon entering a newline is not yet implemented.
* Pressing tab for alignment always inserts 4 spaces, without considering
  tabstops.

## Release Notes

### 0.0.1

Initial release with basic functionality for alignment preserving indent,
outdent and newline.
