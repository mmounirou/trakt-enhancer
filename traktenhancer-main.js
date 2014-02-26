$(document).ready(function() {
	console.log("");
	traktweb.fixIssues();
	traktweb.addPeopleProgressionChart();
	traktweb.addMovieReleaseLocalDate();
	traktweb.addCharts();
	traktweb.addTimeLine();
	traktweb.addMovieCollectionBar();

	if(trakt.getUserName() == "mmounirou" || trakt.getUserName() == "madmaxpt"){
		traktweb.addYifyDownload();
	}
})


