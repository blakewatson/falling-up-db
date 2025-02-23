const fs = require('fs');
const cheerio = require('cheerio');

async function main() {
  const args = process.argv.slice(2);

  const albumUrl = args[0];

  if (!albumUrl || !albumUrl.startsWith('https://genius.com/albums/')) {
    console.error('Invalid album URL');
    return;
  }

  let db = {};

  if (fs.existsSync('src/_data/db.json')) {
    db = JSON.parse(fs.readFileSync('src/_data/db.json'));
  }

  if (!db.albums) {
    db.albums = [];
  }

  const album = await getAlbumTitleAndArtist(albumUrl);

  console.log(album);

  album.tracks = [];

  const trackList = await getTrackList(albumUrl);

  for (const track of trackList) {
    const trackInfo = await getTrackInfo(track.url);
    console.log(`Fetched track: ${trackInfo.title}`);
    album.tracks.push(trackInfo);
  }

  db.albums.push(album);

  fs.writeFileSync('src/_data/db.json', JSON.stringify(db, null, 2));
}

async function getAlbumTitleAndArtist(albumUrl) {
  const resp = await fetch(albumUrl);
  const html = await resp.text();
  const $ = cheerio.load(html);

  const title = $('h1').first().text().trim();
  const artist = $('h2').first().text().trim();

  return { title, artist };
}

async function getTrackInfo(trackUrl) {
  const resp = await fetch(trackUrl);
  const html = await resp.text();
  const $ = cheerio.load(html);

  const $lyrics = $('[data-lyrics-container]');

  $lyrics.find('a').each((i, el) => {
    $(el).replaceWith($(el).text());
  });

  $lyrics.find('br').replaceWith('\n');

  return {
    title: $('h1').first().text().trim(),
    lyrics: $lyrics.text().trim(),
  };
}

async function getTrackList(albumUrl) {
  const resp = await fetch(albumUrl);
  const html = await resp.text();
  const $ = cheerio.load(html);

  const tracks = $('h3.chart_row-content-title');

  const trackList = [];

  tracks.each((i, el) => {
    $(el).find('span').remove();
    const title = $(el).text().trim();
    const url = $(el).closest('a').attr('href');
    trackList.push({ title, url });
  });

  return trackList;
}

main();
