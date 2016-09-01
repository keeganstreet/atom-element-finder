# Element Finder package for Atom

> Find in HTML files with CSS selectors.

Element Finder searches through the HTML files in your project for any given CSS selector, and provides a list of the elements matching that selector. You can then double-click on the result to jump straight to that line in the HTML file.

To start, right-click on a folder in Tree View, and select "Find Elements in Directory".

![Element Finder in action](/styles/screenshot.gif?raw=true)

## Settings

### File patterns

By default, Element Finder searches through files with an extension of `.html`, `.htm`, `.shtml` and `.erb`. You can edit this setting to include other files. But these files will need to contain HTML-like content to be parsed properly.

### Exclude VCS Ignored Files

This setting tells Element Finder to exclude files that are ignored by the version control system, for example anything in the `.gitignore` file.

### Exclude Ignored Names

This setting tells Element Finder to exclude files that are set to be ignored in the Atom core config.
