<div class="album">
	<div class="album-info">
		<img ng-src="{{data.album.img1v1 === -1 ? data.album.img1v1Url : data.album.picUrl}}" alt="">
		<h2 ng-bind="data.album.name"></h2>
		<p>
			<span ng-repeat="(key, value) in data.album.alias">{{value}}</span>
		</p>
	</div>
	<ul class="album-songs">
		<li class="caption">
			<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-album">专辑</span><span class="song-time">时间</span><span class="song-score">热度</span>
		</li>
		<li ng-repeat="(key, value) in data.album.songs" ng-dblclick="play(value,$index)" ng-swipe-left="play(value.mp3Url.replace('m1','m2'),$index)" ng-click="selectSong($index)" ng-class="{active: index === $index,odd: $odd}">
			<span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-album">{{value.album.name}}</span><span class="song-time">{{value.duration|formatTime}}</span><span class="song-score"><i><b ng-style="{width: value.score+'%'}"></b></i></span>
			<i class="song-progress" ng-if="nowPlay === $index" style="-webkit-animation-duration: {{value.duration|getDuration}}s" ng-style="{'-webkit-animation-play-state': song.paused() ? 'paused':'running'}"></i>
		</li>
	</ul>
</div>