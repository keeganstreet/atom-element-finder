'use babel';

import ElementFinderView from './element-finder-view';
import { CompositeDisposable } from 'atom';
import utils from './element-finder-utils';
import elfinder from 'elfinder';

export default {

  elementFinderView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.elementFinderView = new ElementFinderView(state.elementFinderViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.elementFinderView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'element-finder:begin': (event) => this.showDialog(event),
      'element-finder:confirm': () => this.confirm(),
      'element-finder:cancel': () => this.hideDialog()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.elementFinderView.destroy();
  },

  serialize() {
    return {
      elementFinderViewState: this.elementFinderView.serialize()
    };
  },

  confirm() {
    const input = this.elementFinderView.model.getText();
    this.hideDialog();
    utils.loadIgnoredPatterns();
    utils.loadFilePatterns();
    const files = utils.filesInDirectory();

    elfinder({
      selector: input,
      files: files
    }, function(info) {
      console.log(info);
    });
  },

  showDialog(event) {
    utils.setDirectoryPath(event.target);
    this.modalPanel.show();
    this.elementFinderView.focus();
  },

  hideDialog() {
    this.modalPanel.hide();
  }
};
