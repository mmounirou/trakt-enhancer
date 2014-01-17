$(document).ready(function() {
	console.log("");
	traktweb.fixIssues();
	traktweb.addPeopleProgressionChart();
	traktweb.addMovieReleaseLocalDate();
	traktweb.addCharts();
	traktweb.addTimeLine();
	traktweb.addMovieCollectionBar();


	$("div.person[style*='poster-dark']").parent().forEach(function(elmt){
		console.log(elmt);
	});

})