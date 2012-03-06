var Interval = 
(function() {

	function Interval(notes, semitones) {			
		var self = this;
		
		while(notes < 0) notes += 7;
		if (notes > 8) notes %= 8;
		
		while(semitones < 0) semitones += 12;
		semitones = semitones % 12;
		
		self.getInterval = function() {
			return notes;
		}
		self.getSemitones = function() {
			return semitones;
		}
		self.getType = function() {
			return IntervalsCache[ self.getSemitones() ][self.getInterval()];
		}
		
		return self;
	}
	Interval.prototype.toString = function() {
		var self = this;
		return IntervalsCache[ self.getSemitones() ][self.getInterval()] + '' + self.getInterval();
	}
	
	Interval.noteInterval = function(low, high) {
		if ( !( low instanceof Note) || !(high instanceof Note) ) throw("Given arguments not of Note type");
		if (low.getAbsoluteSemitone() > high.getAbsoluteSemitone()) {
			var tmp = low;
			low = high;
			high = tmp;
		}
		var offset = 0;
		if (high.getNoteNumber() === low.getNoteNumber() && high.getAbsoluteSemitone() > low.getAbsoluteSemitone()) offset += 8;

		return (new Interval(offset + high.getNoteNumber() - low.getNoteNumber(),  
			high.getSemitone() - low.getSemitone() ));
	}

	Interval.MAJOR = 'M';
	Interval.MINOR = 'm';
	Interval.AUGMENTED = 'A';
	Interval.DIMINISHED = 'd';
	Interval.PERFECT = 'P';


	var IntervalsCache = {
		'0':	{ '0': Interval.PERFECT, '2': Interval.DIMINISHED},
		'1':	{ '1': Interval.AUGMENTED, '2': Interval.MINOR },
		'2':	{ '2': Interval.MAJOR, '3':Interval.DIMINISHED },
		'3': 	{ '3': Interval.MINOR, '2': Interval.AUGMENTED },
		'4': 	{ '3': Interval.MAJOR, '4': Interval.DIMINISHED},
		'5':	{ '4': Interval.PERFECT, '3': Interval.AUGMENTED},
		'6':	{ '5': Interval.DIMINISHED, '4': Interval.AUGMENTED},
		'7':	{ '5': Interval.PERFECT, '6': Interval.DIMINISHED},
		'8':	{ '6': Interval.MINOR, '5': Interval.AUGMENTED},
		'9':	{ '6': Interval.MAJOR, '7': Interval.DIMINISHED},
		'10':	{ '7': Interval.MINOR, '6': Interval.AUGMENTED},
		'11':	{ '7': Interval.MAJOR, '8': Interval.DIMINISHED},
		'12':	{ '8': Interval.PERFECT, '7': Interval.AUGMENTED}
	};

	
	return Interval;

})();