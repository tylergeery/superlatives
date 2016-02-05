window.Superlatives = window.Superlatives || {};
window.Superlatives.user = window.Superlatives.user || {};
window.Superlatives.users = window.Superlatives.users || [];
window.Superlatives.userWithKey = window.Superlatives.userWithKey || {};
window.Superlatives.superlatives = window.Superlatives.superlatives || [];
window.Superlatives.votesByKey = window.Superlatives.votesByKey || {};
window.Superlatives.db = window.Superlatives.db || {};
window.Superlatives.db.auth = new Firebase('https://incandescent-fire-7614.firebaseio.com/auth');
window.Superlatives.db.users = new Firebase('https://incandescent-fire-7614.firebaseio.com/users');
window.Superlatives.db.superlatives = new Firebase('https://incandescent-fire-7614.firebaseio.com/superlatives');
window.Superlatives.db.votes = new Firebase('https://incandescent-fire-7614.firebaseio.com/votes');

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
		Superlatives.user = window.localStorage.user;

		// say hello
		$('#main-hello').html('Hello, ' + Superlatives.user.name);
	// fallback to reauth
	} else {
		$('#welcome-modal').modal();

		$('#facebook-login').on('click', function() {
			Superlatives.db.auth.authWithOAuthPopup("facebook", function(error, authData) {
				var user = authData ? authData.facebook.cachedUserProfile : {};

				if (error) {
					// Test user means error
					Superlatives.user = {
						name: 'Test',
						link: 'http://geerydev.com',
						image: 'http://www.gotpetsonline.com/pictures-gallery/small-animal-pictures-breeders-babies/raccoon-pictures-breeders-babies/pictures/raccoon-0008.jpg'
					};
				} else {
					// make current user obj
					Superlatives.user = {
						fid: user.id,
						name: user.first_name,
						link: user.link,
						image: user.picture.data.url
					};

					// save to db
					Superlatives.db.users.child(Superlatives.user.name).set(Superlatives.user);

					// remember current user
					window.localStorage.user = Superlatives.user;
			  	}

			  	// say hello
				$('#main-hello').html('Hello, ' + Superlatives.user.name);
			}, {
				remember: "sessionOnly"
			});
		});
	}
})();