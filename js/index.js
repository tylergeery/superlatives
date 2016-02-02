!function() {
	// entrypoint
	window.Superlative = window.Superlative || {};
	Superlative.init = function() {
		// Listeners
		$('.superlative').on('click', function() {
			$('.main-superlative').html($(this).html());
		});

		$('.superlative-add').on('click', function() {
			$('.main-superlative').html('Add a New Superlative');
			$('.main-superlative-body').hide();
			$('form').show();
		});
	}

	// form building
	var forms = {
		superlative : {
			title : 'Add New Superlative',
			inputs : [
				{
					label : 'Superlative Title:'
					name : 'title',
					type : 'text'
				},
				{
					label : 'Superlative Description',
					name : 'description'
					type : 'textarea'
				}
			]
		}
	}

	var formSubmit = function(slug) {

	}
}();

Superlative.init();