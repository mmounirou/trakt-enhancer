function initYifyEnhancement(){
	console.log("");

	$(".library-show , .poster").has('a[href^="/movie"]').each(function(index,data){
		var title = $(data).find(".title").text();
		
		var request = $.ajax({
			url: "http://yify-torrents.com/api/list.json",
			type: "GET",
			data: "limit=" + "1" + "&quality=" + "720p" +"&keywords="+title,
			dataType: "json"
		});

		request.done(function(result) {
            if(!(result["error"]==="No movies found")){
                $(data).find(".general").append('<span class="download show-tip" title="Download" />');
                $(data).find(".download").click(function(){
                    location.href = result[0]["TorrentUrl"];
                });
            }
		});

		request.fail(function(jqXHR, textStatus) {
			alert( "Request failed: " + textStatus );
		});
	})
}