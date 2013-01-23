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
