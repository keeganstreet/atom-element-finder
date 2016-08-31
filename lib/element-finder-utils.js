'use babel';

import fs from 'fs';
import path from 'path';
import { Minimatch } from 'minimatch';

export default {

  directoryPath: null,
  ignoredPatterns: [],
  filePatterns: [],

  setDirectoryPath(element) {
    let elementPath;

    try {
      elementPath = (element.dataset.path ? element.dataset.path : element.querySelector('[data-path]').dataset.path);
    } catch(error) {
      elementPath = atom.workspace.getActiveTextEditor().getPath();
    }

    // Traverse up the DOM if the element and its children don't have a path
    if (!elementPath) {
      while(element != null) {
        elementPath = element.dataset.path;
        if (elementPath) {
          break;
        }
        element = element.parentElement;
      }
      // Use the active editor path if all elements don't have a path
      if (!elementPath) {
        elementPath = atom.workspace.getActiveTextEditor().getPath();
      }
    }

    if (fs.statSync(elementPath).isFile()) {
      this.directoryPath = path.dirname(elementPath);
    } else {
      this.directoryPath = elementPath;
    }
  },

  loadIgnoredPatterns() {
    this.ignoredPatterns = [];

    if (!atom.config.get('element-finder.excludeIgnoredNames')) {
      return;
    }

    let ignoredNames = atom.config.get('core.ignoredNames') || [];

    if (typeof ignoredNames === 'string') {
      ignoredNames = [ignoredNames];
    }

    ignoredNames = ignoredNames.filter((ignoredName) => ignoredName);
    ignoredNames = ignoredNames.map((ignoredName) => {
      try {
        return this.ignoredPatterns.push(new Minimatch(ignoredName, {matchBase: true, dot: true}));
      } catch(error) {
        return atom.notifications.addWarning(`Error parsing ignore pattern (${ignoredName})`, {detail: error.message});
      }
    });
  },

  loadFilePatterns() {
    this.filePatterns = [];

    let filePatterns = atom.config.get('element-finder.filePatterns') || [];

    if (typeof filePatterns === 'string') {
      filePatterns = [filePatterns];
    }

    filePatterns = filePatterns.filter((filePattern) => filePattern);
    filePatterns = filePatterns.map((filePattern) => {
      try {
        return this.filePatterns.push(new Minimatch(filePattern, {matchBase: true, dot: true}));
      } catch(error) {
        return atom.notifications.addWarning(`Error parsing file pattern (${filePattern})`, {detail: error.message});
      }
    });
  },

  repoForPath(goalPath) {
    let iterable = atom.project.getPaths();

    for (let i = 0; i < iterable.length; i++) {
      let projectPath = iterable[i];
      if (goalPath === projectPath || goalPath.indexOf(projectPath + path.sep) === 0) {
        return atom.project.getRepositories()[i];
      }
    }

    return null;
  },

  isPathIgnored(filePath) {
    if (atom.config.get('element-finder.excludeVcsIgnoredFiles')) {
      let repo = this.repoForPath(this.directoryPath);
      if ((repo != null) && repo.isProjectAtRoot() && repo.isPathIgnored(filePath)) {
        return true;
      }
    }

    if (atom.config.get('element-finder.excludeIgnoredNames')) {
      for (let i = 0; i < this.ignoredPatterns.length; i += 1) {
        let ignoredPattern = this.ignoredPatterns[i];
        if (ignoredPattern.match(filePath)) {
          return true;
        }
      }
    }

    return false;
  },

  isFilePatternValid: function(filePath) {
    for (let i = 0; i < this.filePatterns.length; i += 1) {
      let filePattern = this.filePatterns[i];
      if (filePattern.match(filePath)) {
        return true;
      }
    }
    return false;
  },

  filesInDirectory: function(_directory) {
    let directory = _directory || this.directoryPath,
        results = [],
        names = fs.readdirSync(directory);

    names = names.map(name => directory + path.sep + name);
    names = names.filter(name => !this.isPathIgnored(name));

    names.forEach(name => {
      if (fs.statSync(name).isDirectory()) {
        results = results.concat(this.filesInDirectory(name));
      } else if (fs.statSync(name).isFile()) {
        if (this.isFilePatternValid(name)) {
          results.push(name);
        }
      }
    });

    return results;
  }

};
