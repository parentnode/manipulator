u.paymentCards = new function() {

	//var default_format = /(\d{1,4})/g
	this.payment_cards = [
		{
			"type": 'maestro',
			"patterns": [5018, 502, 503, 506, 56, 58, 639, 6220, 67],
			"format": /(\d{1,4})/g,
			"card_length": [12,13,14,15,16,17,18,19],
			"cvc_length": [3],
			"luhn": true
		},
		{
			"type": 'forbrugsforeningen',
			"patterns": [600],
			"format": /(\d{1,4})/g,
			"card_length": [16],
			"cvc_length": [3],
			"luhn": true,
		},
		{
			"type": 'dankort',
			"patterns": [5019],
			"format": /(\d{1,4})/g,
			"card_length": [16],
			"cvc_length": [3],
			"luhn": true
		},
		{
			"type": 'visa',
			"patterns": [4],
			"format": /([\d]{1,4})([\d]{1,4})?([\d]{1,4})?([\d]{1,4})?/,
			"card_length": [13, 16],
			"cvc_length": [3],
			"luhn": true
		},
		{
			"type": 'mastercard',
			"patterns": [51, 52, 53, 54, 55, 22, 23, 24, 25, 26, 27],
			"format": /(\d{1,4})/g,
			"card_length": [16],
			"cvc_length": [3],
			"luhn": true
		},
		{
			"type": 'amex',
			"patterns": [34, 37],
			"format": /(\d{1,4})([\d]{0,6})?(\d{1,5})?/,
			"card_length": [15],
			"cvc_length": [3,4],
			"luhn": true
		}
	];

	// validate card number from card specifications
	this.validateCardNumber = function(card_number) {
		var card = this.getCardTypeFromNumber(card_number);

		if(card && parseInt(card_number) == card_number) {
			var i, allowed_length;
			for(i = 0; allowed_length = card.card_length[i]; i++) {

				// check length
				if(card_number.length == allowed_length) {

					// check luhn?
					if(card.luhn) {
						return this.luhnCheck(card_number);
					}
					// no luhn check
					else {
						return true;
					}
					
				}
				
			}
			
		}
		return false;
	}

	// validate combined expiry date
	this.validateExpDate = function(month, year) {

		if(
			this.validateExpMonth(month) && 
			this.validateExpYear(year) && 
			new Date(year, month-1) >= new Date(new Date().getFullYear(), new Date().getMonth())
		) {
			return true;
		}
		
		return false;
	}

	// validate expiry month
	this.validateExpMonth = function(month) {

		if(month && parseInt(month) == month && month >= 1 && month <= 12) {
			return true;
		}
		return false;
	}

	// validate expiry year
	this.validateExpYear = function(year) {

		if(year && parseInt(year) == year && new Date(year, 0) >= new Date(new Date().getFullYear(), 0)) {
			return true;
		}
		return false;
	}


	// validate that CVC is in accordance with card specs
	this.validateCVC = function(cvc, card_number) {

		// default cvc lengths
		var cvc_length = [3,4];

		// get cvc lengths for current card type (if available)
		if(card_number && parseInt(card_number) == card_number) {
			var card = this.getCardTypeFromNumber(card_number);
			if(card) {
				cvc_length = card.cvc_length;
			}
		}

		if(cvc && parseInt(cvc) == cvc) {
			var i, allowed_length;
			for(i = 0; allowed_length = cvc_length[i]; i++) {
				if(cvc.toString().length == allowed_length) {
					return true;
				}
			}
		}
		return false;
	}

	// identify card from card number
	this.getCardTypeFromNumber = function(card_number) {
		var i, j, card, pattern, regex;
		for(i = 0; card = this.payment_cards[i]; i++) {
			for(j = 0; pattern = card.patterns[j]; j++) {
				if(card_number.match('^' + pattern)) {
					return card;
				}
			}
		}
		return false;
	}

	// format card number according to card type 
	this.formatCardNumber = function(card_number) {

		var card = this.getCardTypeFromNumber(card_number);
		if(card) {
			var matches = card_number.match(card.format);
			if(matches) {
				if(matches.length > 1 && matches[0] == card_number) {
					matches.shift();
					card_number = matches.join(" ").trim();
				}
				else {
					card_number = matches.join(" ");
				}
			}
		}
		return card_number;
	}

	// perform luhn card number validation check
	this.luhnCheck = function(card_number) {
		var ca, sum = 0, mul = 1;
		var len = card_number.length;
		while (len--) {
			ca = parseInt(card_number.charAt(len),10) * mul;
			sum += ca - (ca>9)*9;
			mul ^= 3;
		};
		return (sum%10 === 0) && (sum > 0);
	};

	//
	// this.luhnCheck2 = function(val) {
	//     var sum = 0;
	//     for (var i = 0; i < val.length; i++) {
	//         var intVal = parseInt(val.substr(i, 1));
	//         if (i % 2 == 0) {
	//             intVal *= 2;
	//             if (intVal > 9) {
	//                 intVal = 1 + (intVal % 10);
	//             }
	//         }
	//         sum += intVal;
	//     }
	//     return (sum % 10) == 0;
	// }
	//
	// this.luhnCheck2 = function(val) {
	//
	//     var sum = 0;
	//     var numdigits = input.length;
	//     var parity = numdigits % 2;
	//     for(var i=0; i < numdigits; i++) {
	//       var digit = parseInt(input.charAt(i))
	//       if(i % 2 == parity) digit *= 2;
	//       if(digit > 9) digit -= 9;
	//       sum += digit;
	//     }
	//     return (sum % 10) == 0;
	// }
	//
	// this.checkLuhn3 = function (cardNo) {
	//     var s = 0;
	//     var doubleDigit = false;
	//     for (var i = cardNo.length - 1; i >= 0; i--) {
	//         var digit = +cardNo[i];
	//         if (doubleDigit) {
	//             digit *= 2;
	//             if (digit > 9)
	//                 digit -= 9;
	//         }
	//         s += digit;
	//         doubleDigit = !doubleDigit;
	//     }
	//     return s % 10 == 0;
	// }
	// cardFromNumber = (num) ->
	// 	num = (num + '').replace(/\D/g, '')
	// 	for card in cards
	// 		for pattern in card.patterns
	// 			p = pattern + ''
	// 			return card if num.substr(0, p.length) == p
	//
	// cardFromType = (type) ->
	// 	return card for card in cards when card.type is type
	//
	// luhnCheck = (num) ->
	// 	odd = true
	// 	sum = 0
	//
	// 	digits = (num + '').split('').reverse()
	//
	// 	for digit in digits
	// 		digit = parseInt(digit, 10)
	// 		digit *= 2 if (odd = !odd)
	// 		digit -= 9 if digit > 9
	// 		sum += digit
	//
	// 	sum % 10 == 0
	//
}
