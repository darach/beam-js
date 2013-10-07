var Beam = require('beam');

var source = Beam.Source();
var even = Beam.Operator.filter(function(x) { return x % 2 == 0; });
var square = Beam.Operator.transform(function(x) { return x * x; });
var sink = Beam.Sink();

function debug(x,y) { console.log('debug(' + x + '): ' + y); };
function log(x,y) {  console.log(x + ': ' + y); };

// Just plug into a data event to debug/log/trace ... Sources, Sinks, Operators
source.on('data', function() { debug('source', JSON.stringify(arguments)); });
even.on('data', function() { debug('even', JSON.stringify(arguments)); });
square.on('data', function() { debug('square', JSON.stringify(arguments)); });
sink.on('data', function() { log('sink', JSON.stringify(arguments)); });

source.pipe(even).pipe(square).pipe(sink);

for (var i = 0; i <= 10; i++) source.push(i);


