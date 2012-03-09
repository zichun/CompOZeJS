// requires DomainHelper.js, fd.js, 

// todo: factorize parameters to options
function SolveFirstSpecies(cantus_firmus, soln_limit, clef, cb) {
	var root = [];
	if (clef === 'treble') {
		semitoneRange = [0, 48];
	} else {
		semitoneRange = [-12,0];
	}
	for (var i=0;i<cantus_firmus.length;++i) {
		root.push('N'+i);
	}

	var S = new FD.space();
	S.decl(root, [semitoneRange] );

	var constraints = 
	(function() {
		function intervalFromSolutions(s1, s2) {
			var n1 = Note.CoordinateToNote(s1), n2 = Note.CoordinateToNote(s2);
			return n1.interval(n2);
		}
		function noteConstraints(S, notes, check, debug) {
			function extractNote(ind) {
				for (var tr=[], i=0;i<notes.length;++i) {
					if (i === ind) continue;
					tr.push(notes[i]);
				}
				return tr;
			}
			for (var i=0;i<notes.length;++i) {
			(function(ind) {
				var dep = extractNote(ind);
				S.newprop({
					allvars: notes,
					depvars: dep,
					step: function() {
						var s = [], S = this.space[0],nextStep = 0;
						s.push( this.space[ind+1] );
						for (var i=1;i<=notes.length;++i) {
							if (i === ind+1) continue;
							s.push( this.space[i] );
						}
						
						var solns = [], cur = [];
						for (i=0;i<s.length;++i ){
							nextStep += s[i].step;
							solns.push( DomainHelper.domain_to_list(s[i].dom) );
							cur.push(0);
						}
						var valid = [];
						if (nextStep > this.last_step) {
							while(true) {
								var i = s.length-1;
								while(cur[i] >= solns[i].length && i > 0) {
									cur[i]=0; cur[i-1]++;
									--i;
								}
								if (cur[0] >= solns[0].length) break;
								
								var nt=[];
								var cnt = 1;
								for (i=0;i<notes.length;++i) {
									if (i===ind) {
										nt.push( Note.CoordinateToNote(solns[0][ cur[0] ]) );
									} else {
										nt.push( Note.CoordinateToNote(solns[cnt][ cur[cnt] ]) );
										++cnt;
									}
								}
								if (check.apply(this, nt) === true) {
									valid.push( solns[0][ cur[0] ]);
									cur[0]++;
									for (i=1;i<s.length;++i) cur[i] = 0;
								} else {
									cur[ s.length-1]++;
								}
							}
							s[0].set_dom(
								DomainHelper.domain_non_empty(
									DomainHelper.list_to_domain(valid)));
						}
						return (this.last_step - nextStep);
					}
				});
			})(i);
			}
		}
		function oneNoteConstraint(S,note,check, debug) {
			noteConstraints(S, [note], check, debug);
		}
		function succeedingNotesConstraint(S, note1, note2, check, debug) {
			noteConstraints(S, [note1, note2], check, debug);
		}
		function threeNotesConstraint(S, n1, n2, n3, check, debug) {
			noteConstraints(S, [n1,n2,n3], check, debug);
		}
		
		
		return [
		/**
			Perfect consonant intervals are unisons, fifths, and octaves.
			Imperfect consonant intervals are thirds and sixths.
			Seconds, fourths, sevenths, and all augmented and diminished intervals are dissonances.
		 */
		function noDissonance(S, root) {
			// First Species: no dissonances are allowed
			// todo: factorize cantus_firmus
			for (var i=0;i<cantus_firmus.length;++i) {
			(function(i) {
				oneNoteConstraint( S, 'N'+i, function(cnote) {
					var interval = cnote.interval( cantus_firmus[i] );
					var n = interval.getInterval();

					if (n !== 0 && n !== 5 && n !== 3 && n !== 6 && n !== 8) return false;
					if (interval.getType() === Interval.AUGMENTED || interval.getType() === Interval.DIMINISHED) return false;
					if (n === 5 && interval.getType() !== Interval.PERFECT) return false; // todo: check this criteria. since when 5th must be perfect
					return true;
				});
			})(i);
			}
		}
		
		,function noAugmentedOrDiminishedNoteBetweenSuceedingNotes(S, root) {
			// general: Augmented or diminished intervals between succeeding notes are not allowed.
			for (var i=0;i<root.length-1;++i) {
			(function(i){
				succeedingNotesConstraint(S, 'N'+i, 'N'+(i+1), function(note1, note2) {
					var interval = note1.interval(note2);
					return !(interval.getType() === Interval.AUGMENTED || interval.getType() === Interval.DIMINISHED);
				});
			})(i);
			}
		}
		
		,function noMajorSixOrSevenOrOctaveLeap(S, root) {
			// general: Leaps greater than an octave, or leaps of a major sixth or a seventh are prohibited.
			for (var i=0;i<root.length-1;++i) {
			(function(i) {
				succeedingNotesConstraint(S, 'N'+i, 'N'+(i+1), function(note1, note2) {
					if (Math.abs(note1.getAbsoluteSemitone() - note2.getAbsoluteSemitone()) > 12) return false;

					var interval = note1.interval(note2);
					var n = interval.getInterval();
					if (interval.getType() === Interval.MAJOR && (n === 6 || n === 7)) return false;
					return true;
				}, true);
			})(i);
			}
		}
		
		,function ascendingLeapfollowedByStep(S, root) {
			//An ascending leap of a minor sixth or an octave must be followed by a step back down within the compass of the leap (figure 2). In the same way, a descending leap of an octave must be followed by a step back up within the compass of the leap.
			for (var i=0;i<root.length-2;++i) {
			(function(i) {
				threeNotesConstraint(S, 'N'+i, 'N'+(i+1), 'N'+(i+2), function(n1, n2, n3) {
					var interval = n2.interval( n1 );
					var n = interval.getInterval();
					if (n === 8 || (n === 6 && interval.getType() === Interval.Minor)) {
						var a3 = n3.getAbsoluteSemitone(), a2 = n2.getAbsoluteSemitone(), a1 = n1.getAbsoluteSemitone();
						if (a3 >= a2 && a2 > a1) return false;
						if (a3 <= a2 && a2 < a1) return false;
					}
					return true;
				});
			})(i);
			}
		}
		
		,function noDescendingMinorSixth(S, root) {
			// general: A descending leap of a minor sixth is prohibited.
			for (var i=0;i<root.length-1;++i) {
			(function(i) {
				succeedingNotesConstraint(S, 'N'+i, 'N'+(i+1), function(note1, note2) {
					if (note1.getAbsoluteSemitone() <= note2.getAbsoluteSemitone()) return true; // ascending note. no need to care
					var interval = note2.interval( note1 );
					var n = interval.getInterval();
					if (interval.getType() === Interval.MINOR && n === 6) return false;
					return true;
				});
			})(i);
			}
		}

		,function noDirectToPerfectConsonance(S, root) {
			// The two parts may not move in direct motion to a perfect consonance.
			for (var i=0;i<root.length-1;++i) {
			(function(i) {
				succeedingNotesConstraint(S, 'N'+i, 'N'+(i+1), function(note1, note2) {
					var s1 = cantus_firmus[i+1].getAbsoluteSemitone() - cantus_firmus[i].getAbsoluteSemitone();
					var s0 = note2.getAbsoluteSemitone() - note1.getAbsoluteSemitone();
					if (s0 * s1 > 0) { // direct motion
						var interval = note2.interval( cantus_firmus[i+1] );
						var n = interval.getInterval();
						if (n === 0 || n === 5 || n === 8) return false;
					}
					return true;
				});
			})(i);
			}
		}
		
		,function noUnison(S, root) { 
			// Unisons are not allowed, except in the first bar.
			for (var i=1;i<cantus_firmus.length;++i) {
			(function(i){
				oneNoteConstraint( S, 'N'+i, function(cnote) {
					var interval = cnote.interval( cantus_firmus[i] );
					var n = interval.getInterval();
					if (cnote.getAbsoluteSemitone() === cantus_firmus[i].getAbsoluteSemitone()) return false;
					return true;
				});
			})(i);
			}
			return true;
		}

		,function firstBarIsOctaveFifthOrUnison(composition) {
			// first species: The counterpoint in the first bar must be an octave or a fifth above the cantus firmus, or a unison.
			oneNoteConstraint( S, 'N0', function(cnote) {
				var interval = cnote.interval( cantus_firmus[0] );
				var n = interval.getInterval();
				if (n != 0 && n != 5 && n != 8) return false;
				return true;
			});
		}
		
		,function secondLastBarMajorSixth(composition) {
			// first species: In the penultimate bar the counterpoint must be a major sixth above the cantus firmus. This requires an accidental in the cantus_firmus, Mixolydian, and Aeolian modes.
			var lb = cantus_firmus.length-2;
			oneNoteConstraint( S, 'N' + lb, function(cnote) {
				var interval = cnote.interval( cantus_firmus[lb] );
				var n = interval.getInterval();
				if (n === 6 && interval.getType() === Interval.MAJOR) return true;
				return false;
			});
		}

		,function lastBarOctave(composition) {
			// first species: In the final bar the counterpoint must be an octave above the cantus firmus.
			var lb = cantus_firmus.length-1;
			oneNoteConstraint( S, 'N' + lb, function(cnote) {
				var interval = cnote.interval( cantus_firmus[lb] );
				var n = interval.getInterval();
				if (n === 8) return true;
				return false;
			});
		}

		,function noCrossing(c) {
			// voices cannot cross
			for (var i=1;i<cantus_firmus.length;++i) {
			(function(i) {
				oneNoteConstraint( S, 'N'+i, function(cnote) {
					var sabove = (cnote.getAbsoluteSemitone() > cantus_firmus[i].getAbsoluteSemitone());
					return clef === 'treble' ? sabove : !sabove;
				});
			})(i);
			}
		}
		
		,function noAccidentalsExceptForSecondLastBar(c) {
			// general: Accidentals should generally be avoided since they are not in the character of the ecclesiastical modes. However, the penultimate bar in each species requires a specific sequence which may demand the use of a sharp.
			for (var i=0;i<cantus_firmus.length;++i) {
				if (i === cantus_firmus.length-2) continue;
			(function(i) {
				oneNoteConstraint( S, 'N'+i, function(cnote) {
					if (cnote.isSharp() || cnote.isFlat()) return false;
					return true;
				});
			})(i);
			}
		}

	];
	})();

	// initialize constraints
	for (var i=0;i<constraints.length;++i) {
		constraints[i](S, root);
	}
	FD.distribute.fail_first(S, root);

	var cnt = 0;
	var state = {space: S};
	
	function solve() {
		FD.search.depth_first(state);
		cnt ++;
		cb(state);
		if (cnt > soln_limit) return;
		if (state.more) {
			setTimeout(solve, 10);
		}
	}
	solve();
}