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

Beam.Source = require('./_beam_source.js');
Beam.Sink = require('./_beam_sink.js');
Beam.Operator = require('./_beam_operator.js');
Beam.Bifs = require('./_beam_bifs.js');
Beam.Meta = require('./_beam_meta.js');
Beam.Module = require('./_beam_module.js');

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

  if (arguments.length === 0) {
    throw new Error('Beam pipe MUST have at least one argument');
  }

  var data = arguments.length == 1 ? undefined : Array.prototype.slice.call(arguments, 1);
  pivot = Beam.prototype._pipe(this, arguments[0], data);

  return pivot;
}

Beam.prototype._pipe = function(prior,next,args) {
  var x = next.make();
  function ondata() { x.push(x.process(arguments[0])); }
  prior.on('data', ondata);
  function onerror(er) { cleanup(); }
  function cleanup() { prior.removeListener('data', ondata); }
  return x;
};

Beam.prototype.branch = function(source) {
  Beam.Meta.branch(this,source);
};

Beam.prototype._meta = function(prior, operator, spec) {
  var meta = new operator(spec);
  function ondata() { meta.push(arguments[0]); }
  prior.on('data', ondata);
  function onerror(er) { cleanup(); }
  function cleanup() { prior.removeListener('data', ondata); }
  return meta;
};

function extend(name, operator) {
  Beam.Operator.prototype[name] = 
    function(spec) { return Beam.prototype._meta(this, operator, spec); };
  Beam.Source.prototype[name] =
    function(spec) { return Beam.prototype._meta(this, operator, spec); };
};

Beam.extend = extend;
