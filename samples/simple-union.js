var Beam = require('beam');

var source = Beam.Source();
var union = Beam.Sink();

var evens = Beam.Operator.filter(function(x) { return x % 2 == 0; });
var odds = Beam.Operator.filter(function(x) { return x % 2 == 1; });
var square = Beam.Operator.transform(function(x) { return x * x; });

source.pipe(evens).pipe(square).pipe(union);
source.pipe(odds).pipe(square).pipe(union);

// Hookup outputs
union.on('data', function(data) { console.log('union: ' + data); });

// Supply inputs
for (var i = 0; i <= 3; i++) source.push(i);
