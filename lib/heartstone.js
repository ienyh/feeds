const { Feed } = require('feed')
const cheerio = require('cheerio')
const axios = require('axios')

const cachedGet = memoize(axios.get)

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
module.exports = async function HeartStone(req, res) {
  const feed = new Feed({
    id: 'test',
    title: 'test-title',
    copyright: 'copyright@chenyh.site',
    link: 'https://hearthstone.blizzard.com/zh-tw/news',
    description: '炉石传说-版本通知',
    image: 'https://docs.nestjs.com/assets/Controllers_1.png',
  });
  const response = await axios.get('https://hearthstone.blizzard.com/zh-tw/news');
  const $ = cheerio.load(response.data);
  const result = JSON.parse($('[type=application/ld+json]').text());
  const list = result.mainEntity.itemListElement;
  const descriptions = await Promise.all(
    list.filter(o => o?.url).map(async (item) => {
      const descriptionResponse = await cachedGet(item.url);
      const $ = cheerio.load(descriptionResponse.data);
      return $('div.article-content').html();
    }),
  );
  list.forEach((item, index) => {
    feed.addItem({
      title: item.headline,
      link: item.url,
      date: new Date(item.datePublished),
      description: descriptions[index],
      author: item?.author?.name,
    });
  });
  res.setHeader('Cache-Control', 'max-age=3600')
  res.setHeader('Content-Type', 'text/xml;charset=utf-8')
  res.send(feed.rss2())
}

function memoize(fn, ttl = 1000 * 60 * 60 * 24 * 7) {
  const cache = {};
  return function (...args) {
    const key = JSON.stringify(args);
    if (cache[key] && (Date.now() - cache[key].timestamp < ttl)) {
      return cache[key].result;
    } else {
      const result = fn(...args);
      cache[key] = {
        result: result,
        timestamp: Date.now()
      };
      return result;
    }
  };
}