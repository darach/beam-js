var Beam = require("beam");
var events = require('events');
var testCase = require('nodeunit').testCase;

exports.read = testCase({
  setUp: function(cb) {
    this._openStdin = process.openStdin;
    this._log = console.log;
    this._exit = process.exit;

    var ev = this.ev = new events.EventEmitter();
    process.openStdin = function() { return er; }

    cb();
  },
  tearDown: function(cb) {
    process.openStdin = this._openStdin;
    process.exit = this._exit;
    console.log = this._log;

    cb();
  },
  'beam usage': function(assert) {
    var r = [];

    var square = Beam.Operator.transform(function(data) { return data * data; });
    var odd = Beam.Operator.filter(function(data) { return (data % 2 == 1); });
    var even = Beam.Operator.filter(function(data) { return (data % 2 == 0); });

    // Define a source
    var a = Beam.Source();

    // Define a sink
    var z = Beam.Sink();

    // Append results from the beam into an array
    z.on('data', function(data) { r.push(data); });

    // Define a trivial analytic pipeline
    a.pipe(square).pipe(z);

    // This beam will calculate the square of any input
    [1, 2, 3, 4, 5].forEach(function(x) { a.push(x); });
    assert.same([1,4,9,16,25],r);

    // This beam will pass through even input only
    r = [];
    var a = Beam.Source(); a.pipe(even).pipe(z);
    [1, 2, 3, 4, 5].forEach(function(x) { a.push(x); });
    assert.same([2,4],r);

    // This beam will pass through odd input only
    r = [];
    var a = Beam.Source(); a.pipe(odd).pipe(z);
    [1, 2, 3, 4, 5].forEach(function(x) { a.push(x); });
    assert.same([1,3,5],r);

    // Just like with streams, you can chain beams with pipes
    r = []; 
    var a = new Beam.Source();
    a.pipe(square).pipe(odd).pipe(z);
    [1, 2, 3, 4, 5].forEach(function(x) { a.push(x); });
    assert.same([1, 9, 25],r); // Every alternate square is odd
    r = []; 
    var a = new Beam.Source(); a.pipe(square).pipe(even).pipe(z);
    [1, 2, 3, 4, 5].forEach(function(x) { a.push(x); });
    assert.same([4,16],r);

    assert.done();
  },
 'beam separates definition from usage': function(assert) {
    var square = Beam.Operator.transform(function(data) { return data * data; });
    var odd = Beam.Operator.filter(function(data) { return (data % 2 == 1); });
    var even = Beam.Operator.filter(function(data) { return (data % 2 == 0); });

    var b1 = Beam.Source(); var b2 = Beam.Source();

    var r1 = []; var r2 = []; var r3 = [];

    b1.pipe(square).on('data', function(data) { r1.push(data); }); 
    b2.pipe(square).on('data', function(data) { r2.push(data); });
    square.on('data', function(data) { r3.push(data); });

    b1.push(1); assert.same([1], r1); assert.same([], r2); assert.same([], r3);
    b2.push(2); assert.same([1], r1); assert.same([4], r2); assert.same([], r3);

    assert.done();
  },
 'beam branch': function(assert) {
    var s = Beam.Source(); var b1 = 0; var b2 = 0;
    var s_b1 = s.pipe(Beam.Source()).on('data', function(data) { b1++; });
    var s_b2 = s.pipe(Beam.Source()).on('data', function(data) { b2++; });

    assert.equals(0, b1); assert.equals(0, b2);
    s.push(1);
    assert.equals(1, b1); assert.equals(1, b1);
   
    assert.done(); 
  },
 'beam combine': function(assert) {
    var s1 = Beam.Source(); var s2 = Beam.Source(); var d = [];
    var union = Beam.Sink().on('data', function(data) { d.push(data); });

    s1.pipe(union);
    s2.pipe(union);

    assert.same([], d);
    s1.push(1); assert.same([1], d);
    s2.push(2); assert.same([1,2], d);

    assert.done();
  } 
});
