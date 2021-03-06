<div class="playList">
	<div class="header-info">
		<img ng-src="{{data.coverImgUrl}}" alt="">
		<h2 ng-bind="data.name"></h2>
		<p ng-bind="data.description"></p>
	</div>
	<ul class="content-songs">
		<li class="playAll" ng-click="playAll(data.tracks)">播放全部</li>
		<li class="caption">
			<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-artist">艺术家</span><span class="song-album">专辑</span><span class="song-time" ng-click="toggleOrder('duration')">时间</span><span class="song-score" ng-click="toggleOrder('score')">热度</span>
		</li>
		<li ng-repeat="(key, value) in data.tracks | orderBy: order: rev" ng-click="selectSong($index)" ng-class="{active: index === $index,odd: $odd}">
			<span class="song-index">{{$index+1}}<a href="" class="fa fa-play-circle-o" ng-click="play(value,$index)"></a></span><span class="song-title">{{value.name}}</span><span class="song-artist"><a href="" ng-click="changeRoute('artist',{id: value.artists[0].id})">{{value.artists[0].name}}</a></span><span class="song-album"><a href="" ng-click="changeRoute('album',{id: value.album.id})">{{value.album.name}}</a></span><span class="song-time">{{value.duration|formatTime}}</span><span class="song-score"><i><b ng-style="{width: value.score+'%'}"></b></i></span>
		</li>
	</ul>
</div>