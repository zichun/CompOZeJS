CompOZeJS
=========

Introduction
------------
CompOZeJS is a project to assist students to learn counterpoint theory. Currently it is a tool to generate counter melodies using the rules of counterpoint theory. 

Counterpoint theory essentially aims to generate music that harmonizes with the main melody, but yet maintains an independent line (i.e. not be too similar)from the melody. Therefore, it can be modelled as a set of rules. Some of these include harmonic rules, such as "Augmented or diminished intervals between succeeding notes are not allowed", to the general aim of making the line as independent as possible (which can be approximately modelled by limiting the extent of both unisons and contrary motion. As from the examples above, it can be seen that we are able to model finite domain constraints after these rules. Therefore, CompOZeJS aims to use constraint programming as a technique to generate counterpoint melodies from the music. 

Currently CompOZeJS uses rules from first-species modal counterpoint theory. This is chosen as a start as this can be a framework that we can use to model other parts of counterpoint theory.

CompOZeJS is released under the [GPLv3](http://www.gnu.org/licenses/gpl.html). 

Usage
-----

1. Open trunk/firstspecies_fd.html in any modern browser (Chrome/IE9/Firefox 3.0)
2. Generate some of our pre-defined melodies/ type in your own!

Additional notes about the input:

* Notes are delimited by commas. 
* Append '#' to a note to add a sharp, 'b' to add a flat. 
* Append '^' to raise the note by an octave, 'v' to lower the note by an octave.


Dependencies
------------

- abcjs 	-- http://code.google.com/p/abcjs/ 
- fd.js 	-- http://nishabdam.com:8080/fd/index
- jQuery	-- http://jquery.com
- Search Tree Visualisation --  http://minhtule.github.com/Search-Tree-Visualization/

Acknowledgements
----------------

### Mentors

* Associate Professor Martin Henz
* Srikumar Subramanian
* Dr Eddy Chong


