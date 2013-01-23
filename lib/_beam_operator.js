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

Operator.prototype.process = function(data) {
  throw new Error("Not implemented error. MUST be implemented by operators.");
}

Operator.prototype.make = function() {
  throw new Error("Not implemented error. MUST be implemented by operators.");
}

Operator.transform = function(fun) {
  return new FunOperator(fun);
}

Operator.filter = function(fun) {
  return new FilterOperator(fun);
}

function FunOperator(fun) {
  this.fun = fun;
}

util.inherits(FunOperator, Operator);

FunOperator.prototype.process = function(data) {
  return this.fun(data);
}

FunOperator.prototype.push = function(data) {
  this.emit('data', data);
}

FunOperator.prototype.make = function() {
  return new FunOperator(this.fun);
}

function FilterOperator(fun) {
  this.fun = fun;
}

util.inherits(FilterOperator, Operator);

FilterOperator.prototype.process = function(data) {
  return data;
}

FilterOperator.prototype.push = function(data) {
  if (this.fun(data)) {
    this.emit('data', data);
  }
}

FilterOperator.prototype.make = function(data) {
  return new FilterOperator(this.fun);
}
