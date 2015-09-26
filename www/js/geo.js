$(document).on("pageshow", "#venuesMap", function() {

  $(document).on('pagehide', '#venueDetail', function () { 
    $("#venueDetail").remove();
    $("#venuesMap").after('<div data-role="dialog" id="venueDetail" class="ui-dialog" data-close-btn="right"></div>');
  });

  $("#venuesMap").removeClass('ui-dialog-background');
  
  var userlatcoord;
  var userlongcoord;
  var deviceready = false;
  var loopingagain = false;
  var firstAttempt = true;
  var markersArray = new Array();

  navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, 
    { 
      maximumAge: 10000,
      timeout: 5000,
      enableHighAccuracy: true
    });

  function geolocationSuccess(position){
      userlatcoord = position.coords.latitude;
      userlongcoord = position.coords.longitude
      renderMap();
  }

  function geolocationError(error){
    if(firstAttempt){
      firstAttempt = false;
      navigator.geolocation.getCurrentPosition(geolocationSuccess, geolocationError, 
        { 
          maximumAge: 10000,
          timeout: 5000,
          enableHighAccuracy: false
        });
    }
    else{
      userlatcoord = 40.977047;
      userlongcoord = -7.921143;
      renderMap();
    }
  }

  function renderMap(){
      
     //$.mobile.loading( "show" );
      
     var mapOptions = {
        center: new google.maps.LatLng(userlatcoord, userlongcoord),
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    fillVenuesMap(map, userlatcoord, userlongcoord);
    
    //evento map loaded
    google.maps.event.addListener(map, 'tilesloaded', function() {
      google.maps.event.trigger(map,'resize');
      //$.mobile.loading( "hide" );
    });

    //geocoder
    var autocomplete = new google.maps.places.Autocomplete(document.getElementById('searchbox'));
    autocomplete.bindTo('bounds', map);

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
     
      var place = autocomplete.getPlace();
      if (!place.geometry) {
        return;
      }

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
        map.setZoom(16);
        map.setCenter(place.geometry.location);
        
        setAllMap(null);
        fillVenuesMap(map, place.geometry.location.k, place.geometry.location.B);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(16);  
        console.log(place.geometry);
        setAllMap(null);
        fillVenuesMap(map, place.geometry.location.k, place.geometry.location.B);
      }



      var address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }
    });

  }

  function getVenueDetail(venueId){
    sessionStorage.selectedVenue = venueId;
    $("#venueDetail").trigger('refresh');
    $("#venuesMap").addClass('ui-dialog-background');
    //$('#venueDetail').dialog('close');

    //venue history
    var venues;
    
    if(localStorage['venues'] == null){
      venues = new Array();
    }
    else{
      venues = JSON.parse(localStorage['venues']);
    } 

    var upd;

    var venue = arrayExist(venues, venueId);
    
    if(venue){
      upd = '0';
    }
    else{
      venues.push({id: venueId, similarity: -1});
      localStorage['venues'] = JSON.stringify(venues);
      upd = '1';
    }

    //get venue details
    $.ajax({
      url : "http://hlima.inovsolutions.net/tribo-2.0/model/GetVenueDetail.php?callback=?",
      contentType: "application/json",
      type: "GET",
      data : {venue_id: venueId, update: upd},
      cache: false,
      jsonpCallback: "venue",
      dataType: 'jsonp',
      crossDomain: true,

      success: function(data)
      { 
        var openStr;
        if(data.open == '1'){
          openIcon = 'img/open.png';
        }
        else{
          openIcon = 'img/closed.png';
        }

        var venueUrl = null;

        if(data.url != null){
          venueUrl = data.url;
        }

        if(data.url_fs != null){
          venueUrl = data.url_fs
        }

        var venueHtml = '<div class="ui-header" data-role="header" role="banner"><div class="venue-name">' 
        + data.venue_name + '</div><a class="venue-link" target="_blank" href="' + venueUrl + '">' + 
          venueUrl + '</a></div><div class="venue-body"><img width="50px" height="35px" id="open_icon" src="' + openIcon +  '" /><br/><div id="match_score"></div>' +
          '<div class="bands-list"><output><b>Customers of the bar listen to:</b></output><ul>';

        var artistsArr = new Array();
        var artInd = 0;

        //artists
        $.each(data.customers, function(){
            var type = this.pivot.type;
            $.each(this.artists, function(){
              if(!arrayExist(artistsArr, this.id)){
                artistsArr.push({id: this.id, name: this.artist_name, type: type});
                
                if(artInd < 20){
                  venueHtml += '<li>' + this.artist_name + '<a class="art-link" href="' + this.artist_link  + '" ></a></li>';
                  artInd++;
                }
              } 
            });
        });
        
        venueHtml += '</ul></div></div>';
        $("#venueDetail").html(venueHtml);

        //$("#venueDetail").trigger('create');
        $.mobile.changePage("#venueDetail", {transition: 'pop', role: "dialog" });

        var similarity = 0;
        var imgSrc;
        var imgWidth;
        //if venue in cache, don't calculate similarity
        
        //if(venue.length == 0 || (venue.length > 0 && !venue.similarity)){
        if(!venue || venue.item.similarity < 0){

          $.ajax({  
            url : "http://hlima.inovsolutions.net/tribo-2.0/model/GetArtistSimilarity.php?callback=?",
            contentType: "application/json",
            type: "GET",
            data : {user_artists: localStorage.userArtists, venue_artists: JSON.stringify(artistsArr)},
            cache: false,
            jsonpCallback: "similarity",
            dataType: 'jsonp',
            crossDomain: true,

            success: function(data)
            { 
              //similarity = (Math.round(data*100) * 100) / 100;
              similarity = (data*100).toFixed(2);

              if(similarity <= 25){
                imgSrc = 'img/similar_25.png';
                imgWidth = '25px';
              }
              else if(similarity <= 50){
                imgSrc = 'img/similar_50.png';
                imgWidth = '50px';
              }
              else if(similarity <= 75){
                imgSrc = 'img/similar_75.png';
                imgWidth = '75px';
              }
              else{
                imgSrc = 'img/similar_100.png';
                imgWidth = '100px';
              }

              //$("#match_score").html(similarity + ' %');
              $("#match_score").html('<img class="sim-float" width="' + imgWidth + 'px" height="10px" src="' + imgSrc + '"><span>' + similarity + '% match');

              var venue = arrayExist(venues, venueId);
              venues = JSON.parse(localStorage.venues);
              venues[venue.ind] = {id: venueId, similarity: similarity};
              localStorage['venues'] = JSON.stringify(venues);
            },

            error: function(error)
            {
              return false;
            } 
          });

        }
        else{

          if(venue.item.similarity <= 25){
            imgSrc = 'img/similar_25.png';
            imgWidth = '25px';
          }
          else if(venue.item.similarity <= 50){
            imgSrc = 'img/similar_50.png';
            imgWidth = '50px';
          }
          else if(venue.item.similarity <= 75){
            imgSrc = 'img/similar_75.png';
            imgWidth = '75px';
          }
          else{
            imgSrc = 'img/similar_100.png';
            imgWidth = '100px';
          }

          $("#match_score").html('<img class="sim-float" width="' + imgWidth +'px" height="10px" src="' + imgSrc + '"><span>' + similarity + '% match');                                
        }

      },

      error: function ()
      { 
        alert('couldnt get venue detail!');
        $("#venuesMap").removeClass('ui-dialog-background');
      }
    });
  }

  function fillVenuesMap(map, latitude, longitude){

    setAllMap(null);
    markersArray = new Array();

    $.ajax({
      url : "http://hlima.inovsolutions.net/tribo-2.0/model/GetVenues.php?callback=?",
      contentType: "application/json",
      type: "GET",
      data : {lat: latitude, lng: longitude},
      cache: false,
      jsonpCallback: "venues",
      dataType: 'jsonp',
      crossDomain: true,

      success: function(data)
      { 
        
        $.each(data, function(){

          var venue = this;
          var catList = '';

          //get categories
          $.each(this.categories, function(){
            catList += '<p>'+this.name+'</p>';
          });

          var latLng = new google.maps.LatLng(this.location.lat,this.location.lng);
          var marker = new google.maps.Marker({
             position: latLng,
             map: map,
             metadata: {id: venue.id},
             tooltip: '<p><b>'+venue.name+'</b></p>' + catList
          });
          markersArray.push(marker);

          var tooltip = new Tooltip({map: map}, marker);
          tooltip.bindTo("text", marker, "tooltip");
          google.maps.event.addListener(marker, 'click', function() {
            tooltip.addTip();
            tooltip.getPos2(marker.getPosition());
          });
    
          google.maps.event.addListener(marker, 'mouseout', function() {
            tooltip.removeTip();
          });

          google.maps.event.addListener(marker, 'dblclick', function() {
            getVenueDetail(marker.metadata.id);
            return false;
          });
        });

      },
      error: function (xhr, status, error)
      { 
        alert(error);
      }
    });
  }

  function arrayExist(arr, itemId){

    var ret = false;

    $.each(arr, function(ind, item){
      if(item.id == itemId){
        ret = {ind: ind, item: item}; 
        return;
      }
    });

    return ret;    
  }

  function setAllMap(map) {
    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(map);
    }
  }


});
