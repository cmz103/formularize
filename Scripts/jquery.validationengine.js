/*!
* jQuery Validation Engine
* version: 4.0.4 (31-JUL-2015)
* @requires jQuery v1.7 or later
* @requires jQuery UI v1.8 or later (uses position utility)
* @requires date.js (Version: 1.0 Alpha-1 or later)(http://code.google.com/p/datejs/)
*/
(function ($) {
    "use strict";

    /*----------------------------------------------------------------------------------------------------------------------------------------
    add required css to head
    ----------------------------------------------------------------------------------------------------------------------------------------*/
    var style = '.error { color:#ff3333 !important; background-color: #ffcccc !important; border: 1px solid red !important; }' +
        '.required[type="text"].error, select.required.error { }' +
        '.required-message { border: 1px solid #f83d3d; max-width: 350px; background-color: #f83d3d; padding:10px; position: absolute; left: 0; -moz-border-radius: 3px; -webkit-border-radius: 3px; border-radius: 3px; color: #fff; font-size:12px !important; z-index: 99; }' +
        '.required-message:after { content: ""; width: 0; height: 0; display: block; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #f83d3d; bottom: -6px; left: 35px; position: absolute; }' +
		'.required-message.yellow { background-color: #FCF8E3; color: #555; border: 1px solid #C09853; }' +
        '.required-message.yellow:after { border-top: 6px solid #FCF8E3; content:""; }' +
        '.required-message.yellow:before { content: ""; width: 0; height: 0; display: block; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 6px solid #C09853; bottom: -7px; left: 35px; position: absolute; }' +
        '.required-message span { font-size: 10px; font-weight: bold; color: white !important; }' +
        '.required-message strong { color: white !important; }' +
		'.required-message.yellow strong { color: #555 !important; }' +
        '.asterisk:before { content: "* "; color: red; }' +
        '.error-wrapper { position: relative; }';

    if ($('#jqValidationEngineStyles').length <= 0) {
        $('head').append('<style id="jqValidationEngineStyles">' + style + '</style>');
    }

    /*----------------------------------------------------------------------------------------------------------------------------------------
    run function when init method is called
    ----------------------------------------------------------------------------------------------------------------------------------------*/

    function validate(targetContainer, onSuccess, onError, returnIfClassExists, validateOnly, cbListContainerClass, rbListContainerClass, requireAndValidateHidden, customClass, customClasses, customRegex, onBeforeSubmit) {

        if ($.isFunction(onBeforeSubmit)) {
            execute(onBeforeSubmit)
        }

        var submitForm = true,
            docHeight = $(document).height(),
            docWidth = $(document).width(),
            winHeight = $(window).height(),
            winWidth = $(window).width(),
            currentDate = new Date(),
            currentYear = currentDate.getFullYear(),
            currentMonth = currentDate.getMonth();

        var checkTargetContainer = execute(targetContainer);
        if (checkTargetContainer == undefined) {
            if (hasConsole) {
                console.error('targetContainer is undefined. Please define it.');
            } else {
                $.error('targetContainer is undefined. Please define it.');
            }
        }

        // reset errors
        $(".required-message, .required-message.yellow", $(targetContainer)).remove();
        $(".required, .validate", $(targetContainer)).each(function () {
            $(this).removeClass("error");
        });

        // function to check credit cards with luhn algorithm aka mod 10

        function checkLuhn(input) {
            var sum = 0;
            var numdigits = input.length;
            var parity = numdigits % 2;
            for (var i = 0; i < numdigits; i++) {
                var digit = parseInt(input.charAt(i))
                if (i % 2 == parity) digit *= 2;
                if (digit > 9) digit -= 9;
                sum += digit;
            }
            return (sum % 10) == 0;
        }

        //check credit card type

        function getCreditCardType(accountNumber) {

            //start without knowing the credit card type
            var result = "unknown";

            //first check for masterCard
            if (/^5[1-5][0-9]{14}$/.test(accountNumber)) {
                result = "mastercard";
            }

                //then check for visa
            else if (/^4[0-9]{12}(?:[0-9]{3})?$/.test(accountNumber)) {
                result = "visa";
            }

                //then check for amex
            else if (/^3[47][0-9]{13}$/.test(accountNumber)) {
                result = "amex";
            }

                //then check for discover
            else if (/^6(?:011|5[0-9]{2})[0-9]{12}$/.test(accountNumber)) {
                result = "discover";
            }

            return result;
        }



        // function for custom required message
        // to use: add the "requiredMsg" attribute to any element that is required

        function customMessage(element) {
            if (element.attr("data-custom-message") !== undefined) {
                $.fn.validationEngine.showHideMessage(element.data("custom-message"), element, true);
                submitForm = false;
            }
        }



        /*----------------------------------------------------------------------------------------------------------------------------------------
        validate
        ----------------------------------------------------------------------------------------------------------------------------------------*/
        $(".validate", $(targetContainer)).each(function () {

            if (requireAndValidateHidden != true) {
                if ($(this).is(':hidden')) {
                    return;
                }
            }

            var $this = $(this),
                fieldVal = $.trim($this.val()),
                selectVal = $this.is('select') ? $this.find('option:selected').val() : '',
                labelFor = getLabel($this),
                labelForText = labelFor.length !== 0 ? labelFor.text() : '';

            //function used to validate regular expressions 

            function validateRegExp(expression) {

                var pattern, valid;

                try {
                    pattern = new RegExp(expression);
                    valid = pattern.test(fieldVal);
                    return valid;
                } catch (err) {
                    alert(err);
                }
            }

            //check to see if field contains any data if so then validate otherwise ignore
            //TODO: use switch statement
            if (fieldVal.length > 0) {

                //validate email
                if ($this.hasClass("email")) {
                    if (validateRegExp(/[a-z0-9!#$%&'*+\/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+\/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/i) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>email address</strong> is required <br/> <span>example: name@domain.com</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate phone
                if ($this.hasClass("phone")) {
                    if (validateRegExp(/((?:[^a-zA-z]*\d){10})($|\s?x\s?(?:[^a-zA-z]*\d){1,10}?)$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>phone number</strong> is required <br /> <span>example: 949-888-2222 x999<br/>(extension optional)</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //tax id
                if ($this.hasClass("taxid")) {
                    if (validateRegExp(/^(\d{9})$|^(\d{3}-\d{6})$|^(\d{2}-\d{7})$|^(\d{3}-\d{2}-\d{4})$|^(\d{5}-\d{4})$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>Tax ID (EIN)</strong> is required', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate currency
                if ($this.hasClass("currency")) {
                    if (validateRegExp(/^\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>dollar amount</strong> is required <br /> <span>example: 15,350.00</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate decimal
                if ($this.hasClass("decimal")) {
                    if (validateRegExp(/^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>decimal</strong> is required <br /> <span>example: 327.4</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate number
                if ($this.hasClass("number") || $(this).hasClass("number-long")) {
                    if (validateRegExp(/^\s*(\+|-)?\d+\s*$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>number</strong> is required <br /> <span>example: 1500</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate calendar
                if ($this.hasClass("calendar")) {

                    var attrMaxDate = $this.data('max-date');
                    var attrMinDate = $this.data('min-date');
                    var attrDateIsPast = $this.data('date-has-past');
                    var newMinDate, newMaxDate, dateInput, dateToday;

                    if (validateRegExp(/^((((0[13578])|([13578])|(1[02]))[\/](([1-9])|([0-2][0-9])|(3[01])))|(((0[469])|([469])|(11))[\/](([1-9])|([0-2][0-9])|(30)))|((2|02)[\/](([1-9])|([0-2][0-9]))))[\/]\d{4}$|^\d{4}$/) === true) {
                        //debugger;

                        //check if date value is in past
                        if ($.type(attrDateIsPast) !== 'undefined' && $.type(attrDateIsPast) !== false && $.type(attrMinDate) === 'undefined' && $.type(attrMaxDate) === 'undefined') {

                            dateToday = Date.today();
                            dateInput = Date.parse(fieldVal);

                            if (dateInput.isBefore(dateToday)) {
                                $.fn.validationEngine.showHideMessage('Date cannot be in the past', $this, true);
                                submitForm = false;
                            }

                        }

                        //only attrMinDate has been specified
                        if ($.type(attrMinDate) !== 'undefined' && $.type(attrMinDate) !== false && $.type(attrMaxDate) === 'undefined') {

                            newMinDate = Date.parse(attrMinDate);
                            dateInput = Date.parse(fieldVal);

                            if (dateInput.isBefore(newMinDate)) {
                                $.fn.validationEngine.showHideMessage('Date cannot be before ' + attrMinDate, $this, true);
                                submitForm = false;
                            }
                        }


                        //both attrMinDate and attrMaxDate have both been specified
                        if ($.type(attrMinDate) !== 'undefined' && $.type(attrMinDate) !== false && $.type(attrMaxDate) !== 'undefined' && $.type(attrMaxDate) !== false) {

                            //use date.js functionality to get min/max dates
                            newMinDate = Date.parse(attrMinDate);
                            newMaxDate = Date.today().addYears(attrMaxDate.maxYears);
                            dateInput = Date.parse(fieldVal);

                            //compare min/max with input val
                            if (!dateInput.between(newMinDate, newMaxDate)) {
                                /*$.fn.validationEngine.showHideMessage('Please choose a date <br/>between<b> ' + attrMinDate + ' and ' + attrMaxDate.maxYears + ' years</b> from now.<br /> <span>example: 10/03/' + (currentYear+6) + '</span>', $this, true);*/

                                //if labelForText is not an empty string
                                if (labelForText !== '') {
                                    $.fn.validationEngine.showHideMessage('Invalid date range entered for: ' + labelForText, $this, true);
                                    submitForm = false;
                                } else {
                                    $.fn.validationEngine.showHideMessage('Invalid date range', $this, true);
                                    submitForm = false;
                                }
                            } else {
                                $.fn.validationEngine.showHideMessage('', $this, false);
                            }
                        }






                    } else {
                        $.fn.validationEngine.showHideMessage('A valid <strong>date</strong> is required <br /> <span>example: 12/30/' + currentYear + '</span>', $this, true);
                        submitForm = false;
                    }
                }

                //validate zip
                if ($this.hasClass("zip")) {
                    if (validateRegExp(/^\d{5}$|^\d{5}-\d{4}$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>zip</strong> is required <br /> <span>example: 92630 (ZIP + 4 optional)</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate username
                if ($this.hasClass("username")) {
                    if (validateRegExp(/^[a-zA-Z0-9_-]*$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>username</strong> is required <br /> <span>No special characters are allowed. </span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate alpha only
                if ($this.hasClass("alpha")) {
                    if (validateRegExp(/^[A-Z]+$/i) === false) {
                        $.fn.validationEngine.showHideMessage('No special characters or numbers are allowed.', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate credit card number (using luhn algorithm aka mod 10 check)
                if ($this.hasClass("ccnumber")) {

                    // if value is a redacted value, exit check (should be validated server side)
                    //input already has value, check that value for any redacted
                    if (fieldVal.indexOf('●') !== -1) {
                        return;
                    }

                    var isCardValidFormat = validateRegExp(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/);

                    if (isCardValidFormat == true) {

                        //check for credit card type
                        var ccType = getCreditCardType(fieldVal); //put cc type in var
                        var ccDropdown = $('#' + $this.data('cc-dropdown')); //find corresponding dropdown
                        //var ccDropdownVal = ccDropdown.val(); //get current value of cc dropdown

                        //this check is only for convenience, do not show errors or prevent user from submitting form if errors are found here
                        //apply switch if ccDropdown is present
                        //ccDropdown is if form has a dropdown of credit card names
                        if (ccDropdown.length) {

                            switch (ccType) {
                                case "mastercard":
                                    //auto select mastercard option from dropdown
                                    var ccTypeVal = ccDropdown.find('option:contains("Master")').val(); //purposely left "card" since some dropdowns spell "Master Card" ???? weird   
                                    ccDropdown.val(ccTypeVal);
                                    break;

                                case "visa":
                                    ///auto select visa option from dropdown
                                    var ccTypeVal = ccDropdown.find('option:contains("Visa")').val();
                                    ccDropdown.val(ccTypeVal);
                                    break;

                                case "amex":
                                    //auto select amex option from dropdown
                                    var ccTypeVal = ccDropdown.find('option:contains("American Express")').val();
                                    ccDropdown.val(ccTypeVal);
                                    break;

                                case "discover":
                                    //auto select discover option from dropdown
                                    var ccTypeVal = ccDropdown.find('option:contains("Discover")').val();
                                    ccDropdown.val(ccTypeVal);
                                    break;

                                default:
                                    //$.fn.validationEngine.showHideMessage('Card type not found.', ccDropdown, true);
                                    //ccDropdown.val("");
                            }
                        }

                        // still check with luhn algorithm regardless if cc type is not determined
                        if (!checkLuhn(fieldVal)) { //TODO: remove dashes if any, right now, the error msg just tells them to remove it
                            $.fn.validationEngine.showHideMessage('The credit card information is not correct.<br/><span>Please check and try again.</span>', $this, true);
                            submitForm = false;
                        } else {
                            $.fn.validationEngine.showHideMessage('', $this, false);
                        }
                    } else {
                        //regex check
                        $.fn.validationEngine.showHideMessage('The credit card information is not correct.<br/><span>Please check and try again.</span>', $this, true);
                        submitForm = false;
                    }
                }

                //validate credit card cvv
                if ($this.hasClass("cvv")) {
                    if (validateRegExp(/^[0-9]{3,4}$/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>cvv</strong> is required<br /> <span>example: 123 or 1234</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate whole numbers (negative/positive/zero)
                if ($this.hasClass("whole-number")) {
                    if (validateRegExp(/(^[0]{1}$|^[-]?[1-9]{1}\d*$)/) === false) {
                        $.fn.validationEngine.showHideMessage('A valid <strong>whole</strong> number is required<br /> <span>example: 123, -123, or 0.</span>', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //validate whole numbers (positive/non-zero/integer)
                if ($this.hasClass("positive-nonzero")) {
                    if (validateRegExp(/(^[1-9]\\d{0,}$)/) === false) {
                        $.fn.validationEngine.showHideMessage('<strong>Positive</strong> numbers only. 0 is not allowed.', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }

                //custom class/custom regex/custom msg
                if ($this.hasClass(customClass)) {

                    if ($.type(customClass) === "string") {
                        if (validateRegExp(customRegex) === false) {
                            customMessage($this);
                        } else {
                            //do nothing
                        }
                    }
                }
                
                //console.log(typeof (customClasses))

                //custom class/custom regex/custom msg passing in object
                if (customClasses !== undefined) {

                    for (var i = 0; i < customClasses.classes.length; i++) {
                        if ($this.hasClass(customClasses.classes[i])) {
                            if (validateRegExp(customClasses.regexes[i]) === false) {
                                customMessage($this);
                            }
                            break;
                        }
                    }

                }



                //validate address (no special chars)
                //allow  # * . , - ' "" ( ) / ; :
                if ($this.hasClass("address")) {
                    if (validateRegExp(/^[a-zA-Z0-9\s,-.'*"#()\/;:]*$/) === false) {
                        $.fn.validationEngine.showHideMessage('Your entry contains invalid characters. Acceptable characters are: # * . , - \' " ( ) / ; : Please correct them and try again.', $this, true);
                        submitForm = false;
                    } else {
                        $.fn.validationEngine.showHideMessage('', $this, false);
                    }
                }


                //validate month/year not in past
                //check year first, if year in past, FAIL
                //if year is current or future year, check month
                if ('[data-date-check]') {

                    var monthIdVal = $('#' + $this.data('date-check')).val();

                    if ($this.hasClass("year")) {
                        if ($this.val() < currentYear) {
                            $.fn.validationEngine.showHideMessage('Your card has expired, please select another card.', $this, true);
                            submitForm = false;
                        } else if ($this.val() == currentYear) {
                            if (monthIdVal - 1 < currentMonth) {
                                $.fn.validationEngine.showHideMessage('Your card has expired, please select another card.', $this, true);
                                submitForm = false;
                            } else {
                                $.fn.validationEngine.showHideMessage('', $this, false);
                            }
                        } else {
                            $.fn.validationEngine.showHideMessage('', $this, false);
                        }


                    }
                }



            }

        });


        // if "validateOnly" argument is true, skip "CHECK IF REQUIRED" code block
        if (validateOnly !== true) {

            /*----------------------------------------------------------------------------------------------------------------------------------------
            check if required
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            $(".required", $(targetContainer)).each(function () {

                var fieldVal, selectValue, cbChecked, rbChecked, labelFor, $this, labelForText;
                $this = $(this);

                labelFor = getLabel($this);
                labelForText = labelFor.length !== 0 ? labelFor.text() + ' is ' : '';

                // trim textfield value
                fieldVal = $.trim($this.val());

                // if required is a select box
                // declare selectValue variable with the value of the selected option
                if ($this.is("select")) {
                    selectValue = $this.find('option:selected').val();
                }

                // if required has the attributes of disabled or readonly
                // exit the function
                if ($this.is(':disabled') || $this.attr('readonly')) {
                    return;
                }

                if (requireAndValidateHidden != true) {
                    if ($this.is(':hidden')) {
                        return;
                    }
                }

                // check if "returnIfClassExists" argument is defined
                // if so, exit the function
                if (!$this.hasClass(returnIfClassExists)) {

                    // check checkbox or radio button lists if checked
                    // checkbox/radio button list container should have a class
                    // pass the name of the class into the argument "cbListContainerClass" or "rbListContainerClass"
                    if ($this.hasClass(cbListContainerClass) || $this.hasClass(rbListContainerClass)) {
                        // if element has a "required" class AND has "cbListContainerClass" OR "rbListContainerClass"
                        // find any child checkboxes
                        // if true, declare the "cbChecked" variable with the integer of how many of them are checked
                        if ($this.find('input:checkbox').length > 0) {
                            cbChecked = $this.find('input:checkbox:checked').length;
                        }

                        // if element has a "required" class AND has "cbListContainerClass" OR "rbListContainerClass"
                        // find any child radio buttons
                        // if true, declare the "rbChecked" variable with the integer of how many of them are checked
                        if ($this.find('input:radio').length > 0) {
                            rbChecked = $this.find('input:radio:checked').length;
                        }

                        // if no checkboxes or radio buttons are checked
                        // apply the "error" class to the "required" container and show required message
                        if (cbChecked == 0 || rbChecked == 0) {

                            $.fn.validationEngine.showHideMessage(labelForText + '<strong>Required</strong>', $this, true);
                            submitForm = false;
                            //custom required error message
                            //customMessage($(this));

                            //submitForm = false;
                        }

                    } else {

                        // check if text fields or select boxes have a value
                        if (fieldVal.length <= 0 || selectValue === "") {

                            // if true, add the "error" class
                            $this.addClass('error');

                            if ($this.attr('data-custom-message') !== undefined) {
                                //custom required error message
                                customMessage($this);
                            } else {
                                $.fn.validationEngine.showHideMessage(labelForText + '<strong>Required</strong>', $this, true);
                                submitForm = false;
                            }

                            submitForm = false;
                        } else {

                            if ($this.parents().is('.error-wrapper')) {
                                $this.unwrap();
                            }
                        }
                    }
                }

            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            custom tasks upload fields/ some Agent portal iframe file uploads
            (REFACTOR: for custom fields upload)
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            $('#hidModel[type="hidden"]', $(targetContainer)).each(function () {
                //debugger;
                var $this = $(this),
                    hasValue = $this.is('[value]'),
                    $thisVal = hasValue ? $this.val() : null,
                    obj = $.parseJSON($thisVal),
                    hasRequiredProperty = obj.hasOwnProperty("Required"),
                    isRequired = hasRequiredProperty ? obj.Required : undefined,
                    name = $this[0].name,
                    $name = $('[for="' + name + '"]'),
                    messageText = $name.length !== 0 ? $name.text() + ' is ' : '';

                if (hasValue && hasRequiredProperty && isRequired) {
                    if (obj.Attachments[0].FileName == null) {
                        $.fn.validationEngine.showHideMessage(messageText + '<strong>Required</strong>', $this.parent('.AttachmentField'), true);
                        submitForm = false;
                    }
                }

            });

        }


        /*----------------------------------------------------------------------------------------------------------------------------------------
        Match Values
        ----------------------------------------------------------------------------------------------------------------------------------------*/
        $("[data-match-id]", $(targetContainer)).each(function () {

            var $this = $(this),
				fieldVal = $.trim($this.val()),
				dataMatchId = $this.data('match-id'),
				dataName = $this.data('name'),
				fieldToCompareAgainst = $('#' + dataMatchId),
				fieldToCompareAgainstVal = fieldToCompareAgainst.val(),
				fieldToCompareAgainstName = fieldToCompareAgainst.data('name');

            if (fieldVal.length > 0) {

                //compare two fields for a match
                if (dataMatchId !== undefined) {

                    if (fieldToCompareAgainstVal.length > 0) {

                        if (fieldVal !== fieldToCompareAgainstVal) {
                            $.fn.validationEngine.showHideMessage('<strong>' + dataName + '</strong> does not match <strong>' + fieldToCompareAgainstName + '</strong>', $this, true);
                            submitForm = false;
                        } else {
                            //BUG: statement removes the error msg for a text field even if that error came from another check
                            // $this.prev(".required-message").remove();
                        }

                    }
                }
            }
        });

        /*----------------------------------------------------------------------------------------------------------------------------------------
        check submitForm 
        ----------------------------------------------------------------------------------------------------------------------------------------*/
        if (submitForm === true) {
            execute(onSuccess);
        } else {
            execute(onError);

            //focus on first error
            //debugger;
            var $firstError = $(targetContainer).find('.error:first');
            if ($firstError.children().length > 0) {
                if (!($firstError.find(':input:first').not('input[type="hidden"]'))) {
                    $firstError.find(':input:first').focus();
                } else {
                    $firstError[0].scrollIntoView();
                }
            } else {
                $firstError.focus();
            }
        }

        return submitForm;

    }

    function execute(x) {
        if (!x) {
            return;
        }

        if (typeof x == "string") {
            return eval(x)
        }

        if (typeof x == "function") {
            return x()
        }

        if (typeof x == "object") {
            return x;
        }

        throw new Error("unexpected type");
    }

    function getLabel(el) {

        var $id = el.attr('id'),
			$labelFor = $('label[for="' + $id + '"]').filter(":first");

        return $labelFor;

    }

    function hasConsole() {
        if (typeof console === "undefined") {
            return false;
        } else {
            return true;
        }
    }

    var methods = {
        init: function (options) {

            /*----------------------------------------------------------------------------------------------------------------------------------------
            attach events & event handlers
            ----------------------------------------------------------------------------------------------------------------------------------------*/

            var $this = $(this),
                $id = $this.attr('id');

            //listens for click
            $this.on('click', function (e) {

                var boolSubmit = $this.validationEngine('run', options);

                if (!boolSubmit) {
                    e.preventDefault();
                }
            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            remove red error class from input on focus in
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            $(document).on("focusin click onchange", ".error", function () {
                $(this).removeClass("error");
            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            show error message on focus in
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            $(document).on("focusin", ".validate, [requiredMsg], textarea[data-limit], textarea[limit], .required", function (e) {
                //console.log(e.type)
                if ($(this).prev().hasClass("required-message")) {
                    $(this).prev(".required-message").show();
                }
            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            show error message on focus in (REFACTOR: for custom fields upload)
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            if ($('.AttachmentField').length > 0) {

                $(document).on("focus", ".AttachmentField", function () {
                    if ($(this).prev().hasClass("required-message")) {
                        $(this).prev(".required-message").show();
                    }
                });

                $(document).on("focusout", ".AttachmentField", function () {
                    if ($(this).prev().hasClass("required-message")) {
                        $(this).prev(".required-message").hide();
                    }
                });

                $('.AttachmentField').attr('tabindex', -1);
            }

            /*----------------------------------------------------------------------------------------------------------------------------------------
            hide error message on focus out
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            $(document).on("focusout", ".validate, [requiredMsg], textarea[data-limit], textarea[limit], .required", function () {
                //TODO: After removing the message re-validate for the specific type of field.
                if ($(this).prev().hasClass("required-message")) {
                    $(this).prev(".required-message").hide();
                }
            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            char limit
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            //NOTE: input event not supported in IE8, keypress event added
            //keydown event for ie9
            //keyup for paste events
            $(document).on("keypress keydown keyup click", "textarea[data-limit], textarea[limit]", function (e) {
                //console.log(e.type)
                var $this = $(this),
                    limit = $this.data("limit") || $this.attr('limit'),
					val = $this.val(),
					totalChars = val.length;

                if ('browser' in $) {

                    if ($.browser.webkit && $this.attr('maxlength')) {

                        //regex that checks for line returns (jquery for some reason counts returns as one char, when HTTP spec counts it as 2 char)
                        //Chrome is only browser that counts carriage returns as 2 chars
                        //need to target Chrome and count carriage returns as two to match

                        var newLines = val.match(/(\r\n|\n|\r)/g),
							addition = (newLines != null) ? newLines.length : 0;

                        totalChars = totalChars + addition;
                    }
                }

                var count = limit - totalChars;

                //console.log('newLines: ' + newLines.length);
                //console.log(this.val);
                //console.log('addition: ' + addition);
                //console.log('totalChars: ' + totalChars);
                //console.log('count: ' + count)

                if (totalChars > limit) {
                    $this.val($this.val().slice(0, limit));
                    count = 0;
                }

                //console.log('count: ' + count)

                if ($this.prev().hasClass("required-message") === false) {
                    if (count == 0) {
                        $this.before('<div class="required-message"><strong>' + count + '</strong> characters left</div>');
                    } else {
                        $this.before('<div class="required-message yellow"><strong>' + count + '</strong> characters left</div>');
                    }
                    // still uses JQuery UI positioning
                    $this.prev(".required-message").position({
                        my: "right bottom",
                        at: "right top",
                        of: this,
                        offset: "-0 -2",
                        collision: "flip flip"
                    });
                } else {
                    $this.prev(".required-message").remove();
                    if (count == 0) {
                        $this.before('<div class="required-message"><strong>' + count + '</strong> characters left</div>');
                    } else {
                        $this.before('<div class="required-message yellow"><strong>' + count + '</strong> characters left</div>');
                    }
                    $this.prev(".required-message").position({
                        my: "right bottom",
                        at: "right top",
                        of: this,
                        offset: "-0 -2",
                        collision: "flip flip"
                    });
                }
            });

            /*----------------------------------------------------------------------------------------------------------------------------------------
            find required fields inside of provided targetElement and add a red * to the label
            ----------------------------------------------------------------------------------------------------------------------------------------*/

            //clear previous asterisk classes first
            $('label').each(function () {
                $(this).removeClass('asterisk');
            });

            $(".required").each(function () {

                var $this = $(this),
					label = getLabel($this);

                if (label.hasClass('no-asterisk')) {
                    return;
                }

                label.addClass('asterisk');
            });

            //(REFACTOR: for custom fields upload)
            //add asterisk to custom field uploads
            $('#hidModel[type="hidden"]').each(function () {
                var $this = $(this),
                    hasValue = $this.is('[value]'),
                    $thisVal = hasValue ? $this.val() : null,
                    obj = $.parseJSON($thisVal),
                    hasRequiredProperty = obj.hasOwnProperty("Required"),
                    isRequired = hasRequiredProperty ? obj.Required : undefined,
                    name = $this[0].name,
                    $name = $('[for="' + name + '"]');

                if ($name.hasClass('no-asterisk')) { return; }
                if (hasValue && hasRequiredProperty && isRequired) {
                    $name.addClass('asterisk');
                }
            });


            /*----------------------------------------------------------------------------------------------------------------------------------------
            function used to create popup
            ----------------------------------------------------------------------------------------------------------------------------------------*/
            //public
            $.fn.validationEngine.showHideMessage = function (message, element, show) {

                // if "show" argument is true, proceed
                if (show === true) {

                    var prevEl, parentDialog, parentDialogContent, errorWrapper, reqMsgHeight;

                    // add "error" class to element
                    // add div with message before element
                    element.addClass("error");
                    element.before('<div class="required-message">' + message + '</div>');

                    prevEl = element.prev(".required-message");

                    if (!options.requireAndValidateHidden) {

                        // dependency on jquery ui positioning
                        // within: element option important for validating a field out of viewport
                        prevEl.position({
                            my: "left bottom",
                            at: "left top",
                            of: element,
                            within: element
                        });

                    } else { /* use pure markup to display validation for hidden fields (jquery ui position util doesn't know how to position hidden fields) */
                        // wrap input and required msg in error span
                        if (element.parents('.error-wrapper').length > 0) {
                            // element already has a span with a class of 'error-wrapper'
                        } else {
                            prevEl.next(element).addBack().wrapAll('<span class="error-wrapper"/>');
                        }

                        errorWrapper = element.parents('.error-wrapper');

                        reqMsgHeight = element.is('textarea') ? element.outerHeight() + 13 : element.outerHeight();

                        // increase width of req msg depending if msg has more than 50 chars
                        if (message.length > 50) {
                            prevEl.css('width', '200px');
                        }

                        // position req msg according to height of error wrapper
                        prevEl.css('bottom', reqMsgHeight);
                    }

                    // hide msg until it is focused on
                    prevEl.hide();

                    return false;

                } else {
                    element.prev(".required-message").remove();

                    if (options.requireAndValidateHidden) {
                        if (element.parents().is('.error-wrapper')) {
                            element.unwrap();
                        }
                    }

                    element.removeClass("error");
                }
            }



        },
        run: function (options) {
            return validate(options.targetContainer, options.onSuccess, options.onError, options.returnIfClassExists, options.validateOnly, options.cbListContainerClass, options.rbListContainerClass, options.requireAndValidateHidden, options.customClass, options.customClasses, options.customRegex, options.onBeforeSubmit);
        },
        version: function () {
            return "4.0.4"
        }
    };

    $.fn.validationEngine = function (method) {

        // method calling logic
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' + method + ' does not exist on jQuery.validationEngine');
        }

    };

})(jQuery);