$(document).ready(function() {
	if(window.location.href.indexOf("http://trakt.tv/person") == 0){
		initTraktProgress();
	}

	initYifyEnhancement();


    //Fix an issue in trakt which allow the user to mark an item as seen or collected indefinitly
    $(".seen, .collection").click(function(){
        $(this).remove();
    });
})
