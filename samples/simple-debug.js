var Beam = require('beam');

var source = Beam.Source();
var even = Beam.Operator.filter(function(x) { return x % 2 == 0; });
var square = Beam.Operator.transform(function(x) { return x * x; });
var sink = Beam.Sink();

function debug(x,y) { console.log('debug(' + x + '): ' + y); };
function log(x,y) {  console.log(x + ': ' + y); };

// Just plug into a data event to debug/log/trace ... Sources, Sinks, Operators
source.on('data', function(data) { debug('source', data); });
even.on('data', function(data) { debug('even', data); });
square.on('data', function(data) { debug('square', data); });
sink.on('data', function(data) { log('sink', data); });

source.pipe(even).pipe(square).pipe(sink);

for (var i = 0; i <= 10; i++) source.push(i);


