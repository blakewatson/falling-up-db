import { Alpine } from './alpine.min.js';
import db from './db.js';
import MiniSearch from './minisearch.min.js';

window.Alpine = Alpine;

console.log('Alpine', Alpine);

Alpine.data('app', () => ({
  isFuzzy: false,
  isPrefix: false,
  miniSearch: null,
  results: [],
  searchInput: '',

  init() {
    const allTracks = db.albums.reduce((tracks, album) => {
      const albumTemplate = {
        albumTitle: album.title,
        artist: album.artist,
      };

      for (const track of album.tracks) {
        tracks.push({
          ...albumTemplate,
          ...track,
          id: crypto.randomUUID(),
        });
      }

      return tracks;
    }, []);

    this.miniSearch = new MiniSearch({
      fields: ['title', 'lyrics'],
      storeFields: ['title', 'albumTitle', 'artist', 'lyrics'],
    });

    this.miniSearch.addAll(allTracks);
  },

  search() {
    if (this.searchInput.length < 3) {
      return;
    }

    this.results = this.miniSearch.search(this.searchInput, {
      fuzzy: this.isFuzzy,
      prefix: this.isPrefix,
    });
  },

  nl2br(content) {
    return content.replace(/\n/g, '<br>');
  },

  getHighlightedSnippets(searchResult) {
    const lines = searchResult.lyrics.split('\n');

    return searchResult.terms.flatMap((term) => {
      const snippets = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(term.toLowerCase())) {
          const start = lines[i].toLowerCase().indexOf(term.toLowerCase());
          const end = start + term.length;
          const str = lines[i].substring(start, end);

          const lineBefore = lines[i - 1] || '';
          const line = replaceAll(lines[i], term, `<mark>${str}</mark>`);
          const lineAfter = lines[i + 1] || '';

          snippets.push(
            this.nl2br(`${lineBefore}\n${line}\n${lineAfter}`.trim()),
          );
        }
      }

      return snippets;
    });
  },
}));

function replaceAll(str, strReplace, strWith) {
  // See http://stackoverflow.com/a/3561711/556609
  var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  var reg = new RegExp(esc, 'ig');
  return str.replace(reg, strWith);
}

Alpine.start();
