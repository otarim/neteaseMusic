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
		<p ng-if="data.artistCount" class="result-count">
			共找到{{data.artistCount}}个艺术家
		</p>
		<p ng-if="data.albumCount" class="result-count">
			共找到{{data.albumCount}}个专辑
		</p>
		<p ng-if="data.songCount" class="result-count">
			共找到{{data.songCount}}首歌
		</p>
		<p ng-if="data.playlistCount" class="result-count">
			共找到{{data.playlistCount}}个歌单
		</p>
		<p ng-if="data.userprofileCount" class="result-count">
			共找到{{data.userprofileCount}}个用户
		</p>
		<p ng-click="loadMore()">loadMore</p>
		<ul ng-class="{artists: data.artistCount,albums: data.albumCount,songs: data.songCount,'content-songs': data.songCount,playlist: data.playlistCount,users: data.userprofileCount}">
			<li ng-if="data.artistCount" ng-repeat="(key, value) in data.artists" data-id="{{value.id}}" ng-click="changeRoute('artist',{id: value.id})">
				<img ng-src="{{value.img1v1 === -1 ? value.img1v1Url : value.picUrl}}" alt="{{value.name}}" width="120" height="120">
				<h6 ng-bind="value.name"></h6>
				<p ng-bind="value.trans" ng-show="value.trans"></p>
			</li>
			<li ng-if="data.albumCount" ng-repeat="(key, value) in data.albums" data-id="{{value.id}}">
				<span class="album-wrap"><img ng-src="{{value.img1v1 === -1 ? value.img1v1Url : value.picUrl}}" alt="{{value.name}}" width="120" height="120" ng-click="changeRoute('album',{id: value.id})">
				</span>
				<span class="album-des"><h6 ng-bind="value.name" ng-click="changeRoute('album',{id: value.id})"></h6><p ng-click="changeRoute('artist',{id: value.artist.id})">{{value.artist.name}}</p></span>
			</li>
			<li ng-if="data.playlistCount" ng-repeat="(key, value) in data.playlists" data-id="{{value.id}}">
				<span class="playList-wrap"><img ng-src="{{value.coverImgUrl}}" alt="{{value.name}}" width="120" height="120" ng-click="changeRoute('playList',{id: value.id})"></span>
				<span class="playList-des"><h6 ng-bind="value.name" ng-click="changeRoute('playList',{id: value.id})"></h6><p ng-click="changeRoute('user',{id: value.creator.userId})">@{{value.creator.nickname}}</p></span>
			</li>
			<li ng-if="data.userprofileCount" ng-repeat="(key, value) in data.userprofiles" data-id="{{value.userId}}">
				<img ng-src="{{value.avatarUrl}}" alt="{{value.nickname}}" width="120" height="120" ng-click="changeRoute('user',{id: value.userId})"></span>
				<span class="playList-des"><h6 ng-bind="value.nickname" ng-click="changeRoute('user',{id: value.userId})"></h6>
			</li>
			<li ng-if="data.songCount" class="caption">
				<span class="song-index">&nbsp;</span><span class="song-title">歌名</span><span class="song-artist">艺术家</span><span class="song-album">专辑</span><span class="song-time">时间</span>
			</li>
			<li ng-if="data.songCount" ng-repeat="(key, value) in data.songs" data-id="{{value.id}}" ng-dblclick="play(value.id,$index)" ng-click="selectSong($index)" ng-class="{active: select === $index,odd: $odd}">
				<span class="song-index">{{$index+1}}</span><span class="song-title">{{value.name}}</span><span class="song-artist" ng-click="changeRoute('artist',{id: value.artists[0].id})">{{value.artists[0].name}}</span><span class="song-album" ng-click="changeRoute('album',{id: value.album.id})">{{value.album.name}}</span><span class="song-time">{{value.duration|formatTime}}</span>
				<i class="song-progress" ng-if="nowPlay === $index" style="-webkit-animation-duration: {{value.duration|getDuration}}s" ng-style="{'-webkit-animation-play-state': song.paused() ? 'paused':'running'}"></i>
			</li>
		</ul>
	</div>
</div>