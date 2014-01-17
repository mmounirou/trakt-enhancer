window.tmdbapi = (function() {


	function TmdbApi() {
		this.apiKey = 'cc1237496e5d352b0c208a2f4d04fbda';
		this.apiUrl = 'http://private-ee03-themoviedb.apiary.io/'
	}

	Date.prototype.addDays = function(days){
	    var dat = new Date(this.valueOf());
	    dat.setDate(dat.getDate() + days);
	    return dat;
	};


	TmdbApi.prototype.getMovies = function(tmdbIds, callback) {
		var self = this;

		var tmdbUrls = tmdbIds.map(function(tmdbId) {
			return self.apiUrl + "3/movie/"+tmdbId+"?api_key="+self.apiKey;
		});

	 	traktutils.getCachedJSONs(tmdbUrls,callback);
	};


	TmdbApi.prototype.getCollections = function(tmdbIds, callback) {
		var self = this;

		var tmdbUrls = tmdbIds.map(function(tmdbId) {
			return self.apiUrl + "3/collection/"+tmdbId+"?api_key="+self.apiKey;
		});

	 	traktutils.getCachedJSONs(tmdbUrls,callback);
	};

	return new TmdbApi();
}());