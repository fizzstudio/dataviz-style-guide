window.addEventListener('load', () => new TableOfContents( 'toc' ) );

class TableOfContents {
  constructor( containerId, hasPermalink = false, hasToplink = false) {
    this.containerId = containerId;
    this.hasPermalink = hasPermalink;
    this.hasToplink = hasToplink;

    this.container = null;
    this.tocExpanderContainer = null;
    this.tocListContainer = null;
    this.menuGroup = null;
    
    this.init();
  }

  async init () {
    this.container = document.getElementById(this.containerId);

    await this._createMenuGroup();
    await this._createTOC();
    this._createToggleButton( 'expand all', 'collapse all' );
  }

  async _createMenuGroup () {
    // create toggle
    this.menuGroup = document.createElement('details');
    this.menuGroup.id = 'toc-toggle';
    const tocSummary = document.createElement('summary');
    tocSummary.setAttribute('aria-label', 'table of contents');
    tocSummary.append('☰');
    this.menuGroup.append(tocSummary);

    this.tocExpanderContainer = document.createElement('div');
    this.tocExpanderContainer.id = 'toc-expander';
    this.menuGroup.append(this.tocExpanderContainer);

    this.tocListContainer = document.createElement('div');
    this.tocListContainer.id = 'toc-list';
    this.menuGroup.append(this.tocListContainer);

    this.container.append(this.menuGroup);
  }

  async _createTOC () {
    let headings = document.querySelectorAll('h2, h3, h4, h5, h6');
    const h1 = document.querySelector('h1');
    const h1_id = h1.id || h1.parentElement.id;

    const level = {
      'current': 2,
      'previous': 2
    };
    const list = document.createElement('ul');
    list.dataset.level = level.current;

    headings = Array.from(headings).filter( (el) => el.dataset.toc !== 'false' );

    let ul = list;
    let last_li = null;
    headings.forEach( (heading) => {
      level.current = parseInt(heading.localName.replace('h',''));
      if (level.current > level.previous) {
        ul = document.createElement('ul');
        ul.dataset.level = level.current;
        last_li.append(ul);
        const details_el =  last_li.querySelector('details');
        if (details_el) {
          details_el.append(ul);
        } else {
          last_li.append(ul);
        }
      } else if (level.current < level.previous) {
        ul = ul.closest(`[data-level='${level.current}']`);
      } else if (level.current === level.previous) {
        ul = ul;
      }
      const id = heading.id || heading.parentElement.id;
      
      const li = document.createElement('li');
      li.id = `toc-${id}`;
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.append(heading.textContent);

      const toc_class = heading.dataset.toc_class;

      // add section dataset to list item for filtering
      let component = heading.dataset.chart_type;     

      if (toc_class === 'heading') {
        // mark as main topic list
        li.classList.add('grouping');
        const groupingSpan = document.createElement('span');
        groupingSpan.classList.add('grouping-title');
        groupingSpan.append(a);
        li.append(groupingSpan);
      } else if (toc_class === 'collapse' || toc_class === 'no_collapse' ) {
        component = heading.dataset.chart_type || heading.parentElement.dataset.chart_type; 

        // const isCollapse = heading.dataset.collapse;
        if (toc_class === 'collapse') {
          // make top-level list item an expandable details element
          const details = document.createElement('details');
          const summary = document.createElement('summary');
          li.append(details);
          details.append(summary);
          summary.append(a);
        } else {
          li.classList.add('no-child');
          li.append(a);
        }

        // mark as main topic list
        ul.classList.add('topic');
      } else {
        const sectionComponent = (heading.parentElement.dataset.toc_class === 'section') ? heading.parentElement.dataset.chart_type : null;
        component = heading.dataset.chart_type || sectionComponent; 

        li.append(a);
      }

      if (component){
        li.dataset.chart_type = component;
      } 

      ul.append(li);

      // 🔗 ↑
      if (this.hasPermalink) {
        const permalink = document.createElement('a');
        permalink.href = `${window.location.pathname}#${id}`;
        permalink.append(' 🔗');
        heading.append(permalink);
        console.log('permalink', permalink);
      }

      if (this.hasToplink) {
        const toplink = document.createElement('a');
        toplink.href = `#${h1_id}`;
        toplink.append('↑');
        heading.append(toplink);
        console.log('toplink', toplink);
      }

      level.previous = level.current;
      if (li) {
        last_li = li;
      }
    });

    if (this.tocListContainer) {
      this.tocListContainer.append(list);
    } else {
      h1.after(list);
    }
  }


  /**
   * Creates a button that expands or collapses all `details` elements in its parent element.
   * @param {string|Element} expandLabel Text or element label content to be inserted into the expand button's aria-label.
   * @param {string|Element} collapseLabel Text or element label content to be inserted into the expand button's aria-label.
   * @returns {Element} The `button` element created.
   */
  _createToggleButton( expandLabel = 'expand all', collapseLabel = 'collapse all' ) {
    const button = document.createElement('button');
    button.id = 'toc_expand_button';
    button.setAttribute('aria-label', expandLabel);
    button.setAttribute('title', expandLabel);
    button.append('+');
    button.dataset.expanded = 'false';
    const expandState = {
      'true': {
        label: collapseLabel,
        symbol: '−',
      },
      'false': {
        label: expandLabel,
        symbol: '+',
      },
    };

    const toggle = function (event) {
      const buttonEl = event.target;
      let parentEl = buttonEl.parentNode;

      // To account for button's multiple nesting levels within parent, this will keep climbing the DOM 
      // until at least one child `details` element is found, until it reaches the top
      let allDetails = parentEl.querySelectorAll('details');
      while (!allDetails.length) {
        allDetails = parentEl.querySelectorAll('details');
        parentEl = (!allDetails.length && parentEl.parentNode) ? parentEl.parentNode : parentEl;
      }

      if (allDetails) {
        const isExpand = ('false' === buttonEl.dataset.expanded) ? 'true': 'false';
        for (const el of allDetails) {
          el.open = JSON.parse(isExpand);
        }
    
        buttonEl.dataset.expanded = isExpand;
        const state = expandState[isExpand];
        buttonEl.firstChild.remove();
        buttonEl.setAttribute('aria-label', state.label);
        buttonEl.setAttribute('title', state.label);
        buttonEl.append(state.symbol);
      }
    };

    button.addEventListener('click', toggle);
    
    if (this.tocExpanderContainer) {
      this.tocExpanderContainer.append(button);
    }

    return button;
  }
}
