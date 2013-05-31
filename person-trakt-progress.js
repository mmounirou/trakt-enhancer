function updateProgressionArea(template,newCollected,newSeen){
    //due to order in event firing the click event is sent to the extension
    //before sending to the trakt website.
    //So the .episode-overlay-seen and .episode-overlay-collection are not yet added
    
    console.log("");
    
    var elmt = $("#role-links>a.current").attr("href").split("/").reverse();
    var kindId =  elmt[1]+"-"+elmt[0];
    var kindDiv = $("#"+kindId);
    var allMovies = kindDiv.find(".library-show");
    
    var movieCount = allMovies.length;
    
    var collectedCount = (allMovies.find(".episode-overlay-collection").length) + ((newCollected)?1:0);
    var seenCount = (allMovies.find(".episode-overlay-seen").length) + ((newSeen)?1:0);
    var scrobbledCount = allMovies.find(".episode-overlay-watched").length; 
    var scrobbledCheckin = allMovies.find(".episode-overlay-checkin").length;
    var watchedCount = seenCount + scrobbledCount + scrobbledCheckin;
    
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

function initTraktProgress() {
    $.get(chrome.extension.getURL("person-trakt-progress.ms.html"),function(data){
      var template = Handlebars.compile(data);
      
      updateProgressionArea(template,false,false);
      
      $("#role-links>a").click(function(){
          updateProgressionArea(template,false,false);
      });

      $(".seen").click(function(){
          updateProgressionArea(template,false,true);
      });
      
      $(".collection").click(function(){
          updateProgressionArea(template,true,false);
      });
  }); 
}

