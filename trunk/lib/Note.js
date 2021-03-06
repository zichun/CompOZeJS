/*
 * Note Object
 *
 * Copyright (c) 2012 Koh Zi Chun and Joe Chee (https://github.com/zichun/CompOZeJS)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
var Note =
(function() {
	
	function Note(note, octave) {
		var self = this;
		
		var nn = note;
		var cnt = nn.length-1;
		while(cnt >= 0 && nn[cnt] == '^') {
			octave++;
			--cnt;
		}
		cnt = nn.length-1;
		while(cnt >= 0 && nn[cnt] == 'v') {
			octave--;
			--cnt;
		}
		note = "";
		for (var i=0;i<=cnt;++i) {
			note += nn[i];
		}

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
		self.isSharp = function() {
			return (note.length > 1 && note[1] == '#');
		}
		self.isFlat = function() {
			return (note.length > 1 && note[1] == 'b');
		}
		self.getCoordinate = function() {
			var self = this;
			var tr = self.getOctave() * 21 + self.getNoteNumber() * 3 + 1;
			if (self.isSharp()) ++tr;
			else if(self.isFlat()) --tr;
			return tr;
		}
		
		self.getAbsoluteSemitone = function() {
			// Middle C = 0
			var self = this;
			//if (self.getOctave() >= 0) {
				return self.getOctave() * 12 + self.getSemitone();
			//} else {
			//	return self.getOctave() * 12 + self.getSemitone();
			//}
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

	Note.CoordinateToNote = function(coordinate) {
		var nc = coordinate;
		while(nc < 0) nc += 21;
		var note = Math.floor((nc%21) / 3);
		var accidental = '';
		
		if ( nc % 3 === 0) accidental = 'b';
		else if (nc % 3 === 2) accidental = '#';

		return new Note( Note.Notes[note] + accidental, Math.floor(coordinate / 21)); 
	}
	//012 345 678 91011 121314 151617 181920 
	//212223 242526 272829 303132 333435 363738 394041
	//424344 454647
	Note.Notes = ['C','D','E','F','G','A','B','C'];
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