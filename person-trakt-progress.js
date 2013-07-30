function updateProgressionArea(template, newCollected, newSeen) {
  //due to order in event firing the click event is sent to the extension
  //before sending to the trakt website.
  //So the .episode-overlay-seen and .episode-overlay-collection are not yet added

  console.log("");

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

function initTraktProgress() {
  $.get(chrome.extension.getURL("person-trakt-progress.ms.html"), function(data) {
    var template = Handlebars.compile(data);

    updateProgressionArea(template, false, false);

    $("#role-links>a").click(function() {
      updateProgressionArea(template, false, false);
    });

    $(".seen").click(function() {
      updateProgressionArea(template, false, true);
    });

    $(".collection").click(function() {
      updateProgressionArea(template, true, false);
    });
  });
}

function getStrMonth(month) {
  switch (month) {
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
}

function initLocalReleaseDate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      $.getJSON('http://ws.geonames.org/countryCode', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        type: 'JSON'
      }, function(result) {
        var userCountryName = result.countryName;
        var imdbId = $('#meta-imdb-id').attr("value");
        $.getJSON('http://mymovieapi.com', {
          id: imdbId,
          plot: 'none',
          type: 'json',
          episode: 0,
          lang: 'en-US',
          aka: 'simple',
          release: 'full',
          business: 0,
          tech: 0
        }, function(result) {
          var allUserReleaseDate = result.release_date.filter(function(countryRelease) {
            return countryRelease.country == userCountryName && countryRelease.day && countryRelease.month && countryRelease.year;
          });

          if (allUserReleaseDate.length == 0) {
            allUserReleaseDate = result.release_date.filter(function(countryRelease) {
              return countryRelease.country == userCountryName && countryRelease.month && countryRelease.year;
            });
          }

          if (allUserReleaseDate.length != 0) {
            //TODO instead of the first it will be great use the earliest date
            var userReleaseDate = allUserReleaseDate[0];
            var strdate = getStrMonth(userReleaseDate.month) + " " + userReleaseDate.day + ", " + userReleaseDate.year;
            $("div.show-details").find('p').has("span:contains('Released')").after('<p><span>Released '+userCountryName+'</span>'+strdate+'</p>');
            console.log(strdate);
          }
        });
      });
    });
  }
}