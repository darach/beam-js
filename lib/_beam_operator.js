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

module.exports = Operator;

var util = require('util');
var Beam = require('beam');
var Source = Beam.Source;

util.inherits(Operator, Source);

Object.keys(Source.prototype).forEach(function(method) {
  if (!Operator.prototype[method])
    Operator.prototype[method] = Source.prototype[method];
})

Object.keys(Beam.prototype).forEach(function(method) {
  if (!Operator.prototype[method])
    Operator.prototype[method] = Beam.prototype[method];
});

function Operator() {
  if (!(this instanceof Operator))
    return new Operator();
  Operator.call(this);
}

Operator.prototype.process = function() {
  throw new Error("Not implemented error. MUST be implemented by operators.");
}

Operator.prototype.make = function() {
  throw new Error("Not implemented error. MUST be implemented by operators.");
}

Operator.transform = function(fun) {
  if (arguments.length === 0) {
    throw new Error('Beam Operator transform MUST have at least one argument');
  }
  var spec = arguments.length == 1 ? undefined : Array.prototype.slice.call(arguments, 1);
  return new FunOperator(fun,spec);
}

Operator.filter = function(fun) {
  if (arguments.length === 0) {
    throw new Error('Beam Operator filter MUST have at least one argument');
  }
  var spec = arguments.length == 1 ? undefined : Array.prototype.slice.call(arguments, 1);
  return new FilterOperator(fun,spec);
}

function FunOperator(fun,spec) {
  this.fun = fun; this.spec = spec;
}

util.inherits(FunOperator, Operator);

FunOperator.prototype.process = function() {
  return this.fun(arguments[0][0]);
}

FunOperator.prototype.push = function() {
  this.emit('data', arguments);
}

FunOperator.prototype.make = function() {
  return new FunOperator(this.fun,Array.prototype.slice.call(arguments));
}

function FilterOperator(fun,spec) {
  this.fun = fun; this.spec = spec;
}

util.inherits(FilterOperator, Operator);

FilterOperator.prototype.process = function() {
  return arguments;
}

FilterOperator.prototype.push = function() {
  var result = this.fun(arguments[0][0][0]);
  if (result) {
    this.emit('data', arguments[0][0]);
  }
}

FilterOperator.prototype.make = function() {
  return new FilterOperator(this.fun,Array.prototype.slice.call(arguments));
}
