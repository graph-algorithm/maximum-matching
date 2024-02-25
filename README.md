:cherry_blossom: [@graph-algorithm/maximum-matching](https://graph-algorithm.github.io/maximum-matching)
==

Maximum matching algorithms for JavaScript.
Parent is [js-algorithms](https://github.com/make-github-pseudonymous-again/js-algorithms).
See [docs](https://graph-algorithm.github.io/maximum-matching/index.html).

```js
import {iter, weight as maximumMatching} from '@graph-algorithm/maximum-matching';
const edges = [[1, 2, 10], [2, 3, 11]] ;
const matching = maximumMatching(edges) ; // [-1, -1, 3, 2]
[...iter(matching)]; // [ [2, 3] ]

import {opt as maximumCardinalityMatching} from '@graph-algorithm/maximum-matching/cardinality/index.js';
for (const edge of iter(maximumCardinalityMatching([[1, 2], [2, 3], [3, 4]]))) {
	console.log(edge);
}
// [1,2]
// [3,4]
```

[![License](https://img.shields.io/github/license/graph-algorithm/maximum-matching.svg)](https://raw.githubusercontent.com/graph-algorithm/maximum-matching/main/LICENSE)
[![Version](https://img.shields.io/npm/v/@graph-algorithm/maximum-matching.svg)](https://www.npmjs.org/package/@graph-algorithm/maximum-matching)
[![Tests](https://img.shields.io/github/actions/workflow/status/graph-algorithm/maximum-matching/ci.yml?branch=main&event=push&label=tests)](https://github.com/graph-algorithm/maximum-matching/actions/workflows/ci.yml?query=branch:main)
[![Dependencies](https://img.shields.io/librariesio/github/graph-algorithm/maximum-matching.svg)](https://github.com/graph-algorithm/maximum-matching/network/dependencies)
[![GitHub issues](https://img.shields.io/github/issues/graph-algorithm/maximum-matching.svg)](https://github.com/graph-algorithm/maximum-matching/issues)
[![Downloads](https://img.shields.io/npm/dm/@graph-algorithm/maximum-matching.svg)](https://www.npmjs.org/package/@graph-algorithm/maximum-matching)

[![Code issues](https://img.shields.io/codeclimate/issues/graph-algorithm/maximum-matching.svg)](https://codeclimate.com/github/graph-algorithm/maximum-matching/issues)
[![Code maintainability](https://img.shields.io/codeclimate/maintainability/graph-algorithm/maximum-matching.svg)](https://codeclimate.com/github/graph-algorithm/maximum-matching/trends/churn)
[![Code coverage (cov)](https://img.shields.io/codecov/c/gh/graph-algorithm/maximum-matching/main.svg)](https://codecov.io/gh/graph-algorithm/maximum-matching)
[![Code technical debt](https://img.shields.io/codeclimate/tech-debt/graph-algorithm/maximum-matching.svg)](https://codeclimate.com/github/graph-algorithm/maximum-matching/trends/technical_debt)
[![Documentation](https://graph-algorithm.github.io/maximum-matching/badge.svg)](https://graph-algorithm.github.io/maximum-matching/source.html)
[![Package size](https://img.shields.io/bundlephobia/minzip/@graph-algorithm/maximum-matching)](https://bundlephobia.com/result?p=@graph-algorithm/maximum-matching)

## :clap: Credits

The implementation of Edmond's *blossom* algorithm is adapted from
[Joris van Rantwijk](http://jorisvr.nl)'s python
[implementation](http://jorisvr.nl/article/maximum-matching)
([python source](http://jorisvr.nl/files/graphmatching/20130407/mwmatching.py)).
All credit for the implementation goes to him and others that helped him.

Another adaptation by [Matt Krick](https://github.com/mattkrick)
distributed under the MIT license
is available [here](https://github.com/mattkrick/EdmondsBlossom).
