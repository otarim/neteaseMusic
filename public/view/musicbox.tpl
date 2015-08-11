<div class="widget" ng-class="{
	'widget-show': show,
	'widget-showList': list
}">
	<div class="widget-albumPic">
		<img ng-src="{{data.current.pic}}" alt="">
	</div>
	<div class="widget-content">
		<div class="widget-header">
			<p class="widget-title" ng-switch on="data.play">
				<em ng-switch-when="false">build by otarim</em>
				<em ng-switch-when="true" ng-class="{play: data.play}">正在播放: {{data.curIndex + 1}}. {{data.playing}}</em>
			</p>
			<div class="widget-tool">
				<a href="" class="fa fa-fast-backward" ng-click="playPrev()"></a>
				<a href="" class="fa" ng-class="{
					'fa-play': paused,
					'fa-pause': !paused
				}"ng-click="play(data.current,data.curIndex)"></a>
				<a href="" class="fa fa-fast-forward" ng-click="playNext()"></a>
				<a href="" class="fa fa-random" ng-class="{
					'selected': data.shuffle
				}" ng-click="toggleShuffle()"></a>
				<a href="" class="fa fa-navicon" ng-click="showList()"></a>
			</div>
		</div>
		<div class="widget-progress">
			<time class="begin">0:00</time><input type="range" name="" id="" min="0" max="{{+data.current.duration / 1e3}}" ng-model="song.audio.currentTime" step="0.01"><time class="end" ng-if="data.current">{{data.current.duration|formatTime}}</time><time class="end" ng-if="!data.current">--:--</time>
		</div>
	</div>
	<ul class="widget-list" ng-class="{'widget-list-show': list}" ng-if="data.playList.length">
		<li class="tool">
			<span class="clear" ng-click="emptyList()">清空列表</span>
		</li>
		<li ng-repeat="(key, value) in data.playList" ng-dblclick="play(value,$index)" ng-class="{active: data.curIndex === $index}">
			<p><span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-time">{{value.duration|formatTime}}</span></p>
		</li>
	</ul>
	<i class="widget-toggle" ng-click="toggleShow()">{{statusText}}</i>
</div>