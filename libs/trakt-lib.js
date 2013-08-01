window.trakt = (function() {
	function Trakt() {}

	Trakt.prototype.onMoviePage = function() {
		return window.location.href.indexOf("http://trakt.tv/movie/") == 0;
	};

	Trakt.prototype.onPersonPage = function() {
		return window.location.href.indexOf("http://trakt.tv/person") == 0;
	};

	Trakt.prototype.onHomePage = function() {
		return window.location.href == "http://trakt.tv/";
	};

	Trakt.prototype.onChartPage = function() {
		return window.location.href.indexOf("charts") >= 0;
	};

	Trakt.prototype.onMovieChartPage = function() {
		return window.location.href.indexOf("charts") >= 0 && window.location.href.indexOf("movies") >= 0;
	};

	Trakt.prototype.getImdbIdOnMoviePage = function() {
		return $('#meta-imdb-id').attr("value");
	};

	Trakt.prototype.getUserName = function() {
		return $("div.user a").attr('href').replace("/user/","");
	};



	Trakt.prototype.getMonthLabel = function(nmonth) {
		switch (nmonth) {
			case (1):
				return "January";
			case (2):
				return "February";
			case (3):
				return "March";
			case (4):
				return "April";
			case (5):
				return "May";
			case (6):
				return "June";
			case (7):
				return "July";
			case (8):
				return "August";
			case (9):
				return "September";
			case (10):
				return "October";
			case (11):
				return "November";
			case (12):
				return "December ";
		}
	};

	return new Trakt();
}());

window.traktapi = (function() {
	function TraktApi(apiKey) {
		this.apiKey = apiKey;
	}

	TraktApi.prototype.getUserLibrary = function(username, librarytype, callback) {
		var that = this;
		var request = $.ajax({
			url: "http://api.trakt.tv/user/library/" + librarytype + "/all.json/" + that.apiKey + "/" + username,
			type: "GET",
			dataType: "json",
			success: callback
		});
	};

	TraktApi.prototype.getUserActivity = function(username, librarytype, callback,min) {
		var that = this;
		if(min == undefined)
		{
			min = 1;
		}
		var request = $.ajax({
			url: "http://api.trakt.tv/activity/user.json/" + that.apiKey + "/" + username + "/"+librarytype+"/watching,scrobble,seen?min="+min,
			type: "GET",
			dataType: "json",
			success: callback
		});
	};

	return new TraktApi("3f54d682c5c02ac47c0d0db1a5db35c1");
}());