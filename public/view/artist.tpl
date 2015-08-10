<div class="artist">
	<div class="header-info">
		<img ng-src="{{data.artist.img1v1 === -1 ? data.artist.img1v1Url : data.artist.picUrl}}" alt="">
		<h2 ng-bind="data.artist.name"></h2>
		<p>
			<span ng-repeat="(key, value) in data.artist.alias">{{value}}</span>
		</p>
	</div>
	<h4>热门歌曲:</h4>
	<ul class="content-songs">
		<li class="playAll" ng-click="playAll(data.hotSongs)">播放全部</li>
		<li class="caption">
			<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-album">专辑</span><span class="song-time" ng-click="toggleOrder('duration')">时间</span><span class="song-score" ng-click="toggleOrder('score')">热度</span>
		</li>
		<li ng-repeat="(key, value) in data.hotSongs | orderBy: order: rev" ng-dblclick="play(value,$index)" ng-click="selectSong($index)" ng-class="{active: index === $index,odd: $odd}">
			<span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-album" ng-click="changeRoute('album',{id: value.album.id})">{{value.album.name}}</span><span class="song-time">{{value.duration|formatTime}}</span><span class="song-score"><i><b ng-style="{width: value.score+'%'}"></b></i></span>
		</li>
	</ul>
	<h4>热门专辑:</h4>
	<ul class="albums">
		<li ng-if="hotAlbums.length" ng-repeat="(key, value) in hotAlbums" data-id="{{value.id}}">
			<span class="album-wrap"><img ng-src="{{value.img1v1 === -1 ? value.img1v1Url : value.picUrl}}" alt="{{value.name}}" width="120" height="120" ng-click="changeRoute('album',{id: value.id})">
			</span>
			<span class="album-des"><h6 ng-bind="value.name" ng-click="changeRoute('album',{id: value.id})"></h6><p ng-click="changeRoute('artist',{id: value.artist.id})">{{value.artist.name}}</p></span>
		</li>
	</ul>
	<div class="loadmore" ng-click="loadMore()" ng-if="more">加载更多</div>
</div>