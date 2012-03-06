var createInterface = 

(function () {

	function generateAbcString(input, counterpoint) {
		var returnString = '';
		returnString += "X: 1\n";
		returnString += "M: C|\n";
		returnString += 'V: RH1 clef=treble name="Piano" \n';
		returnString += "V: LH1 clef=treble\n";
		returnString += "K: C\n";
		returnString += "%\n";
		returnString += "[V: RH1] "+input+"\n";
		returnString += "[V: LH1] "+counterpoint+"\n";	
		return returnString;
	}
	
	function checkInput(input) {
		//TODO: check if input is properly coded.
		if ((typeof input === 'string') && (input !== '')) {
			return true;
		} else {
			return false;
		}
	
	}

	var exports = function (obj, defaultInput) {
		obj = $(obj);
		
		if (obj.is('div')) {
			var inputDiv = $('<div>');
			var inputArea = $('<textarea>');
			var generateButton = $('<button>');
			var buttonDiv = $('<div>');
			
			var outputDiv = $('<div>');
			var outputArea = $('<textarea>');
			var scoreArea = $('<div>');
			var midiArea = $('<div>');
			
			//style the areas
			inputArea.addClass('input');
			outputArea.addClass('output');
			scoreArea.addClass('score');
			midiArea.addClass('midi');
			
			//hide the scoreArea and midiArea
			scoreArea.hide();
			midiArea.hide();
			
			inputDiv.addClass('input');
			outputDiv.addClass('output');
			buttonDiv.addClass('generate-button');
			scoreArea.addClass('score');
			
			
			
			
			//abcArea.hide();
			generateButton.text('Generate Counterpoint!');
			generateButton.click(function () {
				var input = '';
				if (checkInput(inputArea.val())) {
					input = inputArea.val();
				}
					
				var output = firstSpecies(input, outputArea);
				
				renderAbc(scoreArea[0], generateAbcString(input,output));
				renderMidi(midiArea[0], generateAbcString(input,output));
				
				scoreArea.show();
				midiArea.show();
				
			});
			
			if (typeof defaultInput === 'string') {
				inputArea.text(defaultInput);
			}
			
			inputDiv.append(inputArea);
			obj.append(inputDiv);
			outputDiv.append(outputArea);
			obj.append(outputDiv);
			buttonDiv.append(generateButton);
			obj.append(buttonDiv);
			obj.append(midiArea);
			obj.append(scoreArea);
			
		}
	}
	return exports;
})();