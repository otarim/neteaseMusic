<div class="user">
	<div class="header-info" ng-style="{
		background: '#000 url('+data.playlist[0].creator.backgroundUrl+') no-repeat center'
	}">
		<img ng-src="{{data.playlist[0].creator.avatarUrl}}" alt="">
		<div class="desc">
			<h2 ng-bind="data.playlist[0].creator.nickname"></h2>
			<p ng-bind="data.playlist[0].creator.signature">
		</div>
		</p>
	</div>
	<h4>ta的歌单:</h4>
	<ul class="playlist">
		<li ng-repeat="(key, value) in playlist" data-id="{{value.id}}">
			<img ng-src="{{value.coverImgUrl}}" alt="{{value.name}}" width="120" height="120" ng-click="changeRoute('playList',{id: value.id})"></span>
			<h6 ng-bind="value.name" ng-click="changeRoute('playList',{id: value.id})"></h6>
		</li>
	</ul>
	<div class="loadmore" ng-click="loadMore()" ng-if="more">加载更多</div>
</div>