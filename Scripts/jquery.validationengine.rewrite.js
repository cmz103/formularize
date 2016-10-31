/*!
* jQuery Validation Engine
* version: 4.0 (16-JAN-2014)
* dependency: jQuery v1.7 or later
* dependency: jQuery UI v1.8 or later (uses position utility)
* dependency: date.js (Version: 1.0 Alpha-1 or later)(http://code.google.com/p/datejs/)
* author: Cedric Maniquiz
*/

(function ($, window, document, undefined) {
    "use strict";

    

    

    

    

    var methods = {
        init: function (options) {

            /*----------------------------------------------------------------------------------------------------------------------------------------
            attach events & event handlers
            ----------------------------------------------------------------------------------------------------------------------------------------*/

            var $this = $(this),
                id = this.id,
				isButton = switch($this)

            //listens for click
            $this.on('click', function (e) {

                var boolSubmit = $this.validationEngine('run', options);

                if (!boolSubmit) {
                    e.preventDefault();
                }
            });

            

            

            

            

            

            

            


            



        },
        run: function (options) {
            return validate(
				options.targetContainer, 
				options.onSuccess, 
				options.onError, 
				options.returnIfClassExists, 
				options.validateOnly, 
				options.cbListContainerClass, 
				options.rbListContainerClass, 
				options.requireAndValidateHidden, 
				options.customClass, 
				options.customRegex);
        },
		getLabel: function(el){

			var $id = el.attr('id'),
				$labelFor = $('label[for="' + $id + '"]').filter(":first");

			return $labelFor;

		},
		addAsterisk: function (){
			/*----------------------------------------------------------------------------------------------------------------------------------------
            find required fields inside of provided targetElement and add a red * to the label
            ----------------------------------------------------------------------------------------------------------------------------------------*/

            //clear previous asterisk classes first
            $('label').each(function () {
                $(this).removeClass('asterisk');
            });

            $(".required").each(function () {

                var $this = $(this),
					label = this.getLabel($this);

                if (label.hasClass('no-asterisk')) {
                    return;
                }

                label.addClass('asterisk');
            });
		}
    };
	
	/*----------------------------------------------------------------------------------------------------------------------------------------
		- common jquery recommended method calling logic
		- pass in method(with arguments) or pass in object
		- error thrown if method passed does not exist
		- if object is passed in, run "init" method
	----------------------------------------------------------------------------------------------------------------------------------------*/
    $.fn.validationEngine = function (method) {

		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.validationEngine');
		}

	};
	
	
	/*----------------------------------------------------------------------------------------------------------------------------------------
		- validation engine defaults
		- exposed publicly so devs can be overwrite defaults for their entire app
	----------------------------------------------------------------------------------------------------------------------------------------*/
	$.fn.validationEngine.defaults = {
		requiredClass: 'jq-required',
		validateClass: 'jq-validate'
		validationClasses: { 
								email: 'jq-val-email',
								phone: 'jq-val-phone',
								currency: 'jq-val-currency',
								decimal: 'jq-val-decimal',
								number: 'jq-val-number',
								calendar: 'jq-val-calendar',
								zip: 'jq-val-zip',
								username: 'jq-val-username',
								alpha: 'jq-val-alpha',
								creditCard: 'jq-val-ccnumber',
								cvv: 'jq-val-cvv',
								month: 'jq-val-month',
								year: 'jq-val-year'
							}
		targetContainer: $("form").filter(":first"),
		returnIfClassExists: 'fileexists',
		validateOnly: false,
		/*rethink these next two classes*/
		cbListContainerClass: 'checkboxlist',
		rbListContainerClass: 'radiobuttonlist',
		customClass: 'jq-val-custom-class',
		customRegex: '/^.{2,}$/'
	};
	

})(jQuery, window, document);