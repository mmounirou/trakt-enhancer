function initYifyEnhancement(){
	console.log("");

	$(".library-show").has('a[href^="/movie"]').each(function(index,data){
		var title = $(data).find(".title").text();
		
		var request = $.ajax({
			url: "http://yify-torrents.com/api/list.json",
			type: "GET",
			data: "limit=" + "1" + "&quality=" + "720p" +"&keywords="+title,
			dataType: "json"
		});

		request.done(function(result) {
			if(!(result["error"]==="No movies found"))
			{
				console.log(title);
				console.log(result[0]["TorrentMagnetUrl"]);
				$(data).find(".general").append('<span class="watchlist show-tip" title="XXXXXXXXXXXXXXXX">');
			}

		});

		request.fail(function(jqXHR, textStatus) {
			alert( "Request failed: " + textStatus );
		});
	})
}