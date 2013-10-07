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

module.exports = Bifs;

var util = require('util');
var Beam = require('beam');

function Bifs() { };

Bifs.plus = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x + n; });
};

Bifs.minus = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x - n; });
};

Bifs.mult = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x * n; });
};

Bifs.div = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x / n; });
};

Bifs.mod = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x % n; });
};

Bifs.inc = function() {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x+1; });
};

Bifs.dec = function() {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x-1; });
};

Bifs.neg = function() {
  return Beam.Operator.transform(function() { var x = arguments[0]; return -x; });
};

Bifs.not = function() {
  return Beam.Operator.transform(function() { var x = arguments[0]; return !x; });
};

Bifs.lt = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x < n; });
};

Bifs.lte = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x <= n; });
};

Bifs.eq = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x == n; });
};

Bifs.seq = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x === n; });
};

Bifs.ne = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x != n; });
};

Bifs.gt = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x > n; });
};

Bifs.gte = function(n) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return x >= n; });
};

Bifs.band = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x & n; });
};

Bifs.bor = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x | n; });
};

Bifs.bxor = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x ^ n; });
};

Bifs.bnot = function() {
  return Beam.Operator.transform(function() { var x = arguments[0]; return ~x ; });
};

Bifs.bls = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x << n; });
};

Bifs.brs = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x >> n; });
};

Bifs.bzrs = function(n) {
  return Beam.Operator.transform(function() { var x = arguments[0]; return x >>> n; });
};

Bifs.and = function(expr1,expr2) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return expr1(x) && expr2(x); });
};

Bifs.or = function(expr1,expr2) {
  return Beam.Operator.filter(function() { var x = arguments[0]; return expr1(x) || expr2(x); });
};
