var Note =

(function() {
	function Note(note, octave) {
		var self = this;

		self.getOctave = function() {
			return octave;
		}
		self.getNote = function() {
			return note;
		}
		self.getSemitone = function() {
			return Note.NotesToSemiTones[note];
		}
		self.getNoteNumber = function (){
			return ((note.charCodeAt(0) - 67) + 7) % 7;
		}
		
		return self;
	}
	Note.prototype.interval = function(note) {
		var self = this;
		if ( !(note instanceof Note) ) {
			throw("Interval can only be compared to a ntoe");
		} else {
			return Interval.noteInterval(self, note);
		}
	}
	Note.prototype.toABC = function() {
		var self=this;
		var note = self.getNote(), octave = self.getOctave();
		
		var tr = '';
		if (note.length == 2) {
			tr += note[1] === 'b' ? '_' : '^';
		}
		tr += note[0];
		var toadd = octave < 0 ? ',' : "'";
		for (var i=0;i<Math.abs(octave);++i) {
			tr += toadd;
		}
		return tr;
	}
	
	Note.NotesToSemiTones = {
		 'Cb': 11
		,'C' : 0
		,'C#': 1
		,'Db': 1
		,'D' : 2
		,'D#': 3
		,'Eb': 3
		,'E' : 4
		,'E#': 5
		,'Fb': 4
		,'F' : 5
		,'F#': 6
		,'Gb': 6
		,'G' : 7
		,'G#': 8
		,'Ab': 8
		,'A' : 9
		,'A#': 10
		,'Bb': 10
		,'B' : 11
		,'B#': 0
	};

	
	return Note;
})();