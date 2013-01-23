var Beam = require('beam');

var source = Beam.Source();
var evens = Beam.Operator.filter(function(x) { return x % 2 == 0; });
var odds = Beam.Operator.filter(function(x) { return x % 2 == 1; });
var square = Beam.Operator.transform(function(x) { return x * x; });

var sink1 = Beam.Sink();
var sink2 = Beam.Sink();

function log(x,y) {  console.log(x + ': ' + y); };
sink1.on('data', function(data) { log('evens: ', data); });
sink2.on('data', function(data) { log('odds: ', data)});

// Branching 'just works'. The following algorithm essentially
// 'forks' a stream (evens down sink1, odds down sink2). It just
// works...
//
source.pipe(evens).pipe(sink1);
source.pipe(odds).pipe(sink2);

for (var i = 0; i <= 10; i++) source.push(i);


