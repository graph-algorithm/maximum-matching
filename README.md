:cherry_blossom: [@aureooms/js-maximum-matching](https://make-github-pseudonymous-again.github.io/js-maximum-matching)
==

Maximum matching algorithms for JavaScript.
Parent is [@aureooms/js-gn](https://github.com/aureooms/js-gn).
See [docs](https://make-github-pseudonymous-again.github.io/js-maximum-matching/index.html).

```js
import maximumMatching, {iter} from '@aureooms/js-maximum-matching';
const edges = [[1, 2, 10], [2, 3, 11]] ;
const matching = maximumMatching(edges) ; // [-1, -1, 3, 2]
[...iter(matching)]; // [ [2, 3] ]

import maximumCardinalityMatching from '@aureooms/js-maximum-matching/cardinality';
for (const edge of iter(maximumCardinalityMatching([[1, 2], [2, 3], [3, 4]]))) {
	console.log(edge);
}
// [1,2]
// [3,4]
```

[![License](https://img.shields.io/github/license/aureooms/js-maximum-matching.svg)](https://raw.githubusercontent.com/aureooms/js-maximum-matching/main/LICENSE)
[![Version](https://img.shields.io/npm/v/@aureooms/js-maximum-matching.svg)](https://www.npmjs.org/package/@aureooms/js-maximum-matching)
[![Tests](https://img.shields.io/github/workflow/status/aureooms/js-maximum-matching/ci:test?event=push&label=tests)](https://github.com/aureooms/js-maximum-matching/actions/workflows/ci:test.yml?query=branch:main)
[![Dependencies](https://img.shields.io/david/aureooms/js-maximum-matching.svg)](https://david-dm.org/aureooms/js-maximum-matching)
[![Dev dependencies](https://img.shields.io/david/dev/aureooms/js-maximum-matching.svg)](https://david-dm.org/aureooms/js-maximum-matching?type=dev)
[![GitHub issues](https://img.shields.io/github/issues/aureooms/js-maximum-matching.svg)](https://github.com/aureooms/js-maximum-matching/issues)
[![Downloads](https://img.shields.io/npm/dm/@aureooms/js-maximum-matching.svg)](https://www.npmjs.org/package/@aureooms/js-maximum-matching)

[![Code issues](https://img.shields.io/codeclimate/issues/aureooms/js-maximum-matching.svg)](https://codeclimate.com/github/aureooms/js-maximum-matching/issues)
[![Code maintainability](https://img.shields.io/codeclimate/maintainability/aureooms/js-maximum-matching.svg)](https://codeclimate.com/github/aureooms/js-maximum-matching/trends/churn)
[![Code coverage (cov)](https://img.shields.io/codecov/c/gh/aureooms/js-maximum-matching/main.svg)](https://codecov.io/gh/aureooms/js-maximum-matching)
[![Code technical debt](https://img.shields.io/codeclimate/tech-debt/aureooms/js-maximum-matching.svg)](https://codeclimate.com/github/aureooms/js-maximum-matching/trends/technical_debt)
[![Documentation](https://make-github-pseudonymous-again.github.io/js-maximum-matching/badge.svg)](https://make-github-pseudonymous-again.github.io/js-maximum-matching/source.html)
[![Package size](https://img.shields.io/bundlephobia/minzip/@aureooms/js-maximum-matching)](https://bundlephobia.com/result?p=@aureooms/js-maximum-matching)

## :clap: Credits

The implementation of Edmond's *blossom* algorithm is adapted from
[Joris van Rantwijk](http://jorisvr.nl)'s python
[implementation](http://jorisvr.nl/article/maximum-matching)
([python source](http://jorisvr.nl/files/graphmatching/20130407/mwmatching.py)).
All credit for the implementation goes to him and others that helped him.

Another adaptation by [Matt Krick](https://github.com/mattkrick)
distributed under the MIT license
is available [here](https://github.com/mattkrick/EdmondsBlossom).
