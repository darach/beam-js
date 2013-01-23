var Beam = require('beam');

var source = Beam.Source();
var sink = Beam.Sink();

// Define custom filter
var even = Beam.Operator.filter(function(x) { return x % 2 == 0; });

// Define custom transform
var square = Beam.Operator.transform(function(x) { return x * x; });

// Declare pipe
source.pipe(even).pipe(square).pipe(sink);

// Hookup outputs
sink.on('data', function(data) { console.log('d:: ' + data); });

// Supply inputs
for (var i = 0; i <= 10; i++) source.push(i);

