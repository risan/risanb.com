document.addEventListener('alpine:init', () => {
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  let allTags = [];

  const items = [...document.querySelectorAll('.page-list > li')].map($li => {
    const date = new Date($li.children[0].dateTime);
    const tags = $li.dataset.tags.split(',').filter(Boolean);
    allTags = [...allTags, ...tags];

    return {
      title: $li.children[1].text,
      url: $li.children[1].href,
      date: $li.children[0].dateTime,
      dateStr: `${date.getFullYear()} ${MONTHS[date.getMonth()]} ${date.getDate().toString().padStart(2, 0)}`,
      tags,
    };
  });

  const fuse = new Fuse(items, {
    keys: ['title'],
  });

  Alpine.data('pageList', () => {
    return {
      items,
      tags: [...new Set(allTags)].sort(),
      search: '',
      selectedTags: [],

      toggleTag(tag) {
        const idx = this.selectedTags.indexOf(tag);

        this.selectedTags = idx === -1
          ? [...this.selectedTags, tag]
          : [...this.selectedTags.slice(0, idx), ...this.selectedTags.slice(idx + 1)];
      },

      get searchQuery() {
        return this.search.trim();
      },

      get shouldBeFiltered() {
        return this.searchQuery.length > 0 || this.selectedTags.length > 0;
      },

      get filteredItems() {
        if (!this.shouldBeFiltered) {
          return null;
        }

        const results = this.searchQuery.length === 0
          ? this.items
          : fuse.search(this.searchQuery).map(i => i.item);

        return this.selectedTags.length === 0
          ? results
          : results.filter(({ tags }) => {
            for (let i = 0; i < tags.length; i++) {
              if (this.selectedTags.includes(tags[i])) {
                return true;
              }
            }

            return false;
          });
      },
    };
  });
});