!function() {
	// entrypoint
	window.Superlative = window.Superlative || {};
	Superlative.init = function() {
		$('.superlative').on('click', function() {
			$('.main-superlative').html($(this).html());
		});
	}
}();

Superlative.init();