window.traktutils = (function() {
	function TraktUtils() {}

	TraktUtils.prototype.expandArray = function(values, attributeId, callback) {
		var result = [];
		values.forEach(function(content) {
			var extendedsIds = callback(content);
			if (extendedsIds) {
				extendedsIds.forEach(function(extendedId) {
					var newContent = _.clone(content);
					newContent[attributeId] = extendedId;
					result.push(newContent);
				});
			}
		});
		return result;
	};

	TraktUtils.prototype.getCachedJSONs = function(urls,callback){

		var notCachedUrls = urls.filter(function(url) {
			var item = JSON.parse(localStorage.getItem(url));
			return item === null || new Date(item.expirationDate) < new Date();
		});

		var requests = [];
		var datas = [];

		notCachedUrls.forEach(function(usedUrl){

			var callback = function(movie) {
				movies.push(movie);
			}

			var request = $.ajax({
				url: usedUrl,
				type: "GET",
				dataType: "json",
				success: function(data) {
					datas.push(data);
				}
			});

			requests.push(request);
		});

		$.when.apply(undefined, requests).then(function() {
			callback(datas);
		});
	};

	return new TraktUtils();

}());

