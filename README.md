# **beam.js**

> Streams and pipes for analytic or computational events

## Status

Experimental.

## Overview

Node.js **streams** and pipes are a wonderful UNIX streams like abstraction oriented
for fast IO transformations.  This allows IO events to be composed and for
transformations to be modularised and reused easily.

However, stream operations are defined in terms of chunks of data and buffers. This is
great for IO. But not for data already resident in process and in memory. Beams are like
streams, in that they support pipes but are lightweight and work with in memory types
without buffering, copying, parsing.

## Differences from Streams

* Sources are where events are pushed into a beam
* Sinks are named terminals
* Operators are sources and sinks, but they also transform or filter events/data
* Beams are synchronous, and event pushed into a source executes until completion
* Events are executed in order in a beam
* An event that hits a filter that doesn't match gets dropped
* Beams can be branched
* Beams can be unioned

## Builtin functions

For numeric, logical and bitwise operations a set of builtin transformation and filter
functions are provided.

## Meta beams

Beams operators can be built with beam algorithms. This allows algorithms to be composed
of building blocks that are at the right level of abstraction for the task at hand. Pipes
are fine for most things. But, for example, it may be a requirement to iterate over things
and execute an algorithm for each thing being iterated, then a completion event when done.
This would be cumbersome and error prone to define repeatedly in a complex algorithm. It is
very easy to define as an extension of beam.

## Futures

Beam will be the primary flow component of eep-js, a sister project
