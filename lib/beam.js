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

module.exports = Beam;

var events = require('events');
var util = require('util');

util.inherits(Beam, events.EventEmitter);

Beam.Source = require('_beam_source');
Beam.Sink = require('_beam_sink');
Beam.Operator = require('_beam_operator');

function Beam() {
  events.EventEmitter.call(this);
}

Beam.prototype.process = function(data) {
  return data;
}

Beam.prototype.pipe = function() {
  if (arguments.length === 0) 
    throw new Error('Bad pipe');

  var pivot = undefined;

  if (arguments.length === 1 && typeof arguments[0] === 'function')
    return Beam.prototype._pipe(this, Beam.Operator.wrap(arguments[0]));

  pivot = Beam.prototype._pipe(this,arguments[0]);
  if (arguments.length === 1) return pivot;

  throw new Error('Beam pipe MUST have 1 and exactly 1 operator as argument');
}

Beam.prototype._pipe = function(prior,next) {
  var x = next.make();

  function ondata(data) {
    x.push(x.process(data));
  }

  prior.on('data', ondata);

  function onerror(er) {
    cleanup();
  }

  function cleanup() {
    prior.removeListener('data', ondata);
  }

  return x;
};
