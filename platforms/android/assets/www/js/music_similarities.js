function getArtistSimilarity(userArtists, venueArtists){

  this.cache = new LastFMCache();
  
  var lastfm = new LastFM({
    apiKey    : 'f21088bf9097b49ad4e7f487abab981e',
    apiSecret : '7ccaec2093e33cded282ec7bc81c6fca',
    cache     : cache
  });

  //userArtists.forEach(function(art){

    //map with musicbrainz

    // setTimeout(function(){

    //   $.ajax({
    //     url: 'http://musicbrainz.org/ws/2/artist?query=artist:' + art,
    //     method: 'GET',
    //     //contentType: "application/json",
    //     dataType: 'xml',
    //     crossDomain: true,

    //     success: function(data){
    //       console.log(data);
    //     },
    //     error: function(){
    //       alert('error');
    //     }
    //   });

    // }, 3000);

    //setTimeout(function(){

    var mbq = new MBQuery({
      queryString: 'artist:' + userArtists[0].trim(),
      //additionalParams: '?query=artist:'+art,
      entity: 'artist',
      success: function() {
        alert('Found it!');
        //console.log(data);
      },
      error: function(error) {
        //console.log(error);
        alert('error');
        //console.log(data);
        //alert('Failed :-(');
      }
    });
    
    mbq.getResults();
    return;

    //}, 5000);   
    

  //});
}