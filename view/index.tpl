<div class="main">
	<div class="search">
		<p class="search-type">
			<a href="javascript:;" ng-repeat="(key,value) in type" ng-click="setType(key,$index)" ng-bind="value" ng-class="{active: index === $index}"></a>
 		</p>
		<div class="search-handler">
			<input type="text" name="" id="" ng-model="searchItem" ng-model-options="{updateOn: 'blur'}" autofocus placeholder="{{type[selectedType]}}">
			<button class="btn-primary" ng-click="search()">search</button>
		</div>
	</div>
	<div class="result">
		<p ng-if="result.result.artistCount" class="result-count">
			共找到{{result.result.artistCount}}个艺术家
		</p>
		<p ng-if="result.result.albumCount" class="result-count">
			共找到{{result.result.albumCount}}个专辑
		</p>
		<p ng-if="result.result.songCount" class="result-count">
			共找到{{result.result.songCount}}首歌
		</p>
		<ul ng-class="{artists: result.result.artistCount,albums: result.result.albumCount,songs: result.result.songCount}">
			<li ng-if="result.result.artistCount" ng-repeat="(key, value) in result.result.artists" data-id="{{value.id}}" ng-click="changeRoute('artist',{id: value.id})">
				<img ng-src="{{value.img1v1 === -1 ? value.img1v1Url : value.picUrl}}" alt="{{value.name}}" width="120" height="120">
				<h6 ng-bind="value.name"></h6>
				<p ng-bind="value.trans" ng-show="value.trans"></p>
			</li>
			<li ng-if="result.result.albumCount" ng-repeat="(key, value) in result.result.albums" data-id="{{value.id}}">
				<span class="album-wrap"><img ng-src="{{value.img1v1 === -1 ? value.img1v1Url : value.picUrl.replace('p3','p2')}}" alt="{{value.name}}" width="120" height="120" ng-click="changeRoute('album',{id: value.id})"></span>
				<span class="album-des"><h6 ng-bind="value.name" ng-click="changeRoute('album',{id: value.id})"></h6><p ng-click="changeRoute('artist',{id: value.artist.id})">@{{value.artist.name}}</p></span>
			</li>
			<li ng-if="result.result.songCount" class="caption">
				<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-artist">艺术家</span><span class="song-album">专辑</span><span class="song-time">时间</span>
			</li>
			<li ng-if="result.result.songCount" ng-repeat="(key, value) in result.result.songs" data-id="{{value.id}}" ng-dblclick="play(value.id,$index)" ng-click="selectSong($index)" ng-class="{active: select === $index,odd: $odd}">
				<span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-artist" ng-click="changeRoute('artist',{id: value.artists[0].id})">{{value.artists[0].name}}</span><span class="song-album" ng-click="changeRoute('album',{id: value.album.id})">{{value.album.name}}</span><span class="song-time">{{value.duration|formatTime}}</span>
				<i class="song-progress" ng-if="nowPlay === $index" style="-webkit-animation-duration: {{value.duration|getDuration}}s" ng-style="{'-webkit-animation-play-state': song.paused() ? 'paused':'running'}"></i>
			</li>
		</ul>
	</div>
</div>