//TODO allow the user to choose the downloaded torrent's quality
window.traktweb = (function() {
	function TraktWeb() {}

	TraktWeb.prototype.fixIssues = function() {
		//Fix an issue in trakt which allow the user to mark an item as seen or collected indefinitly
		$(".seen, .collection").click(function() {
			$(this).remove();
		});
	}

	TraktWeb.prototype.addYifyDownload = function() {
		var quality = "720p";
		if (trakt.onMoviePage()) {
			var imdbid = trakt.getImdbIdOnMoviePage();
			var callback = function(torrenturl) {
				if (torrenturl) {
					var imgSelectorId = "download-torrents";
					var targetSelectorId = "vip-refresh-wrapper";
					var magnetImgUrl = "http://b.dryicons.com/images/icon_sets/coquette_part_5_icons_set/png/128x128/magnet.png";
					$("#" + targetSelectorId).append('<img id="' + imgSelectorId + '" class="show-tip" title="" src="' + magnetImgUrl + '">');
					$("#" + imgSelectorId).click(function() {
						location.href = torrenturl;
					});
				}
			}
			yifyapi.getTorrentUrl(imdbid, quality, callback);
		} else {
			//on home page or elsewhere
			var movies = $(".library-show , .poster").has('a[href^="/movie"]').has('.add-to-list');

			movies.each(function(index, data) {
				var title = $(data).find(".title").text();
				var imdbid = $.parseJSON($(data).find(".add-to-list").attr('rel')).imdb_id;

				var callback = function(torrenturl) {
					$(data).find(".general").append('<span class="download show-tip" title="Download" />');
					$(data).find(".download").click(function() {
						location.href = torrenturl;
					});
				}
				yifyapi.getTorrentUrl(imdbid, quality, callback);
			});
		}
	}

	TraktWeb.prototype.updatePeopleProgressionChart = function(template, newCollected, newSeen) {
		var elmt = $("#role-links>a.current").attr("href").split("/").reverse();
		var kindId = elmt[1] + "-" + elmt[0];
		var kindDiv = $("#" + kindId);
		var allMovies = kindDiv.find(".library-show");

		var movieCount = allMovies.length;

		var collectedCount = (allMovies.find(".episode-overlay-collection").length) + ((newCollected) ? 1 : 0);
		var seenCount = (allMovies.find(".episode-overlay-seen").length) + ((newSeen) ? 1 : 0);
		var scrobbledCount = allMovies.find(".episode-overlay-watched").length;
		var scrobbledCheckin = allMovies.find(".episode-overlay-checkin").length;
		var watchedCount = seenCount + scrobbledCount + scrobbledCheckin;

		var context = {
			all: movieCount,
			watched: watchedCount,
			collected: collectedCount,
			remainWatched: movieCount - watchedCount,
			remainCollected: movieCount - collectedCount,
			progressPercent: Math.round(watchedCount * 100 / movieCount),
			collectPercent: Math.round(collectedCount * 100 / movieCount)
		}

		$("#progress-toggler").remove();
		$(".main-wrapper").before(template(context));
	}

	TraktWeb.prototype.addPeopleProgressionChart = function() {
		var that = this;
		if (trakt.onPersonPage()) {
			$.get(chrome.extension.getURL("stylesheets/person-trakt-progress.ms.html"), function(data) {
				var template = Handlebars.compile(data);

				that.updatePeopleProgressionChart(template, false, false);

				$("#role-links>a").click(function() {
					that.updatePeopleProgressionChart(template, false, false);
				});

				$(".seen").click(function() {
					that.updatePeopleProgressionChart(template, false, true);
				});

				$(".collection").click(function() {
					that.updatePeopleProgressionChart(template, true, false);
				});
			});
		}
	}

	TraktWeb.prototype.addMovieReleaseLocalDate = function() {
		if (trakt.onMoviePage() && navigator.geolocation) {


			var navigatorcallback = function(position) {
				var userCountryName = position.countryName;
				var imdbid = trakt.getImdbIdOnMoviePage();

				var imdbcallback = function(movie) {
					var allUserReleaseDate = movie.release_date.filter(function(countryRelease) {
						return countryRelease.country == userCountryName && countryRelease.day && countryRelease.month && countryRelease.year;
					});

					if (allUserReleaseDate.length == 0) {
						allUserReleaseDate = movie.release_date.filter(function(countryRelease) {
							return countryRelease.country == userCountryName && countryRelease.month && countryRelease.year;
						});
					}

					if (allUserReleaseDate.length != 0) {
						//TODO instead of the first it will be great use the earliest date
						var userReleaseDate = allUserReleaseDate[0];
						var strdate = trakt.getMonthLabel(userReleaseDate.month) + " " + userReleaseDate.day + ", " + userReleaseDate.year;
						$("div.show-details").find('p').has("span:contains('Released')").after('<p><span>Released ' + userCountryName + '</span>' + strdate + '</p>');
					}
				}

				imdbapi.getMovie(imdbid, imdbcallback);
			}

			navigator.geolocation.getCurrentPosition(function(position) {
				$.getJSON('http://ws.geonames.org/countryCode', {
					lat: position.coords.latitude,
					lng: position.coords.longitude,
					type: 'JSON'
				}, navigatorcallback);
			});
		}
	}

	TraktWeb.prototype.addChart = function(title, series, formatter, statselectorclass) {

		$('.' + statselectorclass).highcharts({
			chart: {
				plotBackgroundColor: '#e8e8dc',
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: title
			},
			tooltip: {
				formatter: formatter
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
			series: series
		});
	}

	TraktWeb.prototype.addCharts = function() {
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
		});

		var that = this;
		var getimdbid = function(content) {
			return content.imdb_id;
		}

		if (trakt.onChartPage()) {
			var username = trakt.getUserName();
			var librarytype = trakt.onMovieChartPage() ? "movies" : "shows";
			var callback = function(contents) {
				that.addByYearAndGenreCharts(contents, librarytype);

				var imdbids = contents.map(getimdbid);
				var imdbapicallback = function(imdbcontents) {
					var contentsbyimdbid = _.groupBy(contents, getimdbid);
					imdbcontents.forEach(function(imdbcontent) {
						contentsbyimdbid[getimdbid(imdbcontent)][0].imdbContent = imdbcontent;
					});

					that.addByActorAndDirectorCharts(contents, librarytype);
				}

				imdbapi.getMovies(imdbids, imdbapicallback);
			}
			traktapi.getUserLibrary(username, librarytype, callback);
		}
	}

	TraktWeb.prototype.addByYearAndGenreCharts = function(contents, contenttype) {
		var that = this;
		var seenfilter = function(content) {
			return content.plays != 0;
		}
		var getyear = function(content) {
			return content.year;
		}
		var getgenres = function(content) {
			return content.genres;
		}
		var getgenre = function(content) {
			return content["genre"];
		}


		var seencontents = contents.filter(seenfilter);
		var seencontentsbyyear = _(seencontents).groupBy(getyear);
		var seencontentsbyyear_count = _.pairs(_(seencontents).countBy(getyear));

		var seencontentsexpandedbygenre = traktutils.expandArray(seencontents, "genre", getgenres);
		var seencontentsbygenre = _(seencontentsexpandedbygenre).groupBy(getgenre);
		var seencontentsbygenre_count = _.pairs(_(seencontentsexpandedbygenre).countBy(getgenre));

		var tooltipformatter = function() {
			var groupedseencontents = (this.series.name == "By Year") ? seencontentsbyyear : seencontentsbygenre;
			var result = '<span style="color:' + this.series.color + '">' + this.point.name + '</span>: <b>' + this.point.y + '</b> ' + contenttype + '<br/> ';
			groupedseencontents[this.point.name].forEach(function(value) {
				result = result + "<br/> " + value.title;
			})
			return result + "<br/>";
		};

		var series = [{
			type: 'pie',
			name: 'By Year',
			data: seencontentsbyyear_count,
			center: ["30%"],
		}, {
			type: 'pie',
			name: 'By Genre',
			data: seencontentsbygenre_count,
			center: ["70%"],
		}];

		var statSelectorClass = "stats-year-genre-wrapper";
		$(".main-wrapper").after("<div class='" + statSelectorClass + "'></div>");
		that.addChart("", series, tooltipformatter, statSelectorClass);
	}

	TraktWeb.prototype.addByActorAndDirectorCharts = function(contents, contenttype) {
		var that = this;
		var seenfilter = function(content) {
			return content.plays != 0;
		}
		var getdirector = function(content) {
			return content["director"];
		}
		var getdirectors = function(content) {
			if (content.imdbContent) {
				return content.imdbContent.directors;
			} else {
				console.log(content);
			}
		}

		var getactors = function(content) {
			if (content.imdbContent) {
				return content.imdbContent.actors;
			} else {
				console.log(content);
			}
		}
		var getactor = function(content) {
			return content["actor"];
		}

		var getcount = function(pair) {
			return pair[1];
		}


		var seencontents = contents.filter(seenfilter);
		var seencontentsexpandedbyactor = traktutils.expandArray(seencontents, "actor", getactors);
		var seencontentsbyactor = _(seencontentsexpandedbyactor).groupBy(getactor);
		var seencontentsbyactor_count = _.last(_.sortBy(_.pairs(_(seencontentsexpandedbyactor).countBy(getactor)), getcount), 100);

		var seencontentsexpandedbydirectors = traktutils.expandArray(seencontents, "director", getdirectors);
		var seencontentsbydirector = _(seencontentsexpandedbydirectors).groupBy(getdirector);
		var seencontentsbydirector_count = _.last(_.sortBy(_.pairs(_(seencontentsexpandedbydirectors).countBy(getdirector)), getcount), 100);

		var tooltipformatter = function() {
			var groupedseencontents = (this.series.name == "By Actor") ? seencontentsbyactor : seencontentsbydirector;
			var result = '<span style="color:' + this.series.color + '">' + this.point.name + '</span>: <b>' + this.point.y + '</b> ' + contenttype + '<br/> ';
			groupedseencontents[this.point.name].forEach(function(value) {
				result = result + "<br/> " + value.title;
			})
			return result + "<br/>";
		};

		var series = [{
			type: 'pie',
			name: 'By Actor',
			data: seencontentsbyactor_count,
			center: ["30%"],
		}, {
			type: 'pie',
			name: 'By Director',
			data: seencontentsbydirector_count,
			center: ["70%"],
		}];

		var statSelectorClass = "stats-actor-director-wrapper";
		$(".stats-year-genre-wrapper").after("<div class='" + statSelectorClass + "'></div>");
		that.addChart("", series, tooltipformatter, statSelectorClass);
	}


	return new TraktWeb();
}());