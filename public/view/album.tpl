<div class="album">
	<div class="header-info">
		<img ng-src="{{data.album.img1v1 === -1 ? data.album.img1v1Url : data.album.picUrl}}" alt="">
		<h2 ng-bind="data.album.name"></h2>
		<p>
			<span ng-repeat="(key, value) in data.album.alias">{{value}}</span>
		</p>
	</div>
	<ul class="content-songs">
		<li class="caption">
			<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-artist">艺术家</span><span class="song-time" ng-click="toggleOrder('duration')">时间</span><span class="song-score" ng-click="toggleOrder('score')">热度</span>
		</li>
		<li ng-repeat="(key, value) in data.album.songs | orderBy: order: rev" ng-dblclick="play(value,$index)" ng-click="selectSong($index)" ng-class="{active: index === $index,odd: $odd}">
			<span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-artist" ng-click="changeRoute('artist',{id: value.artists[0].id})">{{value.artists[0].name}}</span><span class="song-time">{{value.duration|formatTime}}</span><span class="song-score"><i><b ng-style="{width: value.score+'%'}"></b></i></span>
		</li>
	</ul>
</div>