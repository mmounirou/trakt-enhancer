 $.get(chrome.extension.getURL("person-trakt-progress.ms.html"),function(data){
    var template = Handlebars.compile(data);

     function parseKind(href){
        var elmt = $(href).attr("href").split("/").reverse();
        return elmt[1]+"-"+elmt[0];
     }
     
    function insertProgression(kindId){
        var kindDiv = $("#"+kindId);
        var allMovies = kindDiv.find(".library-show");
        
        var movieCount = allMovies.length;
        
        var collectedCount = allMovies.find(".episode-overlay-collection").length;
        var seenCount = allMovies.find(".episode-overlay-seen").length;
        var scrobbledCount = allMovies.find(".episode-overlay-watched").length;
        var watchedCount = seenCount + scrobbledCount;
        
        var context = {all:movieCount,
                       watched:watchedCount,
                       collected:collectedCount,
                       remainWatched:movieCount - watchedCount,
                       remainCollected:movieCount - collectedCount,
                       progressPercent:Math.round(watchedCount*100/movieCount),
                       collectPercent:Math.round(collectedCount*100/movieCount)
                      }

        $("#progress-toggler").remove();
        $(".main-wrapper").before(template(context));        
    }

    
    insertProgression(parseKind($("#role-links>a.current")));
    
    $("#role-links>a").click(function(){
        insertProgression(parseKind($(this)));
    });

}); 
