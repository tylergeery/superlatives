window.Superlatives = window.Superlatives || {};
window.Superlatives.db = new Firebase('https://incandescent-fire-7614.firebaseio.com/');

window.fbAsyncInit = function() {
	FB.init({
	  appId      : '439003716306503',
	  xfbml      : true,
	  version    : 'v2.5'
	});
};

(function(d, s, id){
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) {return;}
	js = d.createElement(s); js.id = id;
	js.src = "https://connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));


!(function() {
	if(window.localStorage.fid) {
		window.Superlatives.user = window.Superlatives.user || {};
		window.Superlatives.user.fid = window.localStorage.fid;
	} else {
		window.Superlatives.db.authWithOAuthPopup("facebook", function(error, authData) {
			if (error) {
				console.log("Login Failed!", error);
			} else {
				console.log("Authenticated successfully with payload:", authData);
		  	}
		});
	}
})();