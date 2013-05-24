function queryYify(title,success){
   		var request = $.ajax({
			url: "http://yify-torrents.com/api/list.json",
			type: "GET",
			data: "limit=" + "1" + "&quality=" + "720p" +"&keywords="+title,
			dataType: "json"
		});

		request.done(function(result) {
            if(!(result["error"]==="No movies found")){
                var movieTorrentUrl = result["MovieList"][0]["TorrentUrl"];
                success(movieTorrentUrl);
            }
		}); 
}

function initYifyEnhancement(){
	console.log("");

    if(window.location.href.indexOf("http://trakt.tv/movie") == 0){
		initTraktProgress();
	}
    
	$(".library-show , .poster").has('a[href^="/movie"]').each(function(index,data){
		var title = $(data).find(".title").text();
		queryYify(title,function(movieTorrentUrl){
             $(data).find(".general").append('<span class="download show-tip" title="Download" />');
            $(data).find(".download").click(function(){
                    location.href = movieTorrentUrl;
                });
        });
	})
}