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

    var square = Beam.Operator.transform(function() { var data = arguments[0]; return data * data; });
    var odd = Beam.Operator.filter(function() { var data = arguments[0]; return (data % 2 == 1); });
    var even = Beam.Operator.filter(function() { var data = arguments[0]; return (data % 2 == 0); });

    // Define a source
    var a = Beam.Source();

    // Define a sink
    var z = Beam.Sink();

    // Append results from the beam into an array
    z.on('data', function() { r.push(arguments[0]); });

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
    var square = Beam.Operator.transform(function() { var data = arguments[0]; return data * data; });
    var odd = Beam.Operator.filter(function() { var data = arguments[0]; return (data % 2 == 1); });
    var even = Beam.Operator.filter(function() { var data = arguments[0]; return (data % 2 == 0); });

    var b1 = Beam.Source(); var b2 = Beam.Source();
    var s1 = Beam.Sink(); var s2 = Beam.Sink(); var s3 = Beam.Sink();
    var r1 = []; var r2 = []; var r3 = [];

    b1.pipe(square).pipe(s1).on('data', function() { r1.push(arguments[0]); }); 
    b2.pipe(square).pipe(s2).on('data', function() { r2.push(arguments[0]); });
    square.on('data', function() { r3.push(arguments[0]); });

    b1.push(1); assert.same([1], r1); assert.same([], r2); assert.same([], r3);
    b2.push(2); assert.same([1], r1); assert.same([4], r2); assert.same([], r3);

    assert.done();
  },
 'beam branch': function(assert) {
    var s = Beam.Source(); var b1 = 0; var b2 = 0;
    var s_b1 = s.pipe(Beam.Source()).on('data', function(data) { b1++; });
    var s_b2 = s.pipe(Beam.Source()).on('data', function(data) { b2++; });

    assert.equals(0, b1); assert.equals(0, b2);
    s.push(1, "beep", "boop");
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
  },
  'beam builtin functions': function(assert) {
    var b = Beam.Bifs; var r = [];
    var f = function(testee, x) { 
      var r = undefined;
      var i = Beam.Source();
      var o = Beam.Sink();
      i.pipe(testee).pipe(o).on('data',function() { r = arguments[0]; });
      i.push(x);
      return r;
    };

    // arithmetic
    assert.equals(2, f(b.plus(1), 1));
    assert.equals(3, f(b.minus(2), 5));
    assert.equals(9, f(b.mult(3), 3));
    assert.equals(3, f(b.div(3), 9));
    assert.equals(0, f(b.mod(5), 10));
    assert.equals(2, f(b.inc(), 1));
    assert.equals(1, f(b.dec(), 2));
    assert.equals(-1, f(b.neg(),1));
    assert.equals(true, f(b.not(),false));
    
    // comparison
    var dropped = undefined; // non-matched events get 'dropped' => no result => undefined
    assert.equals(1, f(b.lt(2), 1));
    assert.equals(dropped, f(b.lt(2), 2));
    assert.equals(1, f(b.lte(2), 1));
    assert.equals(2, f(b.lte(2), 2));
    assert.equals(dropped, f(b.lte(2), 3));
    assert.equals(2, f(b.eq(2), 2));
    assert.equals(dropped, f(b.eq(2), undefined));
    assert.equals(2, f(b.seq(2), 2.0)); // not that strict it would seem ... :/
    assert.equals(dropped, f(b.seq(2), "2.0"));
    assert.equals(dropped, f(b.seq(2), undefined));
    assert.equals(2, f(b.ne(3), 2));
    assert.equals(dropped, f(b.ne(2), 2));
    assert.equals(2, f(b.gt(1), 2));
    assert.equals(dropped, f(b.gt(2), 2));
    assert.equals(2, f(b.gte(1), 2));
    assert.equals(1, f(b.gte(1), 1));
    assert.equals(dropped, f(b.gte(3), 2));

    // logical
    assert.equals(0x00, f(b.band(0xF0), 0x0F));
    assert.equals(0xF0, f(b.band(0xF0), 0xFF));
    assert.equals(0xFF, f(b.bor(0xF0), 0x0F));
    assert.equals(0xFF, f(b.bxor(0xAA), 0x55));
    assert.equals(-1, f(b.bnot(), 0x00));
    assert.equals(-256, f(b.bnot(), 0xFF));
    assert.equals(0xF0, f(b.bls(4), 0x0F));
    assert.equals(0x00, f(b.brs(4), 0x0F));
    for (var i = 0; i < 32; i++) assert.equals(-1, f(b.brs(i), -1));
    assert.equals(0x00FFFFFF, f(b.bzrs(8), -1));
    assert.equals(0x0000FFFF, f(b.bzrs(16), -1));
    assert.equals(0x000000FF, f(b.bzrs(24), -1));
    assert.equals(0xFFFFFFFF, f(b.bzrs(32), -1));

    // expression
    var t = function(x) { return x == true; }
    var x = function(x) { return x == false; }
    // 'dropped' used here has same significance as above
    assert.equals(true, f(b.and(t,t),true));
    assert.equals(dropped, f(b.and(t,x),true));
    assert.equals(dropped, f(b.and(x,t),true));
    assert.equals(dropped, f(b.and(x,x),true));
    assert.equals(true, f(b.or(t,t),true));
    assert.equals(true, f(b.or(t,x),true));
    assert.equals(true, f(b.or(x,t),true));
    assert.equals(dropped, f(b.or(x,x),true));


    assert.done();
  },
});
