// factory 相当于 require 的模块，只会执行一次，适合用来放置 store
var service = angular.module('service', ['restangular'])
service.config(['RestangularProvider', function(RestangularProvider) {
	RestangularProvider.setBaseUrl('/api')
}]).factory('song', function() {
	var audio = document.createElement('audio')
	document.body.appendChild(audio)
	return {
		nowPlaying: null,
		play: function(url) {
			this.nowPlaying = audio.src = url
			audio.play()
		},
		pause: function() {
			audio.pause()
		},
		paused: function() {
			return audio.paused
		},
		resume: function() {
			if (audio.paused) {
				audio.play()
			} else {
				audio.pause()
			}
		}
	}
}).provider('songListController', function() {
	// $scope,$http,$routeParams,song,changeRoute
	this.$get = function($http, $routeParams, song, changeRoute, musicboxData) {
		// $get 接受依赖列表
		// $scope 仅仅存在 controller 中
		// provider 可以在 config 里面预定义
		// provider 可以在不同应用之间共享服务（factory 不行？） 
		// for controller

		return function(type, $scope) {
			var url = '/api/' + type + '?' + type + '='
				// var restful = Restangular.all(type),
				// 	queryParamas = {} 
				// queryParamas[type] = $routeParams.id
			$scope.song = song
			$scope.changeRoute = changeRoute
			$http.get(url + $routeParams.id).success(function(d) {
					$scope.data = d
				})
				// restful.getList().then(function(resp){
				// 	console.log(resp)
				// })
			$scope.play = function(music, index) {
				// music.mp3Url = music.mp3Url.replace('m1','m2')
				if (song.nowPlaying !== music.mp3Url) {
					musicboxData.add(music)
				}
			}
			$scope.selectSong = function(index) {
				$scope.index = index
			}
		}
	}
}).factory('changeRoute', ['$location', function($location) {
	return function(type, query) {
		var url
		switch (type) {
			case 'artist':
				url = 'artist/' + query.id
				break
			case 'album':
				url = 'album/' + query.id
				break
			case 'song':
		}
		$location.url(url)
			// http://netease.misaka.ota/artist?artist
			// album: '/api/album/',
			// song: '/api/song/detail', //id=a&ids=[a]
	}
}]).factory('store', function() {
	return {
		add: function(key, value) {
			return localStorage.setItem(key, value)
		},
		has: function(key) {
			return localStorage.hasOwnProperty(key)
		},
		get: function(key) {
			return localStorage.getItem(key)
		}
	}
}).factory('interceptor', function($q) {
	// http拦截器
	return {
		request: function(config) {
			return config
		},
		response: function(response) {
			console.log(response)
			return response
		},
		responseError: function(err) {

		}
	}
}).factory('global', function() {
	var global = {
		classname: false
	}
	return {
		toggle: function() {
			global.classname = true
		},
		getValue: function() {
			return global
		},
		reset: function() {
			global.classname = false
		}
	}
}).factory('musicboxData', ['song', function(song) {
	var store = {}
	var data = {
		playing: 'hi',
		curIndex: 0,
		play: false,
		playList: []
	}
	var getStatus = function(data, dist) {
		for (var i = 0, l = data.length; i < l; i++) {
			if (data[i].url === dist) {
				return {
					curIndex: i,
					index: 1
				}
			}
		}
		return {
			curIndex: data.length,
			index: -1
		}
	}
	return {
		add: function(music) {
			var m = {
				name: music.name,
				url: music.mp3Url || music.url,
				duration: music.duration
			}
			var m_status = getStatus(data.playList, m.url)
			if (m_status.index === -1) {
				data.playList.push(m)
			}
			data.playing = m.name
			data.play = true
			data.curIndex = m_status.curIndex
			store[m.name] = m.url
			song.play(m.url)
			return data
		},
		getData: function() {
			return data
		}
	}
}])

var app = angular.module('app', ['ngRoute', 'service', 'restangular'])

app.filter('formatTime', function() {
	return function(input) {
		input = parseInt(input) / 1e3
		var second = Math.floor(input % 60) //Float issue
		return Math.floor(input / 60) + ':' + (second < 10 ? ('0' + second) : second)
	}
}).filter('getDuration', function() {
	return function(input) {
		input = parseInt(input) / 1e3
		return Math.floor(input)
	}
})

