'use strict'
var koa = require('koa'),
  fs = require('mz/fs'),
  path = require('path'),
  staticServe = require('koa-static-cache'),
  router = require('koa-router')(),
  koaBody = require('koa-body'),
  co = require('co'),
  swig = require('koa-swig'),
  queryString = require('querystring'),
  corequest = require('co-request'),
  crypto = require('crypto'),
  favicon = require('koa-favicon'),
  app = koa()

var song = function*() {
  var query = this.request.query
  this.body = yield request('/api/song/detail', 'get', {
    id: query.id,
    ids: '[' + query.id + ']'
  })
}

var search = function*() {
  var body = this.request.body
  this.body = yield request('/api/search/get/web', 'post', {
    's': body.s,
    'type': body.type || 1,
    'offset': body.offset || 0, //分页起始位置，非分页页数
    'total': false,
    'limit': body.limit || 60
  })
}

var user = function*() {
  var query = this.request.query
  this.body = yield request('/api/user/playlist', 'get', {
    offset: query.offset || 0,
    limit: query.limit || 9,
    uid: query.user,
    total: false
  })
}

var artist = function*() {
  var query = this.request.query
  this.body = yield request('/api/artist/' + query.artist, 'get')
}

var album = function*() {
  var query = this.request.query
  this.body = yield request('/api/album/' + query.album, 'get')
}

// var playList = function*() {
//     var query = this.request.query
//     this.body = yield request('/api/playlist/list', 'get', {
//         cat: query.category,
//         order: query.order || 'hot',
//         offset: query.offset || 0,
//         total: !!query.offset,
//         limit: query.limit || 60
//     })
// }

var playList = function*() {
  var query = this.request.query
  this.body = yield request('/api/playlist/detail', 'get', {
    id: query.playList
  })
}

var getArtistAlbum = function*() {
  var query = this.request.query
  this.body = yield request('/api/artist/albums/' + query.id, 'get', {
    id: query.id,
    offset: query.offset || 0,
    total: false,
    limit: query.limit || 20
  })
}

if (process.env.NODE_ENV === 'development') {
  app.use(require('koa-error')())
  app.use(require('koa-logger')())
}


// app.use(require('koa-charset')())

//app.use(require('koa-parameter')(app))

app.use(favicon(__dirname + '/public/favicon.png')) //require staticPath

app.use(staticServe('./public/', {
  maxAge: 365 * 24 * 60 * 60
}))

app.use(koaBody({
  multipart: true,
  formidable: {
    keepExtensions: true,
    hash: 'sha1'
  }
}))

app.context.render = swig({
  root: path.join(__dirname, 'view'),
  autoescape: true,
  cache: process.env.NODE_ENV === 'production' ? 'memory' : false,
  ext: 'html',
  // locals: locals,
  // filters: filters,
  // tags: tags,
  // extensions: extensions
});
app.use(router.routes()).use(router.allowedMethods())

// router

router.get('/api/song', song)
  .post('/api/search', search)
  .get('/api/user', user)
  .get('/api/artist', artist)
  .get('/api/album', album)
  .get('/api/playList', playList)
  .get('/api/artist/albums', getArtistAlbum)
  .post('/api/login', function*() {
    var body = this.request.body
    this.body = yield request('/api/login/', 'post', {
      username: body.username,
      password: crypto.createHash('md5').update(body.password).digest('hex'),
      rememberLogin: true
    })
  })
  .get('/', function*() {
    this.body = yield this.render('index')
  })



app.listen(9527)

var request = function*(api, method, data) {
  var options = {
    method: method,
    headers: {
      'Referer': 'http://music.163.com/',
      'Cookie': 'appver=2.0.2;'
    }
  }
  options.uri = 'http://music.163.com' + api
  if (data) {
    if (method === 'get') {
      data = queryString.stringify(data)
      options.uri += '?' + data
    }
    if (method === 'post') {
      options.form = data
    }
  }
  var req = yield corequest(options)
  return JSON.parse(req.body)
}

const api = {
  hostname: 'music.163.com',
  login: '/api/login/', //登陆 username: 'password': hashlib.md5( password ).hexdigest(),'rememberLogin': 'true' POST
  userList: '/api/user/playlist', //用户歌单 offset 分页，limit 数量，uid 用户 id 
  search: '/api/search/get/web', //搜索 's': s, 'type': stype, 'offset': offset, 'total': true/false, 'limit': 60 POST
  playList: '/api/playlist/list', //歌单（网友精选碟 cat=' + category + '&order=' + order + '&offset=' + str(offset) + '&total=' + ('true' if offset else 'false') + '&limit=' + str(limit)
  playListDetail: '/api/playlist/detail', //id=playListId
  artist: '/api/artist/', //api/artist/artistId
  album: '/api/album/',
  song: '/api/song/detail', //id=a&ids=[a]
  lyric: '/api/song/lyric' // id=29785473&lv=-1&kv=-1&tv=-1
}