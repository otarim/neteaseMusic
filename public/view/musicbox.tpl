<div class="widget">
	<p class="widget-title" ng-click="showList()" ng-switch on="data.play">
		<em ng-switch-when="false">build by otarim</em>
		<em ng-switch-when="true" ng-class="{play: data.play}">正在播放:{{data.playing}}</em>
	</p>
	<ul class="widget-list" ng-class="{'widget-list-show': list}">
		<li ng-repeat="(key, value) in data.playList" ng-dblclick="play(value,$index)" ng-swipe-left="play(value.mp3Url.replace('m1','m2'),$index)" ng-click="selectSong($index)" ng-class="{active: data.curIndex === $index}" style="position: relative">
			<p><span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-time">{{value.duration|formatTime}}</span></p>
			<i class="song-progress" ng-if="data.curIndex === $index" style="-webkit-animation-duration: {{value.duration|getDuration}}s" ng-style="{'-webkit-animation-play-state': song.paused() ? 'paused':'running'}"></i>
		</li>
	</ul>
	<i class="widget-toggle" ng-click="toggleShow()">收起</i>
</div>