app.config(['$routeProvider', '$httpProvider', '$sceDelegateProvider', 'songListControllerProvider', 'RestangularProvider', function($routeProvider, $httpProvider, $sceDelegateProvider, songListControllerProvider, RestangularProvider) {
	$httpProvider.defaults.cache = true //默认全局 cache: true
		// $httpProvider.defaults.headers[method]
		// $httpProvider.defaults.headers.post['X-POWER'] = 'otarim'
		// $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
	$httpProvider.interceptors.push('interceptor')
		// RestangularProvider.setBaseUrl('http://127.0.0.1:9527/')
		// $sceDelegateProvider.resourceUrlWhitelist([
		// 	'http://7vilgy.com1.z0.glb.clouddn.com/**'
		// ])
		// 添加跨域白名单
		// songListControllerProvider.url = 'http://127.0.0.1:9527/'
	$routeProvider.when('/', {
		templateUrl: '/view/index.tpl',
		controller: ['$scope', '$http', 'type', 'Restangular', 'song', 'changeRoute', 'store', 'global', 'musicboxData', function($scope, $http, type, Restangular, song, changeRoute, store, global, musicboxData) {
			global.toggle()
			var url,
				searchBar = document.querySelector('.search-handler input')
				// var restful = $resource('http://127.0.0.1:9527/:action',{
				// 	action: '@action',
				// },{
				// 	// 配置$resource
				// 	init: {
				// 		method: 'POST',
				// 		success: function(resp){
				// 			$scope.result = resp
				// 		}
				// 	}
				// })
			var restful = Restangular.all('search')
			$scope.type = type
			$scope.selectedType = 1
			$scope.index = $scope.select = 0
			$scope.changeRoute = changeRoute
			$scope.setType = function(type, index) {
				$scope.index = index
				$scope.selectedType = type
				store.add('netease.setType', type)
				searchBar.focus()
			}
			$scope.search = function() {
				if ($scope.searchItem) {
					store.add('netease.searchItem', $scope.searchItem)
					restful.post({
						s: $scope.searchItem,
						type: $scope.selectedType
					}).then(function(resp) {
						$scope.result = resp
						global.reset()
					}, function(err) {
						console.log(err)
					})
				} else {
					searchBar.focus()
				}
			}
			$scope.play = function(id, index) {
				$http.get('/song?id=' + id).success(function(d) {
					// d.songs[0].mp3Url = d.songs[0].mp3Url.replace('m1','m2')
					if (song.nowPlaying !== d.songs[0].mp3Url) {
						musicboxData.add(d.songs[0])
					}
				})
			}
			$scope.selectSong = function(index) {
				$scope.select = index
			}
			if (store.has('netease.searchItem')) {
				$scope.searchItem = store.get('netease.searchItem')
				$scope.selectedType = store.get('netease.setType')
				$scope.index = Object.keys($scope.type).indexOf($scope.selectedType)
				restful.post({
					s: $scope.searchItem,
					type: $scope.selectedType
				}).then(function(resp) {
					$scope.result = resp
					global.reset()
				}, function(err) {
					console.log(err)
				})
			}
		}],
		resolve: {
			// 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002) *(type)* must be fn
			type: function() {
				return {
					1: '单曲',
					10: '专辑',
					100: '歌手',
					// 1000: '歌单'
				}
			}
		}
	}).when('/artist/:id', {
		templateUrl: '/view/artist.tpl',
		controller: ['songListController', '$scope', function(songListController, $scope) {
			songListController('artist', $scope)
		}]
	}).when('/album/:id', {
		templateUrl: '/view/album.tpl',
		controller: ['songListController', '$scope', function(songListController, $scope) {
			songListController('album', $scope)
		}]
	})
}]).controller('main', ['$scope', 'global', function($scope, global) {
	$scope.global = global.getValue()
}]).directive('musicbox', ['song', 'musicboxData', function(song, musicboxData) {
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		// scope: {}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude) {
			$scope.song = song
			$scope.data = musicboxData.getData()
			$scope.play = function(music, index) {
				if (song.nowPlaying === music.url) {
					song.resume()
				} else {
					// $scope.nowPlay = index
					musicboxData.add(music)
				}
			}
			$scope.selectSong = function(index) {
				$scope.index = index
			}
			$scope.toggleShow = function() {
				$element.toggleClass('widget-show')
			}
			$scope.showList = function() {
				$scope.list = !$scope.list
			}
		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: '/view/musicbox.tpl',
		replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
			// iElm.find('i').on('click',function(){
			// 	iElm.toggleClass('widget-show')
			// })
			// iElm.find()
		}
	}
}]).run(['$rootScope', 'global', function($rootScope, global) {
	$rootScope.$on('$routeChangeStart', function(evt, next, current) {
		global.reset()
	})
}])

// document.onselectstart = function(){return false}