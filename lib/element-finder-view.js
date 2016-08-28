'use babel';

export default class ElementFinderView {

  constructor(serializedState) {
    this.element = document.createElement('div');
    this.element.classList.add('element-finder');

    const label = document.createElement('label');
    label.textContent = 'Find elements matching CSS selector:';
    this.element.appendChild(label);

    this.input = document.createElement('atom-text-editor');
    this.input.setAttribute('mini', '');
    this.model = this.input.getModel();
    this.element.appendChild(this.input);
    // Apply CSS syntax highlighting to the input field
    this.model.setGrammar(atom.grammars.grammarForScopeName('source.css'));
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  focus() {
    this.input.focus();
  }

  getElement() {
    return this.element;
  }

}
