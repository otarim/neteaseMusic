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
		},
		audio: audio,
		onEnd: function(cb) {
			audio.addEventListener('ended', function() {
				cb()
			})
		}
	}
}).provider('songListController', function() {
	// $scope,$http,$routeParams,song,changeRoute
	this.$get = function($http, $routeParams, song, changeRoute, musicboxData, Restangular, global) {
		// $get 接受依赖列表
		// $scope 仅仅存在 controller 中
		// provider 可以在 config 里面预定义
		// provider 可以在不同应用之间共享服务（factory 不行？） 
		// for controller

		return function(type, $scope) {
			var url = '/api/' + type + '?' + type + '='
			$scope.song = song
			$scope.changeRoute = changeRoute
			$http.get(url + $routeParams.id).success(function(d) {
				if (type === 'playList') {
					$scope.data = d.result
				} else {
					$scope.data = d
				}
				if (type === 'user') {
					$scope.more = d.more
					$scope['playlist'] = d.playlist
					$scope.offset = d.playlist.length
				}
				$scope.toggleOrder = function(type) {
					if ($scope.order === type) {
						$scope.rev = !$scope.rev
					}
					$scope.order = type
				}
			})
			$scope.play = function(music, index) {
				if (song.nowPlaying !== music.mp3Url) {
					musicboxData.add(music)
				}
			}
			$scope.playAll = function(lists) {
				musicboxData.addPlayList(lists)
			}
			$scope.selectSong = function(index) {
				$scope.index = index
			}
			if (type === 'artist' || type === 'user') {
				var prop
				var api = type === 'artist' ? Restangular.all('/artist/albums') : Restangular.all('/user')
				var fetch = function(cb) {
					var params = {
						offset: $scope.offset,
						limit: 10
					}
					if (type === 'artist') {
						params['id'] = $routeParams.id
					} else {
						params['user'] = $routeParams.id
					}
					api.get('', params).then(function(result) {
						cb && cb(result)
					})
				}
				$scope.offset = 0
				$scope.loadMore = function() {
					fetch(function(result) {
						$scope.more = result.more
						$scope[prop] = $scope[prop].concat(result[prop])
						$scope.offset += result[prop].length
					})
				}
				if (type === 'artist') {
					prop = 'hotAlbums'
					fetch(function(result) {
						$scope.more = result.more
						$scope[prop] = result[prop]
						$scope.offset += result[prop].length
					})
				} else {
					prop = 'playlist'
				}
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
			case 'playList':
				url = 'playList/' + query.id
				break
			case 'user':
				url = 'user/' + query.id
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
}).factory('musicboxData', ['song', '$rootScope', function(song, $rootScope) {
	var data = {
		playing: 'hi',
		curIndex: 0,
		play: false,
		playList: [],
		current: null,
		shuffle: false
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
	var notify = function() {
		$rootScope.$emit('notify', {
			body: data.current.name.length > 32 ? data.current.name.slice(0, 32) + '...' : data.current.name,
			icon: data.current.pic,
			tag: 1
		})
	}
	var shuffle = function() {
		data.curIndex = Math.floor(Math.random() * data.playList.length)
		prePareSong(data.playList[data.curIndex])
	}
	var next = function() {
		if (!data.shuffle) {
			if (data.curIndex < data.playList.length - 1) {
				prePareSong(data.playList[++data.curIndex])
			}
		} else {
			shuffle()
		}
	}
	var prev = function() {
		if (!data.shuffle) {
			if (data.curIndex > 0) {
				prePareSong(data.playList[--data.curIndex])
			}
		} else {
			shuffle()
		}
	}
	var prePareSong = function(music) {
		song.play(music.url)
		data.playing = music.name
		data.play = true
		data.current = music
		song.audio.currentTime = 0
		notify()
	}
	var compactSong = function(music) {
		var url = music.mp3Url || music.url
		return url.replace(/m([0-9])\./,'p$1.')
	}
	song.onEnd(next)
	return {
		add: function(music) {
			var m = {
				name: music.name,
				url: compactSong(music),
				duration: music.duration,
				pic: music.pic || music.album.picUrl
			}
			var m_status = getStatus(data.playList, m.url)
			if (m_status.index === -1) {
				data.playList.push(m)
			}
			data.curIndex = m_status.curIndex
			prePareSong(m)
			return data
		},
		addPlayList: function(lists) {
			lists = lists.map(function(music) {
				return {
					name: music.name,
					url: compactSong(music),
					duration: music.duration,
					pic: music.album.picUrl
				}
			})
			data.playList = data.playList.concat(lists)
			prePareSong(lists[0])
		},
		next: next,
		prev: prev,
		getData: function() {
			return data
		},
		toggleShuffle: function() {
			data.shuffle = !data.shuffle
		},
		empty: function() {
			song.audio.currentTime = 0
			data.playList = []
			data.playing = 'build by otarim'
			data.curIndex = 0
			data.play = false
			data.current = null
			song.pause()
		}
	}
}])

var app = angular.module('app', ['ngRoute', 'service', 'restangular', 'cfp.hotkeys'])

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
	$routeProvider.when('/', {
			templateUrl: '/view/index.tpl',
			controller: ['$scope', '$http', 'type', 'Restangular', 'song', 'changeRoute', 'store', 'global', 'musicboxData', function($scope, $http, type, Restangular, song, changeRoute, store, global, musicboxData) {
				global.toggle()
				var url,
					searchBar = document.querySelector('.search-handler input'),
					postRequest = function(cb) {
						var restful = Restangular.all('search')
						$scope.loading = true
						$scope.noResult = false
						restful.post({
							s: $scope.searchItem,
							type: $scope.selectedType,
							offset: $scope.offset,
							limit: 20
						}).then(function(resp) {
							$scope.loading = false
							var type = alias[$scope.selectedType]
							if (resp.result[type + 'Count'] === 0) {
								return $scope.noResult = true
							}
							$scope.noResult = false
							cb && cb(resp.result, type)
						}, function(err) {
							$scope.loading = false
							$scope.noResult = true
							console.log(err)
						})
					}
				var alias = {
					1: 'song',
					10: 'album',
					100: 'artist',
					1000: 'playlist',
					1002: 'userprofile'
				}
				$scope.data = {}
				$scope.type = type
				$scope.selectedType = 1
				$scope.index = $scope.select = 0
				$scope.offset = 0
				$scope.changeRoute = changeRoute
				$scope.setType = function(type, index) {
					$scope.index = index
					$scope.selectedType = type
					store.add('netease.setType', type)
					searchBar.focus()
				}
				$scope.search = function(e) {
					if (e && e.which !== 13) return
					if ($scope.searchItem) {
						$scope.more = false
						$scope.data = []
						$scope.offset = 0
						store.add('netease.searchItem', $scope.searchItem)
						postRequest(function(resp, type) {
							$scope.data[type + 'Count'] = resp[type + 'Count']
							$scope.data[type + 's'] = resp[type + 's']
							$scope.offset += resp[type + 's'].length
							$scope.more = $scope.offset < resp[type + 'Count']
						})
					} else {
						searchBar.focus()
					}
				}
				$scope.loadMore = function() {
					postRequest(function(resp, type) {
						$scope.data[type + 'Count'] = resp[type + 'Count']
						$scope.data[type + 's'] = $scope.data[type + 's'].concat(resp[type + 's'])
						$scope.offset += resp[type + 's'].length
						$scope.more = $scope.offset < resp[type + 'Count']
					})
				}
				$scope.play = function(id, index) {
					$http.get('/api/song?id=' + id).success(function(d) {
						if (song.nowPlaying !== d.songs[0].mp3Url) {
							musicboxData.add(d.songs[0])
						}
					})
				}
				$scope.selectSong = function(index) {
					$scope.select = index
				}
				if (!store.has('netease.setType')) {
					store.add('netease.setType', '1')
				}
				if (store.has('netease.searchItem')) {
					$scope.searchItem = store.get('netease.searchItem')
					$scope.selectedType = store.get('netease.setType')
					$scope.index = Object.keys($scope.type).indexOf($scope.selectedType)
					postRequest(function(resp, type) {
						$scope.data[type + 'Count'] = resp[type + 'Count']
						$scope.data[type + 's'] = resp[type + 's']
						$scope.offset += resp[type + 's'].length
						$scope.more = $scope.offset < resp[type + 'Count']
					})
				}
				global.toggle()
			}],
			resolve: {
				// 搜索单曲(1)，歌手(100)，专辑(10)，歌单(1000)，用户(1002) *(type)* must be fn
				type: function() {
					return {
						1: '单曲',
						10: '专辑',
						100: '歌手',
						1000: '歌单',
						1002: '用户'
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
		.when('/playList/:id', {
			templateUrl: '/view/playList.tpl',
			controller: ['songListController', '$scope', function(songListController, $scope) {
				songListController('playList', $scope)
			}]
		})
		.when('/user/:id', {
			templateUrl: '/view/user.tpl',
			controller: ['songListController', '$scope', function(songListController, $scope) {
				songListController('user', $scope)
			}]
		})
}]).controller('main', ['$scope', 'global', function($scope, global) {
	$scope.global = global.getValue()
}]).directive('musicbox', ['song', 'musicboxData', 'hotkeys', function(song, musicboxData, hotkeys) {
	return {
		controller: function($scope, $element, $attrs, $transclude) {
			$scope.song = song
			$scope.data = musicboxData.getData()
			$scope.statusText = '展开'
			$scope.play = function(music, index) {
				if (!$scope.data.current) return
				if ($scope.song.nowPlaying === music.url) {
					$scope.song.resume()
				} else {
					// $scope.nowPlay = index
					musicboxData.add(music)
				}
				$scope.paused = song.paused()
			}
			$scope.toggleShow = function() {
				if ($scope.statusText === '收起') {
					$scope.list = false
					$scope.statusText = '展开'
				} else {
					$scope.statusText = '收起'
				}
				$scope.show = !$scope.show
			}
			$scope.showList = function() {
				$scope.list = !$scope.list
			}
			$scope.playPrev = function() {
				musicboxData.prev()
			}
			$scope.playNext = function() {
				musicboxData.next()
			}
			$scope.toggleShuffle = function() {
				musicboxData.toggleShuffle()
			}
			$scope.emptyList = function() {
				musicboxData.empty()
			}
			hotkeys.bindTo($scope).add({
				combo: 'ctrl+shift+left',
				callback: function() {
					$scope.playPrev()
				}
			}).add({
				combo: 'ctrl+shift+right',
				callback: function() {
					$scope.playNext()
				}
			}).add({
				combo: 'ctrl+shift+space',
				callback: function() {
					$scope.song.resume()
				}
			})
			setInterval(function() {
				$scope.$apply()
			}, 500)
		},
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		templateUrl: '/view/musicbox.tpl',
		replace: true
	}
}]).run(['$rootScope', 'global', function($rootScope, global) {
	Notification.requestPermission(function(permission) {
		// 可在确认后直接弹出
		if (permission === 'granted') {
			$rootScope.$on('notify', function(e, notify) {
				clearTimeout(Notification.timmer)
				var notification = new Notification('当前播放:', notify)
				notification.onshow = function() {
					Notification.timmer = setTimeout(function() {
						notification.close()
					}, 2000)
				}
			})
		}
	})
	$rootScope.$on('$routeChangeStart', function(evt, next, current) {
		global.reset()
	})
}])