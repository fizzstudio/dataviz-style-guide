window.addEventListener('load', () => new AriaListbox());

class AriaListbox extends EventTarget {
  constructor() {
    super();

    this._init();
  }

  /**
   * Initializes the listbox.
   * @private
   * @memberOf module:@fizz/AriaListbox
   */
  _init() {
    const options = document.querySelectorAll('[role=option]');
    for (const option of options) {
      option.addEventListener('click', this._toggleSelectOption.bind(this));
    }
  }

  _toggleSelectOption (event) {
    const option = event.currentTarget;

    // if this is a single-option listbox, unselect all other options
    const component = option.closest('[role=listbox]');
    const isMultiselectable = component.getAttribute('aria-multiselectable');
    if (!JSON.parse(isMultiselectable)) {
      const allOptions = component.querySelectorAll('[role=option]');
      for (const eachOption of allOptions) {
        if (eachOption !== option) {
          eachOption.setAttribute('aria-selected', 'false');
        }
      }      
    }



    // toggle value selection
    const ariaSelected = option.getAttribute('aria-selected');
    const isSelected = (ariaSelected === 'true') ? 'false' : 'true';
    option.setAttribute('aria-selected', isSelected);


    const componentAction = component.dataset.action;
    const componentActionKey = component.dataset.action_key;
    if (componentAction === 'filter') {
      const componentAction = component.dataset.action;
      this._findFilters(component, componentActionKey);
    } else {
      console.log('not a filter');
    }
  }


  _findFilters (component, componentActionKey) {
    const selectedOptions = component.querySelectorAll('[role=option][aria-selected=true]');
    const selectedList = [];
    for (const selectedOption of selectedOptions) {
      const filterValue = selectedOption.dataset[`option_${componentActionKey}`];
      selectedList.push(filterValue);
    }

    this._filterSections(componentActionKey, selectedList);
    // this._filterTOC(componentActionKey, selectedList);
  }

  _filterSections (componentActionKey, selectedList) {
    const allSections = document.querySelectorAll(`[data-${componentActionKey}]`);
    for (const section of allSections) {
      const filterTarget = section.dataset[componentActionKey];
      if (!selectedList.length || selectedList.includes(filterTarget)) {
        section.classList.remove('hide_section');
      } else {
        section.classList.add('hide_section');
      }
    }
  }


  _filterTOC (componentActionKey, selectedList) {
    const allListItems = document.querySelectorAll(`[data-${componentActionKey}_toc]`);
    for (const listItem of allListItems) {
      const filterTarget = listItem.dataset[componentActionKey];
      if (!selectedList.length || selectedList.includes(filterTarget)) {
        listItem.classList.remove('hide_item');
      } else {
        listItem.classList.add('hide_item');
      }
    }
  }

}
