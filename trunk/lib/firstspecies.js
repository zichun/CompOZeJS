var firstSpecies = 

(function () {
	function firstSpecies(input, output) {
	
		var dorian = parseInput(input);
		
		var composition = [[], dorian];
		var result = runDFS(0, composition);
		
		var renderedOutput = '';

		for (var i=0;i<composition[0].length;++i) {
			renderedOutput += composition[0][i].toABC() + '8|';
		}
		renderedOutput += "|";
		output.val(renderedOutput);
		return renderedOutput;
	}
	function runDFS(i, composition) {
		if (checkConstraints(composition) === false) return false;
		if (i === composition[1].length) {
			// we got a solution
			return true;
		}
		
		for (var notes in Note.NotesToSemiTones) {
			if (Note.NotesToSemiTones.hasOwnProperty(notes) === false) continue;
			//if (notes.length === 2) continue;
			
			for (var j=0;j<=1;++j) {
				composition[0][i] = new Note(notes,j);
				if (runDFS(i+1, composition)) return true;
			}
		}
		return false;
	}
	function checkConstraints(composition) {
		for (var i=0;i<constraints.length;++i) {
			if (constraints[i](composition) === false) {
				return false;
			}
		}
		return true;
	}

	var constraints = [
		function noDissonance(composition) {
			for (var i=0;i<composition[0].length;++i) {
				var interval = composition[0][i].interval( composition[1][i] );
				var n = interval.getInterval();
				if (n !== 0 && n !== 5 && n !== 3 && n !== 6 && n !== 8) return false;
				if (interval.getType() === Interval.AUGMENTED || interval.getType() === Interval.DIMINISHED) return false;
				if (n === 5 && interval.getType() !== Interval.PERFECT) return false;
			}
			return true;
		},
		
		function noDirectToPerfectConsonance(composition) {
			for (var i=0;i<composition[0].length-1;++i) {
				var s0 = composition[0][i+1].getSemitone() - composition[0][i].getSemitone();
				var s1 = composition[1][i+1].getSemitone() - composition[1][i].getSemitone();
				if (s0 * s1 > 0) { // direct motion
					var interval = composition[0][i+1].interval( composition[1][i+1] );
					var n = interval.getInterval();
					if (n != 3 && n != 6) return false;
				}
			}
			return true;
		},
		
		function noAugmentedOrDiminishedNoteBetweenSuceedingNotes(composition) {
			for (var i=0;i<composition[0].length-1;++i) {
				var interval = composition[0][i+1].interval( composition[1][i] );
				if (interval.getType === Interval.AUGMENTED || interval.getType === Interval.DIMINISHED) return false;
			}
			return true;
		},
		
		function noMajorSixOrSevenLeap(composition) {
			for (var i=0;i<composition[0].length;++i) {
				var interval = composition[0][i].interval( composition[0][i] );
				var n = interval.getInterval();
				if (interval.getType() === Interval.MAJOR && (n === 6 || n === 7)) return false;
			}
			return true;
		},
		
		function noUnison(composition) {
			// Unisons are not allowed, except in the first bar.
			for (var i=1;i<composition[0].length;++i) {
				if (composition[0][i].getAbsoluteSemitone() === composition[1][i].getAbsoluteSemitone()) return false;
			}
			return true;
		},
		function firstBarIsOctaveFifthOrUnison(composition) {
			if (composition[0].length > 0) {
				var interval = composition[0][0].interval( composition[1][0] );
				var n = interval.getInterval();
				if (n != 0 && n != 5 && n != 8) return false;
			}
			return true;
		},
		function secondLastBarMajorSixth(composition) {
			if (composition[0].length >= composition[1].length-1) {
				var lb = composition[1].length-2;
				var interval = composition[0][lb].interval( composition[1][lb] );
				var n = interval.getInterval();
				if (n === 6 && interval.getType() === Interval.MAJOR) return true;
				return false;
			}
			return true;
		},
		function lastBarOctave(composition) {
			if (composition[0].length >= composition[1].length) {
				var lb = composition[1].length-1;
				var interval = composition[0][lb].interval( composition[1][lb] );
				var n = interval.getInterval();
				if (n === 8) return true;
				return false;
			}
			return true;
		}
		
		/***
		wiki constraints
		
		Begin and end on either the unison, octave, or fifth, unless the added part is underneath, in which case begin and end only on unison or octave.
	Use no unisons except at the beginning or end.
	Avoid parallel fifths or octaves between any two parts; and avoid "hidden" parallel fifths or octaves: that is, movement by similar motion to a perfect fifth or octave, unless one part (sometimes restricted to the higher of the parts) moves by step.
	Avoid moving in parallel fourths. (In practice Palestrina and others frequently allowed themselves such progressions, especially if they do not involve the lowest of the parts.)
	Avoid moving in parallel thirds or sixths for very long.
	Attempt to keep any two adjacent parts within a tenth of each other, unless an exceptionally pleasing line can be written by moving outside of that range.
	Avoid having any two parts move in the same direction by skip.
	Attempt to have as much contrary motion as possible.
	Avoid dissonant intervals between any two parts: major or minor 2nd, major or minor 7th, any augmented or diminished interval, and perfect fourth (in many contexts).
		***/
		
		,function noParallelFifthsOrOctaves(composition) {
			for (var i = 1; i < composition[0].length; i++) {
				if ((composition[0][i].interval(composition[1][i]).getInterval() === 5) 
					&& (composition[0][i-1].interval(composition[1][i-1]).getInterval() === 5)) {
						return false;
				} 
			}
			
			for (var i = 1; i < composition[0].length; i++) {
				if ((composition[0][i].interval(composition[1][i]).getInterval() === 8) 
					&& (composition[0][i-1].interval(composition[1][i-1]).getInterval() === 8)) {
						return false;
				} 
			}
			return true;
		}
		
		,function noParallelFourths(composition) {
			for (var i = 1; i < composition[0].length; i++) {
				if ((composition[0][i].interval(composition[1][i]).getInterval() === 4) 
					&& (composition[0][i-1].interval(composition[1][i-1]).getInterval() === 4)) {
						return false;
				} 
			}
			return true;
		}
		
		,function contraryMotion(composition) {
			for (var i = 1; i < composition[0].length; i++) {
				var increasingTopLine = (composition[0][i].getAbsoluteSemitone() - composition[0][i-1].getAbsoluteSemitone() >= 0);
				var increasingBottomLine = (composition[1][i].getAbsoluteSemitone() - composition[1][i-1].getAbsoluteSemitone() >= 0);
				if (!XOR(increasingTopLine,increasingBottomLine)) {
					return false;
				}
			}
			return true;
		}
		

		
	];

	function XOR(a,b) {
	  return ( a || b ) && !( a && b );
	}
	
	function parseInput(input) {
		input = input.split("8|");
		
		var melody = [];
		
		for (var i = 0; i < input.length-1; i++) {
			if ((input[i] >= 'a') && (input[i] <= 'z')) {
				melody.push(new Note(input[i], 1));
			} else if ((input[i] >= 'A') && (input[i] <= 'Z')) {
				melody.push(new Note(input[i], 0));
			} else {
				console.log("error: "+input[i]);
			}
			
		}
		
		return melody;
	
		
	
	}
	return firstSpecies;
})();
//var a = new Note('D',0);
//var b = new Note('Db',0);
//alert(a.interval(b).getInterval());
//firstSpecies = false;


$(function() {
	createInterface($('#interface')[0], 'D8|F8|E8|D8|G8|F8|A8|G8|F8|E8|D8||');
});
