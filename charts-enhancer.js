function extendCollection(extendedAttribute, contents, extender) {
	var result = new Array();
	contents.forEach(function(content) {
		var extendedsIds = extender(content);
		if (extendedsIds) {
			extendedsIds.forEach(function(extendedId) {
				var newContent = _.clone(content);
				newContent[extendedAttribute] = extendedId;
				result.push(newContent);
			});
		}
	});
	return result;
}

function groupMoviesByGenres(contents) {
	var result = new Array();
	contents.forEach(function(content) {
		content.genres.forEach(function(genreId) {
			var count = result[genreId];
			if (isNaN(count)) {
				count = 0;
			}
			result[genreId] = count + 1;
		});
	});
	return result;
}

$(document).ready(function() {

	if (window.location.href.indexOf("charts") >= 0) {
		var username = $(".name > a").attr("href").replace("/user/", "");
		var apiKey = "3f54d682c5c02ac47c0d0db1a5db35c1";
		var contentType = "shows"
		if (window.location.href.indexOf("movies") >= 0) {
			contentType = "movies";
		}
		var request = $.ajax({
			url: "http://api.trakt.tv/user/library/" + contentType + "/all.json/" + apiKey + "/" + username,
			type: "GET",
			dataType: "json"
		});

		request.done(function(result) {
			var seenContents = result.filter(function(content) {
				return content.plays != 0;
			});

			// Radialize the colors
			Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function(color) {
				return {
					radialGradient: {
						cx: 0.5,
						cy: 0.3,
						r: 0.7
					},
					stops: [
						[0, color],
						[1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
						]
				};
			})
			statOnTraktAttributes(seenContents, contentType);
			statOnImdbAttributes(seenContents, contentType);

		});
	}
})

function statOnImdbAttributes(seenContents, contentType) {
	var seenContentByImdbId = _.groupBy(seenContents, function(movie) {
		return movie.imdb_id;
	});

	var keys = _.keys(seenContentByImdbId);
	var allRequests = [];
	while (keys.length > 0) {
		var imdbIds = _.first(keys, 10).join(",");
		keys = _.rest(keys, 10);

		var request = $.ajax({
			url: "http://mymovieapi.com/",
			data: "ids=" + imdbIds + "&plot=none&type=json&episode=0",
			type: "GET",
			dataType: "json",
			success: function(imdbMovies) {
				imdbMovies.forEach(function(movieMovie) {
					seenContentByImdbId[movieMovie.imdb_id][0].imdbContent = movieMovie;
				});
			}
		});

		allRequests.push(request);
	}

	$.when.apply(undefined, allRequests).then(function(datas) {
		var movies = _.values(seenContentByImdbId);

		var moviesExtendedToActor = extendCollection("actor", seenContents, function(movie) {
			if(movie.imdbContent){
				return movie.imdbContent.actors;
			}
		})

		var moviesExtendedToDirector = extendCollection("director", seenContents, function(movie) {
			if(movie.imdbContent){
				return movie.imdbContent.directors;
			}
		})

		var contentsGroupedCountByActor = _.last(_.sortBy(_.pairs(_.countBy(moviesExtendedToActor, function(content) {
			return content["actor"];
		})),function(value){
			return value[1];
		}),50);

		var contentsGroupedByActor = _.groupBy(moviesExtendedToActor, function(content) {
			return content["actor"];
		});

		var contentsGroupedCountByDirector = _.last(_.sortBy(_.pairs(_.countBy(moviesExtendedToDirector, function(content) {
			return content["director"];
		})),function(value){
			return value[1];
		}),50);

		var contentsGroupedByDirector = _.groupBy(moviesExtendedToDirector, function(content) {
			return content["director"];
		});

		$(".stats-wrapper").after("<div class='stats-people-wrapper'></div>");

		$('.stats-people-wrapper').highcharts({
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: "All Time Seens " + contentType + " Stats"
			},
			tooltip: {
				formatter: function() {
					var usedDatas = null;
					if (this.series.name == "By Actor") {
						usedDatas = contentsGroupedByActor;
					} else {
						usedDatas = contentsGroupedByDirector;
					}
					var result = '<span style="color:' + this.series.color + '">' + this.point.name + '</span>: <b>' + this.point.y + '</b> ' + contentType + '<br/>';
					usedDatas[this.point.name].forEach(function(value) {
						result = result + "<br/>" + value.title;
					})
					return result + "<br/>";
				}
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						color: '#000000',
						connectorColor: '#000000',
						format: '<b>{point.name}</b>: {point.percentage:.1f} %'
					}
				}
			},
			series: [{
				type: 'pie',
				name: 'By Actor',
				data: contentsGroupedCountByActor,
				center: ["25%"],
			}, {
				type: 'pie',
				name: 'By Director',
				data: contentsGroupedCountByDirector,
				center: ["75%"],
			}]
		});
	});
}

function statOnTraktAttributes(seenContents, contentType) {
	$(".main-wrapper").after("<div class='stats-wrapper'></div>");

	var contentsGroupedCountByYear = _.pairs(_.countBy(seenContents, function(content) {
		return content.year;
	}));

	var contentsGroupedByYear = _.groupBy(seenContents, function(content) {
		return content.year;
	});

	var moviesExtendedToGenre = extendCollection("genre", seenContents, function(movie) {
		return movie.genres;
	})


	var contentsGroupedCountByGenres = _.pairs(_.countBy(moviesExtendedToGenre, function(content) {
		return content["genre"];
	}));

	var contentsGroupedByGenres = _.groupBy(moviesExtendedToGenre, function(content) {
		return content["genre"];
	});

	$('.stats-wrapper').highcharts({
		chart: {
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false
		},
		title: {
			text: "All Time Seens " + contentType + " Stats"
		},
		tooltip: {
			formatter: function() {
				var usedDatas = null;
				if (this.series.name == "By Year") {
					usedDatas = contentsGroupedByYear;
				} else {
					usedDatas = contentsGroupedByGenres;
				}
				var result = '<span style="color:' + this.series.color + '">' + this.point.name + '</span>: <b>' + this.point.y + '</b> ' + contentType + '<br/> ';
				usedDatas[this.point.name].forEach(function(value) {
					result = result + "<br/> " + value.title;
				})
				return result + "<br/>";
			}
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: true,
					color: '#000000',
					connectorColor: '#000000',
					format: '<b>{point.name}</b>: {point.percentage:.1f} %'
				}
			}
		},
		series: [{
			type: 'pie',
			name: 'By Year',
			data: contentsGroupedCountByYear,
			center: ["25%"],
		}, {
			type: 'pie',
			name: 'By Genre',
			data: contentsGroupedCountByGenres,
			center: ["75%"],
		}]
	});
}