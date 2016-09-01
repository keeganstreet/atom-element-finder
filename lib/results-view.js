'use babel';

import Mustache from 'mustache';

export default class ResultsView {
  constructor() {
    this.element = document.createElement('div');
    this.element.classList.add('element-finder-results', 'pane-item');

    const panelHeading = document.createElement('div');
    panelHeading.classList.add('panel-heading');

    this.panelHeadingSpinner = document.createElement('div');
    this.panelHeadingSpinner.classList.add('loading', 'loading-spinner-tiny', 'inline-block');
    panelHeading.appendChild(this.panelHeadingSpinner);

    this.panelHeadingText = document.createElement('div');
    this.panelHeadingText.textContent = 'Finding elements';
    this.panelHeadingText.classList.add('inline-block');
    panelHeading.appendChild(this.panelHeadingText);

    this.element.appendChild(panelHeading);

    this.resultsView = document.createElement('ol');
    this.resultsView.classList.add('results-view', 'list-tree', 'focusable-panel', 'has-collapsable-children');
    this.resultsView.setAttribute('tabindex', '-1');
    this.element.appendChild(this.resultsView);

    const noResultsOverlay = document.createElement('ul');
    noResultsOverlay.classList.add('centered', 'background-message', 'no-results-overlay');
    noResultsOverlay.innerHTML = '<li>No Results</li>';
    this.element.appendChild(noResultsOverlay);
  }

  getTitle() {
    return 'Element Finder Results';
  }

  getIconName() {
    return 'search';
  }

  serialize() {}

  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  processResult(result) {
    if (result.status === 'countedFiles') {
      this.panelHeadingText.innerHTML = Mustache.render('Searching for <span class="highlight-info">{{selector}}</span> in {{numberOfFiles}} files.', result);
    } else if (result.status === 'foundMatch') {
      const matchHtml = Mustache.render(`<li class="path list-nested-item">
        <div class="path-details list-item">
          <span class="disclosure-arrow"></span>
          <span class="icon-file-text icon"></span>
          <span class="path-name bright">{{path}}</span>
          <span class="path-match-number">({{matches}})</span>
        </div>
        <ul class="matches list-tree">
          {{#matchesDetails}}
            <li class="search-result list-item" data-line="{{line}}" data-column="{{column}}">
              <span class="line-number text-subtle">{{line}}:{{column}}</span>
              <span class="preview"><span>{{html}}</span></span>
            </li>
          {{/matchesDetails}}
        </ul>
      </li>`, result);

      const ol = document.createElement('ol');
      ol.innerHTML = matchHtml;

      const li = ol.firstChild;
      const heading = li.querySelector('.path-details');
      const matches = li.querySelector('.matches');

      heading.addEventListener('click', function() {
        matches.classList.toggle('hidden');
        li.classList.toggle('collapsed');
      });

      const searchResult = matches.querySelectorAll('.search-result');
      Object.keys(searchResult).forEach(key => {
        const item = searchResult[key];
        item.addEventListener('dblclick', function() {
          atom.workspace.open(result.file, {
            initialLine: parseInt(item.dataset.line, 10) - 1,
            initialColumn: parseInt(item.dataset.column, 10) - 1
          });
        });
      });

      this.resultsView.appendChild(li);
    } else if (result.status === 'complete') {
      if (result.totalMatches === 0) {
        this.panelHeadingText.innerHTML = Mustache.render('No results found for <span class="highlight-info">{{selector}}</span>.', result);
        this.element.classList.add('no-results');
      } else {
        this.panelHeadingText.innerHTML = Mustache.render('{{totalMatches}} results found in {{numberOfFilesWithMatches}} files for <span class="highlight-info">{{selector}}</span>.', result);
      }
      this.panelHeadingSpinner.style.display = 'none';
    }
  }
};
