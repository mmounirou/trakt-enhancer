$(document).ready(function() {
	if (window.location.href.indexOf("http://trakt.tv/person") == 0) {
		initTraktProgress();
	}

	if(window.location.href.indexOf("http://trakt.tv/movie") == 0)
	{
		initLocalReleaseDate();
	}

	initYifyEnhancement();


	//Fix an issue in trakt which allow the user to mark an item as seen or collected indefinitly
	$(".seen, .collection").click(function() {
		$(this).remove();
	});
})