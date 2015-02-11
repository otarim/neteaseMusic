var http = require('http'),
	queryString = require('querystring'),
    fs = require('fs'),
	crypto = require('crypto'),
	url = require('url')

const api = {
	hostname: 'music.163.com',
	login: '/api/login/', //登陆 username: 'password': hashlib.md5( password ).hexdigest(),'rememberLogin': 'true' POST
	userList: '/api/user/playlist', //用户歌单 offset 分页，limit 数量，uid 用户 id 
	search: '/api/search/get/web', //搜索 's': s, 'type': stype, 'offset': offset, 'total': true/false, 'limit': 60 POST
	playList: '/api/playlist/list', //歌单（网友精选碟 cat=' + category + '&order=' + order + '&offset=' + str(offset) + '&total=' + ('true' if offset else 'false') + '&limit=' + str(limit)
	playListDetail: '/api/playlist/detail',//id=playListId
	artist: '/api/artist/', //api/artist/artistId
	album: '/api/album/',
	song: '/api/song/detail', //id=a&ids=[a]
    lyric: '/api/song/lyric' // id=29785473&lv=-1&kv=-1&tv=-1
}

const port = 9527

var extend = function(p,c){
	var ret = p
	for(var i in c){
		if(c.hasOwnProperty(i)){
			ret[i] = c[i]
		}
	}
	return ret
}

var addQuery = function(url,data){
    if(typeof data === 'string'){
        return url + data
    }
	var query = []
	for(var i in data){
		if(data.hasOwnProperty(i)){
			query.push(i + '=' + data[i])
		}
	}
	query = query.join('&')
	url += (url.indexOf('?') !== -1) ? ('&' + query): ('?' + query)
	return url
}

var request = (function(){
	return function(config,callback){
		var stringifyData
        var CONFIG = {
            hostname: api.hostname,
            method: 'get',
            headers: {
                'Referer':'http://music.163.com/',
                'Cookie': 'appver=2.0.2;'
            }
        }
        // extend?
		config = extend(CONFIG,config || {})
		if(config.data){
			if(config.method === 'post'){
				stringifyData = queryString.stringify(config.data)
                config.headers['Content-Type'] = 'application/x-www-form-urlencoded' //post needed
				config.headers['Content-Length'] = stringifyData.length //post needed
			}
			if(config.method === 'get'){
				config.path = addQuery(config.path,config.data)
			}
		}
		var req = http.request(config,function(res){
			var data = ''
			res.setEncoding('utf-8')
			res.on('data',function(chunk){
				data += chunk
			}).on('end',function(){
				callback && callback(null,data)
			}).on('error',function(e){
				callback && callback(e.message,null)
			})
		})
		if(stringifyData){
			req.write(stringifyData)
		}
		req.end()
	}
})()

var getData = function(req,callback){
    var chunk = [],len = 0
    req.on('data',function(data){
        chunk.push(data)
        len += data.length
    }).on('end',function(){
        console.log(Buffer.concat(chunk,len).toString())
        callback && callback(null,Buffer.concat(chunk,len).toString())
    }).on('error',function(err){
        callback && callback(err,null)
    })
}

// var sendRequest = function(){

// }

http.createServer(function(req,res){
	var reqUrl = url.parse(req.url,true),
		method = req.method.toLowerCase(),
		pathname = reqUrl.pathname.slice(1),
        intfExists = true,data
	if(method === 'get'){
        query = reqUrl.query
		switch(pathname){
            case '':
                var ret = fs.readFileSync('../index.html')
                res.writeHead(200,{
                    'Content-Type': 'text/html'
                })
                return res.end(ret)
			case 'song':
				data = {id : query.id, ids: '[' + query.id + ']'}
				break
            case 'userList':
                data = {offset: query.offset, limit: query.limit, uid: query.uid }
                break
            case 'artist':
                data = query.artist
                break
            case 'album':
                data = query.album
                break
            case 'playList':
                data = {cat: query.category, order: query.order, offset: query.offset, total: !!query.offset, limit: query.limit }
                break
            case 'playListDetail':
                data = {id: query.id}
                break
            default:
                intfExists = false
                break
		}
        if(intfExists){
            request({
                path: api[pathname],
                method: method,
                data: data
            },function(err,response){
                if(err){}
                var buf = new Buffer(response)
                res.writeHead(200,{
                    'Access-Control-Allow-Origin': req.headers['origin'],
                    'Access-Control-Allow-Credentials': true,
                    'Content-Type': 'application/json',
                    // 'Content-Length': buf.length
                })
                 res.end(buf)
            })
        }
	}
	if(method === 'post'){
        getData(req,function(err,query){
            if(typeof query === 'string'){
                // query = queryString.parse(query)
                // console.log(query)
                query = JSON.parse(decodeURIComponent(query))
            }
            if(pathname === 'search'){
                // 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002) *(type)*
                data = {'s': query.s, 'type': query.type || 1, 'offset': query.offset || 0, 'total': query.total || true, 'limit': 60 }
            }else if(pathname === 'login'){
                data = {username: query.username, password: crypto.createHash('md5').update(query.password).digest('hex'), rememberLogin: true }
            }else{
                intfExists = false
            }
            if(intfExists){
                request({
                    path: api[pathname],
                    method: method,
                    data: data
                },function(err,response){
                    if(err){}
                    var buf = new Buffer(response)
                    res.writeHead(200,{
                        'Access-Control-Allow-Origin': req.headers['origin'],
                        'Access-Control-Allow-Credentials': true,
                        'Content-Type': 'application/json',
                        // 'Content-Length': buf.length  //???
                    })
                    res.end(buf)
                })
            }
        })
	}
    if(method === 'options'){
        res.writeHead(200,{
            'Access-Control-Allow-Origin': req.headers['origin'],
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Headers': 'Content-Type'
        })
        res.end()
    }
}).listen(port)

