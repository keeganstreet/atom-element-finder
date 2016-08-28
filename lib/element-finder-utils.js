'use babel';

import fs from 'fs';
import path from 'path';

export default {

  directoryPathForElement(element) {
    var elementPath;

    try {
      elementPath = (element.dataset.path ? element.dataset.path : element.querySelector('[data-path]').dataset.path);
    } catch(e) {
      elementPath = atom.workspace.getActiveTextEditor().getPath();
    }

    // Traverse up the DOM if the element and its children don't have a path
    if (!elementPath) {
      while (element != null) {
        elementPath = element.dataset.path;
        if (elementPath) { break; }
        element = element.parentElement;
      }
      // Use the active editor path if all elements don't have a path
      if (!elementPath) {
        elementPath = atom.workspace.getActiveTextEditor().getPath();
      }
    }

    if (fs.statSync(elementPath).isFile()) {
      return path.dirname(elementPath);
    } else {
      return elementPath;
    }
  }

};
