function extendCollection(contents,extender) {
	var result = new Array();
	contents.forEach(function(content) {
		extender(content).forEach(function(extendedId) {
			var newContent = _.clone(content);
			newContent.extendedId = extendedId;
			result.push(newContent);
		});
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

			var contentsGroupedCountByYear = _.pairs(_.countBy(seenContents, function(content) {
				return content.year;
			}));

			var contentsGroupedByYear =_.groupBy(seenContents, function(content) {
				return content.year;
			});

			var moviesExtendedToGenre = extendCollection(seenContents,function(movie) {
				return movie.genres;
			})


			var contentsGroupedCountByGenres = _.pairs(_.countBy(moviesExtendedToGenre, function(content) {
				return content.extendedId;
			}));

			var contentsGroupedByGenres = _.groupBy(moviesExtendedToGenre, function(content) {
				return content.extendedId;
			});

			$(".main-wrapper").after("<div class='stats-wrapper'></div>");

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
						if(this.series.name == "By Year")
						{
							usedDatas = contentsGroupedByYear;
						}
						else{
							usedDatas = contentsGroupedByGenres;
						}
						var result = '<span style="color:'+this.series.color+'">'+this.point.name+'</span>: <b>'+this.point.y+'</b> '+contentType+'<br/> ';
						usedDatas[this.point.name].forEach(function(value) {
							result = result+"<br/> "+value.title;
						})
						return result+"<br/>";
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
					center: ["30%"],
				}, {
					type: 'pie',
					name: 'By Genre',
					data: contentsGroupedCountByGenres,
					center: ["70%"],
				}]
			});
		});
	}
})