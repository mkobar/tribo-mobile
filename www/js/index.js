function onLoad(){

    sessionStorage.removeItem('venues');
    document.addEventListener("deviceready", onDeviceReady, false);

    // test app running on desktop
    if(!navigator.userAgent.match(/(iPhone|iPod|iPad|Android|BlackBerry|IEMobile)/))
    {   
        onDeviceReady();
    }

};

function onDeviceReady(){
    // 
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true; 
    
    openFB.init('1395008420781541');
    
    openFB.login('email',
        function() {
            openFB.api({
                //method: 'GET',
                path: '/me/music',
                
                success: function(data) {
                    var artistsArr = new Array();
                    $.each(data.data, function(){
                        artistsArr.push(this.name);JSON.stringify
                    });
                    localStorage.userArtists = JSON.stringify(artistsArr);
                }
        });
        },
        function(error) {
            alert('Facebook login failed: ' + error.error_description);
        });

};