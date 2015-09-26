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

    // FB.getLoginStatus(function(response) {
    //     alert(response.status);
    //     if (response.status === 'connected') {
    //         console.log('Logged in.');
    //         FB.api('/me/music', function(data) {
    //             //console.log(data.data);
    //             $.each(data.data, function(){
    //                 alert(this.name);
    //             });
    //         });
    //     }
    //     else {
    //          FB.login(function(response) {
    //             // handle the response
    //         }, {
    //             scope: 'email,user_likes', 
    //             return_scopes: true
    //         });

    //         FB.api('/me/music', function(data) {
    //             $.each(data.data, function(){
    //                 alert(this.name);
    //             });
    //         });
    //     }
    // });

    // if(navigator.connection){
                
    //     //check internet connected 
    //     if (navigator.connection.type == Connection.NONE) {
                    
    //         navigator.notification.confirm(
    //             'Não tem nenhuma conexão à internet ativa! Por favor ative uma conexão.',  // message
    //             onConfirm,                  // callback to invoke
    //             'Sem conexão',                  // title
    //             ['Sair']                   // buttonLabels
    //         );

    //     }
                
    // }

};