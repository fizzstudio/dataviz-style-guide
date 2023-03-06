window.addEventListener('load', () => new TableOfContents( 'toc' ) );

class TableOfContents {
  constructor( containerId, hasPermalink = false, hasToplink = false) {
    this.containerId = containerId;
    this.hasPermalink = hasPermalink;
    this.hasToplink = hasToplink;
    this.init();
  }

  init () {
    const headings = document.querySelectorAll('h2, h3, h4');
    // const header = document.querySelector('header');
    const h1 = document.querySelector('h1');
    const h1_id = h1.id || h1.parentElement.id;

    const list = document.createElement('ul');
    const level = {
      'current': 2,
      'previous': 2
    };

    let ul = list;
    let last_li = null;
    headings.forEach( (heading) => {
      // console.log('heading', heading);
      level.current = parseInt(heading.localName.replace('h',''));
      if (level.current > level.previous) {
        ul = document.createElement('ul');
        last_li.append(ul);
      } else if (level.current < level.previous) {
        ul = ul.parentElement;
        let levelDelta = level.previous - level.current;
        for (let index = levelDelta; index > 0; index--) {
          ul = ul.parentElement
        }
      } else if (level.current === level.previous) {
        // console.log('break', ul);
        ul = ul;
      }
      const id = heading.id || heading.parentElement.id;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${id}`;
      a.append(heading.textContent);
      li.append(a);
      ul.append(li);

      console.log(list.outerHTML);

      // 🔗 ↑
      // console.log(this.hasPermalink);
      if (this.hasPermalink) {
        const permalink = document.createElement('a');
        permalink.href = `${window.location.pathname}#${id}`;
        permalink.append('🔗');
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
    // header.append(ul);

    if (this.containerId) {
      const container = document.getElementById(this.containerId);
      container.append(list);
    } else {
      h1.after(list);
    }
  }
}
