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

	return new TraktUtils();

}());