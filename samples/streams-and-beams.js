var fs = require('fs');
var byline = require('byline');
var Beam = require('beam');

var file = 'LICENSE';

var words = [ 'the', 'warrant', 'use', 'whom', 'to' ];

// Create a line by line readable file stream
var stream = fs.createReadStream(file);
var stream = byline.createStream(stream);

// Store word counts
var counts = []; words.forEach(function(x) { counts.push(0); }); var beams = [];

// Create a match algorithm for each word
function createMatcher(beam, i, word) {
  var m = Beam.Operator.filter(function(data) { return data.toUpperCase().indexOf(word.toUpperCase()) >= 0; });
  var c = Beam.Operator.transform(function(data) { counts[i] = counts[i]+1; return counts[i]; });
  beam.pipe(m).pipe(c);
}

// Create a beam
var beam = Beam.Source();

// Create a branch for each match with an appropriate algorithm
for (var i in words) createMatcher(beam, i, words[i]);

// IO (streams) are relatively expensive. Compute (beams) are relatively cheap.
stream.on('data', function(line) {
  beam.push(line); // Tap the stream to the beam
});

console.log('Word\t\tN\n-----------------');
stream.on('end', function() { 
  // Stream ended. Beam should have updated our total counts. Report them
  for(i in words) console.log(words[i] + '\t\t' + counts[i]);
});


