window.imdbapi = (function() {
	function ImdbApi() {}

	ImdbApi.prototype.getMovies = function(imdbIds, callback) {
		var requests = [];
		var remainedImdbIds = imdbIds;
		var movies = [];

		while (remainedImdbIds.length > 0) {
			var partialImdbIds = _.first(remainedImdbIds, 10).join(",");
			remainedImdbIds = _.rest(remainedImdbIds, 10);

			var request = $.ajax({
				url: "http://mymovieapi.com/",
				data: "ids=" + partialImdbIds + "&plot=none&type=json&episode=0",
				type: "GET",
				dataType: "json",
				success: function(imdbMovies) {
					movies = movies.concat(imdbMovies);
				}
			});

			requests.push(request);
		}

		$.when.apply(undefined, requests).then(function() {
			callback(movies);
		});
	};

	ImdbApi.prototype.getMovie = function(imdbId, callback) {

		$.ajax({
			url: "http://mymovieapi.com/",
			data: "ids=" + imdbId + "&plot=none&type=json&episode=0&release=full",
			type: "GET",
			dataType: "json",
			success: function(movie) {
				callback(movie[0]);
			}
		});
	};

	return new ImdbApi();
}());