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

	TmdbApi.prototype.getTmdbActorPicture =function(traktLink,callback) {

		var item = JSON.parse(localStorage.getItem(traktLink));
		if(item === null || new Date(item.expirationDate) < new Date()){
			console.log("query server for "+traktLink);
			$.get( traktLink, function( traktData ) {
				var link = traktData.substring(traktData.indexOf("http://themoviedb.org/person/"),traktData.indexOf("http://themoviedb.org/person/") + 60);
				var tmdbId = link.substring(0,link.indexOf('"')).replace("http://themoviedb.org/person/","");

				$.get( "http://www.themoviedb.org/person/" + tmdbId , function(tmdbData) {
					var tmdbIndex = tmdbData.indexOf("http://image.tmdb.org/t/");
					var tmdbPersonImage = "";
					if(tmdbIndex > 0){
						var tmdbLink = tmdbData.substring(tmdbIndex,tmdbIndex + 100);
						tmdbPersonImage = tmdbLink.substring(0,tmdbLink.indexOf('"'));
					}

					var tomorrow = new Date(new Date().getTime() + (24 * 60 * 60 * 1000));
					localStorage.setItem(traktLink,JSON.stringify({
						expirationDate : tomorrow,
						link: tmdbPersonImage
					})),
					callback(tmdbPersonImage);
				});

			});
		}
		else{
			console.log("use cache");
			callback(item.link);
		}


	};

	return new TmdbApi();
}());