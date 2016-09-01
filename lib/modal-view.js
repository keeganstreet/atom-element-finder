'use babel';

export default class ModalView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('element-finder');

    const label = document.createElement('label');
    label.textContent = 'Find elements matching CSS selector:';
    this.element.appendChild(label);

    this.input = document.createElement('atom-text-editor');
    this.input.setAttribute('mini', '');
    this.element.appendChild(this.input);

    this.model = this.input.getModel();
    this.model.setGrammar(atom.grammars.grammarForScopeName('source.css'));
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  focus() {
    this.model.selectAll();
    this.input.focus();
  }

  getElement() {
    return this.element;
  }
};
