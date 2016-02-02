!function() {
	// entrypoint
	window.Superlative = window.Superlative || {};
	Superlative.init = function() {
		// Listeners
		$('.nav').on('click', '.superlative', function() {
			var msb = $('.main-superlative-body');
			$('.main-superlative-form-body').hide();

			var sup = Superlatives.superlatives[+$(this).attr('data-index')];
			$('.main-superlative').html(sup.title);
			$('#content', msb).html(sup.description);
			msb.show();
		});

		$('.nav').on('click', '.superlative .fa-pencil-square-o', function(event) {
			event.stopPropagation();

			var sup = Superlatives.superlatives[+$(this).parent().attr('data-index')];

			$('.main-superlative').html('Edit Superlative');
			$('.main-superlative-body').hide();
			$('.main-superlative-form-body').show().find('form').attr('data-old-title', sup.key);

			$('input[name="title"]').val(sup.title);
			$('textarea#description').val(sup.description);
		});

		$('.superlative-add').on('click', function() {
			$('.main-superlative').html('Add a New Superlative');
			$('.main-superlative-body').hide();
			$('.main-superlative-form-body').show();

			$('input[name="title"]').val('');
			$('textarea#description').val('');
		});

		$('form', $('.body')).on('submit', function(event) {
			event.preventDefault();

			formSubmit($(this));
		});
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
			})
		} else {
			Superlatives.db.superlatives.set({
				title : name,
				description : description,
				votes : {}
			});
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

		$('.superlative', '.nav').remove();
		$('h4').after(html);
	}

	var buildSuperlativeTable = function() {
		// build header row of user options
	}


	/*
	 * load resource data
	 */

	// gather users
	Superlatives.db.users.limitToLast(100)
		.on('child_added', function(user) {
			Superlatives.users.push(user.val());
		});

	// gather superlatives
	Superlatives.db.superlatives.limitToLast(100)
		.on('child_added', function(superlative) {
			var sup = superlative.val();
			sup['key'] = superlative.key();
			Superlatives.superlatives.unshift(sup);

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
	Superlatives.db.superlatives
		.on('child_removed', function(ss) {
			// delete by looping
			for(var i = 0, l = Superlatives.superlatives.length; i < l; i++) {
				if(Superlatives.superlatives[i].key === ss.key()) {
					Superlatives.superlatives.splice(i, 1);
				}
			}

			buildSuperlativesList(Superlatives.superlatives);
		});
}();

Superlative.init();