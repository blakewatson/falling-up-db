const db = require('./_data/db.json');

class DB {
  data() {
    return {
      permalink: '/js/db.js',
      eleventyExcludeFromCollections: true,
    };
  }

  render() {
    return `export default ${JSON.stringify(db)}`;
  }
}

module.exports = DB;
