!function() {
	var currentSuperlative,
		userVoteFor;

	// entrypoint
	window.Superlative = window.Superlative || {};
	Superlative.init = function() {

		// Listeners
		$('.nav').on('click', '.superlative', function() {
			var msb = $('.main-superlative-body');
			$('.main-superlative-form-body').hide();

			currentSuperlative = +$(this).attr('data-index');
			var sup = Superlatives.superlatives[currentSuperlative];
			$('.main-superlative').html(sup.title);
			$('#content', msb).html(sup.description);
			msb.show();

			buildSuperlativeTable();

			$('.body')[0].scrollIntoView();
		});

		$('.nav').on('click', '.superlative .fa-pencil-square-o', function(event) {
			event.stopPropagation();

			currentSuperlative = +$(this).parent().attr('data-index')
			var sup = Superlatives.superlatives[currentSuperlative];

			$('.main-superlative').html('Edit Superlative');
			$('.main-superlative-body').hide();
			$('.main-superlative-form-body').show().find('form').attr('data-old-title', sup.key);

			$('input[name="title"]').val(sup.title);
			$('textarea#description').val(sup.description);
			$('#delete-button').show();

			$('.body')[0].scrollIntoView();
		});

		$('.superlative-add').on('click', function() {
			$('.main-superlative').html('Add a New Superlative');
			$('.main-superlative-body').hide();
			$('.main-superlative-form-body').show().find('form').removeAttr('data-old-title');

			$('input[name="title"]').val('');
			$('textarea#description').val('');
			$('#delete-button').hide();

			$('.body')[0].scrollIntoView();
		});

		$('form', $('.body')).on('submit', function(event) {
			event.preventDefault();

			formSubmit($(this));
		});

		$('#delete-button').on('click', function() {
			if(window.confirm('Are you sure you want to delete this superlative?')) {
				// used to delete
				var tmp = Superlatives.superlatives[currentSuperlative].key;

				// not saved in object
				delete Superlatives.superlatives[currentSuperlative].key;

				// delete
				Superlatives.db.superlatives.child(tmp).remove(function(error) {
				  if (error) {
				    console.log('Synchronization failed', error);
				  } else {
				    	window.location.reload();
				  }
				});
			}
		});

		$('.body').on('click', '.user-vote-block', function() {
			// build user options
			buildUserModalOptions();

			// show vote modal
			$('#user-vote-modal').modal();
		});

		$('.body').on('click hover', '.user-vote-block a', function(event) {
			event.preventDefault();
			event.stopPropagation();

			$(this).popover();
		});

		$($('#user-vote-modal')).on('click', '.modal-user', function() {
			userVoteFor = +$(this).data('index');
			$('.hidden-area').addClass('unhide');
		});

		$('[data-dismiss]', $('#user-vote-modal')).on('click', function() {
			$('.hidden-area').removeClass('unhide');
			$('textarea', $('#user-vote-modal')).val('');
			userVoteFor = null;
		});

		$('.modal-user-vote-save').on('click', function(event) {
			event.preventDefault();

			if(Superlatives.user && Superlatives.user.name) {
				var save = false;

				if(!$.isEmptyObject(Superlatives.superlatives[currentSuperlative].votes)) {
					var voteRecorded = false;
					for(var prop in Superlatives.superlatives[currentSuperlative].votes) {
						var votes = Superlatives.superlatives[currentSuperlative].votes[prop];
						if(Superlatives.users[userVoteFor].name === prop) {
							// check if vote already recorded
							if(votes.indexOf(Superlatives.user.name) === -1) {
								// add vote
								Superlatives.superlatives[currentSuperlative].votes[prop].push(Superlatives.user.name || 'Test');

								// make sure to save
								save = true;

								// vote has been recorded
								voteRecorded = true;
							}
						} else {
							var indy = votes.indexOf(Superlatives.user.name);

							// check if there exists a vote already from current user
							if(indy !== -1) {
								// remove other vote
								Superlatives.superlatives[currentSuperlative].votes[prop].splice(indy, 1);

								// make sure to save
								save = true;
							}
						}
					}
				}

				if($.isEmptyObject(Superlatives.superlatives[currentSuperlative].votes) || !voteRecorded) {
					// create if not already created
					Superlatives.superlatives[currentSuperlative].votes = Superlatives.superlatives[currentSuperlative].votes || {};

					// make new votes array for first vote
					Superlatives.superlatives[currentSuperlative].votes[Superlatives.users[userVoteFor].name] = [Superlatives.user.name];

					// make sure to save
					save = true;
				}
			}

			// save if needs to be saved
			if(save) {
				Superlatives.db.superlatives.child(Superlatives.superlatives[currentSuperlative].key).update({
					votes: Superlatives.superlatives[currentSuperlative].votes
				});

				Superlatives.db.votes.child(Superlatives.superlatives[currentSuperlative].key +'-'+ Superlatives.users[userVoteFor].name +'-'+  Superlatives.user.name).set($('#vote-text').val());
			}

			// close modal
			$('#user-vote-modal').modal('hide');

			//reset modal
			$('.hidden-area').removeClass('unhide');
			$('textarea', $('#user-vote-modal')).val('');
			userVoteFor = null;

			buildSuperlativeTable();
		});

		if(Superlatives.superlatives.length) {
			currentSuperlative = 0;
			buildSuperlativeTable();
		}
	}

	var formSubmit = function(form) {
		// remove error class
		$('.has-error').removeClass('has-error');


		var name = $('input[name="title"]', form).val(),
			description = $('textarea#description', form).val(),
			slug = slugify(name),
			oldTitle = form.data('oldTitle');

		if(!name) {
			return $('.title-error', form).addClass('has-error');
		}

		if(!description) {
			return $('.description-error', form).addClass('has-error');
		}

		if(oldTitle) {
			Superlatives.db.superlatives.child(oldTitle).update({
				title : name,
				description : description
			});
		} else {
			Superlatives.db.superlatives.child( Math.random().toString(36).replace(/[^a-z]+/g, '') ).set({
				title : name,
				description : description,
				votes : {}
			});

			currentSuperlative = Superlatives.superlatives.length - 1;

			$('.superlatives', $('.nav')).eq(currentSuperlative).trigger('click');
		}
	}

	var slugify = function(name) {
		return name.toString().toLowerCase()
		    .replace(/\s+/g, '-')           // Replace spaces with -
		    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
		    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
		    .replace(/^-+/, '')             // Trim - from start of text
		    .replace(/-+$/, '');            // Trim - from end of text
	}

	var buildSuperlativesList = function(superlatives) {
		html = '';

		for(var i=0, l = superlatives.length; i < l; i++) {
			html += '<div class="superlative" data-index="'+ i +'">'+superlatives[i].title+'<i class="fa fa-pencil-square-o"></i></div>'
		}

		// remove existing
		$('.superlative', '.nav').remove();

		// create new
		$('h4', $('.nav')).after(html);
	}

	/* user tables construction */
	var headerBlock = '<td class="replaceable">__USER__</td>',
		userVoteBlock = '<td class="replaceable user-vote-block">__USER_VOTES__</td>',
		userVote = '<a href="#" data-toggle="popover" data-content="__VOTE_KEY__"><img src="__USER_IMAGE__" alt="__USER__"/><span>__USER__</span></div>',
		totalBlock = '<td class="replaceable">__TOTAL__</td>';

	var buildSuperlativeTable = function() {
		var headerMarkup = '',
			userVotesMarkup = '',
			totalMarkup = '';

		_.each(Superlatives.users, function(user) {
			// build header row of user options
			headerMarkup += headerBlock.replace('__USER__', user.name);

			// build votes row
			if(Superlatives.superlatives[currentSuperlative].votes && Superlatives.superlatives[currentSuperlative].votes[user.name]) {
				// loop through all voters for info
				var tmp = '';
				_.each(Superlatives.superlatives[currentSuperlative].votes[user.name], function(voter) {
					var voter = Superlatives.userWithKey[voter];

					if(voter) {
						var voteKey = Superlatives.superlatives[currentSuperlative].key+'-'+user.name+'-'+voter.name;
						console.log('voteKey', voteKey)
						tmp += userVote.replace('__VOTE_KEY__', Superlatives.votesByKey[voteKey]).replace('__USER_IMAGE__', voter.image).replace(/__USER__/g, voter.name);
					}
				});

				userVotesMarkup += userVoteBlock.replace('__USER_VOTES__', tmp);

				// add count if there exists votes
				totalMarkup += totalBlock.replace('__TOTAL__', Superlatives.superlatives[currentSuperlative].votes[user.name].length);
			} else {
				// add empty votes section
				userVotesMarkup += userVoteBlock.replace('__USER_VOTES__', '');

				// add count if no votes exist
				totalMarkup += totalBlock.replace('__TOTAL__', '-');
			}
		});

		// remove existing content
		$('td.replaceable').remove();

		// add new
		$('.user-header-row').after(headerMarkup);
		$('#user-table-votes').after(userVotesMarkup);
		$('#user-table-totals').after(totalMarkup);
	}


	var modalUser = '<div class="modal-user" data-index="__INDEX__"><img src="__USER_IMAGE__" alt="__USER__" /><span>__USER__</span></div>';
	var buildUserModalOptions = function() {
		var markup = '',
			iterator = 0;

		_.each(Superlatives.users, function(user) {
			if(Superlatives.user && Superlatives.user.id !== user.id) {
				return;
			}

			markup += modalUser.replace('__INDEX__', iterator).replace(/__USER__/g, user.name).replace('__USER_IMAGE__', user.image);
			iterator++;
		});

		$('.modal-users').html(markup);
	}


	/*
	 * load resource data
	 */

	// gather users
	Superlatives.db.users.limitToLast(100)
		.on('child_added', function(user) {
			Superlatives.users.push(user.val());
			Superlatives.userWithKey[user.val().name] = user.val();
		});

	// gather superlatives
	Superlatives.db.superlatives.limitToLast(100)
		.on('child_added', function(superlative) {
			var sup = superlative.val();
			sup['key'] = superlative.key();
			Superlatives.superlatives.push(sup);

			buildSuperlativesList(Superlatives.superlatives);
		});
	Superlatives.db.superlatives.limitToLast(100)
		.on('child_changed', function(ss, prevKey) {
			// update by looping
			for(var i = 0, l = Superlatives.superlatives.length; i < l; i++) {
				if(Superlatives.superlatives[i].key === ss.key()) {
					var dupe = ss.val();
					dupe['key'] = ss.key();
					Superlatives.superlatives[i] = dupe;
				}
			}

			buildSuperlativesList(Superlatives.superlatives);
		});
	Superlatives.db.superlatives.limitToLast(100)
		.on('child_removed', function(ss) {
			console.log('removed', ss.val());
			// delete by looping
			for(var i = 0, l = Superlatives.superlatives.length; i < l; i++) {
				if(Superlatives.superlatives[i].key === ss.key()) {
					Superlatives.superlatives.splice(i, 1);
				}
			}

			buildSuperlativesList(Superlatives.superlatives);
		});

	Superlatives.db.votes.limitToLast(500)
		.on('child_added', function(vote) {
			Superlatives.votesByKey[vote.key()] = vote.val();
		})
}();

Superlative.init();