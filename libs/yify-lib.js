window.yifyapi = (function() {
	function YifyApi() {}

	YifyApi.prototype.getTorrentUrl = function(imdbId, quality, callback) {
		var request = $.ajax({
			url: "http://yify-torrents.com/api/list.json",
			type: "GET",
			data: "limit=" + "1" + "&quality=" + quality + "&keywords=" + imdbId,
			dataType: "json"
		});

		request.done(function(result) {
			var movieTorrentUrl;
			if (!(result["error"] === "No movies found")) {
				movieTorrentUrl = result["MovieList"][0]["TorrentUrl"];
			}
			callback(movieTorrentUrl);
		});
	};

	return new YifyApi();
}());