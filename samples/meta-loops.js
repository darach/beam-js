// Copyright (c) 2013 Darach Ennis < darach at gmail dot com >.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var util = require('util');
var events = require('events');
var Beam = require('beam');

// Defines a sample module that that supports declarative looping semantics.
// This module uses the 'extend' and 'branch' functions to meta extend beam
// with support for user defined looping constructs.
//
// In a nuthsell a module is a beam operator implemented in terms of beam
// itself. As the facility is turing complete, (but only allows structured
// goto) via the 'branch(label)' operation hopefully the world won't melt.
//
function Loop(spec) {
  Beam.Module.call(this);
  var self = this;  

  var source = Beam.Source();

  // flow outputs
  var results = Beam.Sink();
  var uber = Beam.Sink();
  var once = Beam.Sink();
  var done = Beam.Sink();

  // spec - eg: { from: 0, to: 10, minInclusive: false, maxInclusive: true, stride: 1 }
  var from = spec.from || 0;
  var to = spec.to || 0;
  var minInclusive = spec.minInclusive ; 
  var maxInclusive = spec.maxInclusive ;
  var stride = spec.stride || 1;

  // conditions
  var initial = Beam.Operator.filter(function() { 
    var x = arguments[0]; return minInclusive ? (x >= from) : (x > from); 
  });
  var nonterminal = Beam.Operator.filter(function() { 
    var x = arguments[0]; return maxInclusive ? (x <= to) : ( x < to); 
  });
  var terminal = Beam.Operator.filter(function() { 
    var x = arguments[0]; return maxInclusive ? x > to : x > to - 1;
  });
  var accum = Beam.Operator.transform(function() { return arguments[0] + stride; });

  // state
  var state = undefined;

  self.inbound.on('data', function() {
    context = arguments[0][0][0];
    source.push(from);
  });

  // algorithm
  source.pipe(initial).pipe(once);
  source.pipe(nonterminal).pipe(initial).pipe(results);
  source.pipe(accum).pipe(nonterminal).pipe(uber).branch(source); // goto source!
  source.pipe(accum).pipe(terminal).pipe(done);

  done.on('data', function() { 
    self.emit('data', state, context); 
    state = undefined;
    context = undefined;
  });

  // Outputs
  results.on('data', function() { 
    var iter = arguments[0];
    self.emit('each', iter, context, state, function(newState) { state = newState; });
  });
}
util.inherits(Loop, Beam.Module);

//
// usage
//

var i = Beam.Source();
var o = Beam.Sink();

Beam.extend("loop", Loop);

var withEach = function(iter, context, state, done) {
//  console.log('DEBUG: iter: ' + iter);
//  console.log('DEBUG: context: ' + JSON.stringify(context));
//  console.log('DEBUG: state: ' + state);
  done((state == undefined) ? ("" + iter + " ") :  state + " " +  iter + " ");
};

var spec0 = {from: 0, to: 10, minInclusive: true, maxInclusive: true, stride: 1};
var loop0 = i.loop(spec0);
loop0.on('each', withEach);
loop0.on('data', function() { console.log('loop0: ' + arguments[0]); });


var spec1 = {from: 0, to: 10, minInclusive: false, maxInclusive: false, stride: 1};
var loop1 = i.loop(spec1);
loop1.on('each', withEach);
loop1.on('data', function() { console.log('loop1: ' + arguments[0]); });

var spec2 = {from: 0, to: 10, minInclusive: false, maxInclusive: true, stride: 2};
var loop2 = i.loop(spec2);
loop2.on('each', withEach);
loop2.on('data', function() { console.log('loop2: ' + arguments[0]); });

var spec3 = {from: 0, to: 10, minInclusive: true, maxInclusive: true, stride: 3};
var loop3 = i.loop(spec3);
loop3.on('each', withEach);
loop3.on('data', function() { console.log('loop2: ' + arguments[0]); });

loop0.pipe(o);
loop1.pipe(o);
loop2.pipe(o);
loop3.pipe(o);

o.on('data', function() { console.log(""); });

console.log("Loopy loops:\n============\n");
i.push("beep, boop!");
