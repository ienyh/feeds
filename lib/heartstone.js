const { Feed } = require('feed')
const axios = require('axios')

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
module.exports = async function HeartStone(req, res) {
  const feed = new Feed({
    id: '炉石传说-版本通知',
    title: '炉石传说-版本通知',
    copyright: 'copyright@chenyh.site',
    link: 'https://hearthstone.blizzard.com/zh-tw/news',
    description: '炉石传说-版本通知',
    image: 'https://docs.nestjs.com/assets/Controllers_1.png',
  });
  const result = await axios.get('https://hearthstone.blizzard.com/zh-tw/api/blog/articleList/?page=1&pageSize=12')
  result.data.forEach((item) => {
    feed.addItem({
      title: item.title,
      link: item.defaultUrl,
      date: new Date(item.created),
      description: item.content,
      author: item.author,
    });
  })
  res.setHeader('Cache-Control', 'max-age=3600')
  res.setHeader('Content-Type', 'text/xml;charset=utf-8')
  res.send(feed.rss2())
}
