var playClass = "fa fa-play";
var pauseClass = "fa fa-pause";

$("#playbtn").click(function() {
   isPlaying = !isPlaying;
   if(isPlaying) {
      $("#playbtn i").attr("class",pauseClass);
      $("#playbtn").addClass("running");
   } else {
      $("#playbtn i").attr("class",playClass);
      $("#playbtn").removeClass("running");
   }
})
