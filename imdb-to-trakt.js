var username = "mmounirou";
var password = "52eb2e68c6cea96ae2bdf9cc9a3ac98e90aba624";
var apiKey = "3f54d682c5c02ac47c0d0db1a5db35c1";

function updateTraktList(listSlug, newItems) {


	var getRequest = $.ajax({
		url: "http://api.trakt.tv/user/list.json/" + apiKey + "/" + username + "/" + listSlug,
		type: "GET",
		dataType: "json"
	});

	getRequest.done(function(result) {
		if(result["items"] == undefined){
			console.log("fail to update "+listSlug);
			console.log(result);
			return ;
		}

		var previousItems = result["items"].map(function(elmnt, index) {
			var kind = elmnt["type"];
			return {
				"type": kind,
				"imdb_id": elmnt[kind]["imdb_id"]
			}
		});

		var deleteData = {
			"username": username,
			"password": password,
			"slug": listSlug,
			"items": previousItems
		}

		var deleteRequest = $.ajax({
			url: "http://api.trakt.tv/lists/items/delete/" + apiKey,
			type: "POST",
			data: JSON.stringify(deleteData),
			dataType: "json"
		});

		deleteRequest.done(function(result) {
			var updateData = {
				"username": username,
				"password": password,
				"slug": listSlug,
				"items": $.makeArray(newItems)
			}

			var updateRequest = $.ajax({
				url: "http://api.trakt.tv/lists/items/add/" + apiKey,
				type: "POST",
				data: JSON.stringify(updateData),
				dataType: "json"
			});

			updateRequest.done(function(result) {
				console.log(result);
			});
		});
	});
}

function loadImdbSearch(searchUrl, listId,itemtype) {
	console.log("Update list "+listId);
	var getRequest = $.ajax({
		url: searchUrl,
		type: "GET",
		dataType: "html"
	});

	getRequest.done(function(result) {
		result = result.substring(result.indexOf('<table class="results">'));
		result = result.substring(0,result.indexOf('</table>')+"</table>".length);

		var items = parseImdbSeachTable(result).map(function(index,elmt) {
			elmt.type = itemtype;
			return elmt;
		});

		updateTraktList(listId, items);
	});
}

function loadImdbChart(searchUrl, listId,itemtype) {
	console.log("Update list "+listId);
	var getRequest = $.ajax({
		url: searchUrl,
		type: "GET",
		dataType: "html"
	});

	getRequest.done(function(result) {
		result = result.substring(result.indexOf('<table class="chart">'));
		result = result.substring(0,result.indexOf('</table>')+"</table>".length);

		var items = parseImdbChartTable(result).map(function(index,elmt) {
			elmt.type = itemtype;
			return elmt;
		});

		updateTraktList(listId, items);
	});
}

function parseImdbChartTable(table) {
	return $(table).find("tr.odd,tr.even").map(function(index, elmt) {
	 return{
//		votes: parseFloat($(elmt).find(":last").text().trim().replace(",", ".")) * 1000,
//		rating: parseFloat($(elmt).find("b").text()),
		title: $(elmt).find("td.titleColumn a").text(),
		imdb_id: $(elmt).find("td.titleColumn a").attr("href").split("/")[2]
	}
	});
}

function parseImdbSeachTable(table) {
	return $(table).find("tr.odd,tr.even").map(function(index, elmt) {
	 return{
		votes: parseFloat($(elmt).find(":last").text().trim().replace(",", ".")) * 1000,
		rating: parseFloat($(elmt).find("b").text()),
		title: $(elmt).find("td a").text(),
		imdb_id: $(elmt).find("td a").attr("href").replace("/title/", "").replace("/", "")
	}
	});
}

function createTraktList(title, description, callback) {

	var findRequest = $.ajax({
		url: "http://api.trakt.tv/user/lists.json/"+apiKey+"/"+username,
		type: "GET",
		dataType: "json"
	});

	findRequest.done(function(result) {
		var matchingElmnt = result.filter(function(elmt){
			return elmt["name"]==title
		});

		if(matchingElmnt.length == 1)
		{
			callback(matchingElmnt[0]["slug"]);
		}
		else{
			var data = {
				"username": username,
				"password": password,
				"name": title,
				"description": description,
				"privacy": "public",
				"show_numbers": true,
				"allow_shouts": true
			}

			var request = $.ajax({
				url: "http://api.trakt.tv/lists/add/" + apiKey,
				type: "POST",
				data: JSON.stringify(data),
				dataType: "json"
			});

			request.done(function(result) {
				callback(result["slug"]);
			});
		}
	});


}

function loadImdbList(imdbListId) {


	var getRequest = $.ajax({
		url: "http://www.imdb.com/list/" + imdbListId,
		type: "GET",
		dataType: "html"
	});

	getRequest.done(function(result) {
		var description = $(result).find("h1.header").text();
		var title = "IMDB " + description;
		createTraktList(title, description, function(traktListId) {
			var items = $(result).find('.list_item div.info > b').map(function(index, show) {
				var movieTitle = $(show).children('a').text();
				var movieImdbId = $(show).children('a').attr('href').replace("/title/", "").replace("/", "");

				return {
					"type": "movie",
					"imdb_id": movieImdbId,
					"title": movieTitle
				}
			});

			updateTraktList(traktListId, items);
		});

		console.log(items);
	});
}



/*
.map(function(index, elmt) {
	elmt.wr = (elmt.votes / (elmt.votes + 5000)) * elmt.rating + (5000 / (elmt.votes + 5000)) * 7.0;
	return elmt;
}).toArray().sort(function(a, b) {
	return b.wr - a.wr;
})*/

$(document).ready(function() {
	console.log("");
	loadImdbChart("http://www.imdb.com/chart/top?ref_=nv_ch_250_4","imdb-best-250-movies","movie");

	loadImdbSearch("http://www.imdb.com/search/title?at=0&num_votes=5000,&sort=user_rating&title_type=tv_series","imdb-highest-rated-tv-series","show");
	loadImdbSearch("http://www.imdb.com/search/title?at=0&num_votes=5000,&sort=moviemeter&title_type=tv_series","imdb-most-popular-tv-series","show");
	loadImdbSearch("http://www.imdb.com/search/title?at=0&num_votes=5000,&sort=year,desc&title_type=tv_series","imdb-latest-tv-series","show");

	loadImdbSearch("http://www.imdb.com/search/title?count=250&release_date=2014,2014&title_type=feature&view=simple","imdb-popular-250-movies-for-2014","movie");
	loadImdbSearch("http://www.imdb.com/search/title?count=250&num_votes=5000,&release_date=2014,2014&sort=user_rating,desc&title_type=feature&view=simple","imdb-top-user-rated-movies-of-2014","movie");
	loadImdbSearch("http://www.imdb.com/search/title?count=250&num_votes=25000,&release_date=2013,2013&sort=user_rating,desc&title_type=feature&view=simple","imdb-top-user-rated-movies-of-2013","movie");
	loadImdbSearch("http://www.imdb.com/search/title?count=250&num_votes=25000,&release_date=2012,2012&sort=user_rating,desc&title_type=feature&view=simple","imdb-top-user-rated-movies-of-2012","movie");
})