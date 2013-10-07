var Beam = require('beam');
var b = Beam.Bifs;

var source = Beam.Source();
var square = Beam.Operator.transform(function(x) { return x * x; });

var sink1 = Beam.Sink();
var sink2 = Beam.Sink();

function log(x,y) {  console.log(x + ': ' + y); };
sink1.on('data', function(data) { log('evens: ', data); });
sink2.on('data', function(data) { log('odds: ', data)});

var mod2 = source.pipe(b.mod(2))
mod2.pipe(b.eq(0)).pipe(sink1);
mod2.pipe(b.eq(1)).pipe(sink2);

for (var i = 0; i <= 10; i++) source.push(i);


