'use babel';

import ModalView from './modal-view';
import ResultsView from './results-view';
import { CompositeDisposable } from 'atom';
import utils from './utils';
import elfinder from 'elfinder';

export default {
  modalView: null,
  resultsView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    // Create modal
    this.modalView = new ModalView();
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.modalView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles the modal
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'element-finder:begin': (event) => this.showDialog(event)
    }));

    this.onKeyupBindThis = this.onKeyup.bind(this);
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.modalView.destroy();
    document.body.removeEventListener('keyup', this.onKeyupBindThis);
  },

  serialize() {},

  onKeyup(e) {
    if (e.which === 27) {
      // Escape
      this.hideDialog();
    } else if (e.which === 13) {
      // Enter
      this.search();
    }
  },

  onKeyupBindThis: null,

  showDialog(event) {
    utils.setDirectoryPath(event.target);
    this.modalPanel.show();
    this.modalView.focus();
    document.body.removeEventListener('keyup', this.onKeyupBindThis);
    document.body.addEventListener('keyup', this.onKeyupBindThis);
  },

  hideDialog() {
    this.modalPanel.hide();
    document.body.removeEventListener('keyup', this.onKeyupBindThis);
  },

  search() {
    this.hideDialog();
    utils.loadIgnoredPatterns();
    utils.loadFilePatterns();

    const input = this.modalView.model.getText();
    const files = utils.filesInDirectory();
    const pane = atom.workspace.getCenter().getActivePane();

    if (this.resultsView) {
        pane.destroyItem(this.resultsView);
    }

    this.resultsView = new ResultsView();
    pane.activateItem(pane.addItem(this.resultsView));

    elfinder({
      selector: input,
      files: files
    }, result => {
      if (result.file) {
        result.path = atom.project.relativizePath(result.file)[1];
      }
      this.resultsView.processResult(result);
    });
  }
};
