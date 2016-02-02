window.Superlatives = window.Superlatives || {};
window.Superlatives.user = window.Superlatives.user || {};
window.Superlatives.users = window.Superlatives.users || [];
window.Superlatives.superlatives = window.Superlatives.superlatives || [];
window.Superlatives.votes = window.Superlatives.votes || [];
window.Superlatives.db = window.Superlatives.db || {};
window.Superlatives.db.auth = new Firebase('https://incandescent-fire-7614.firebaseio.com/auth');
window.Superlatives.db.users = new Firebase('https://incandescent-fire-7614.firebaseio.com/users');
window.Superlatives.db.superlatives = new Firebase('https://incandescent-fire-7614.firebaseio.com/superlatives');

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
	// check local storage first
	if(window.localStorage.user) {
		Superlatives.user = window.localStorage.fid;

	// fallback to reauth
	} else {
		Superlatives.db.auth.authWithOAuthPopup("facebook", function(error, authData) {
			var user = authData ? authData.facebook.cachedUserProfile : {};
			console.log('user', user);

			if (error) {
				console.log("Login Failed!", error);
			} else {
				// make current user obj
				Superlatives.user = {
					fid: user.id,
					name: user.first_name,
					link: user.link,
					image: user.picture.data.url
				}

				// save to db
				Superlatives.db.users.child(Superlatives.user.name).set(Superlatives.user);

				// remember current user
				window.localStorage.user = Superlatives.user;
		  	}
		}, {
			remember: "sessionOnly"
		});
	}
})();