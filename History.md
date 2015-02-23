
1.1.1 / 2015-02-23
==================

  * push the working ranges into a `ranges` array, and process them after the RangeIterator is complete
  * test: another multiple-block unwrap test
  * test: add a test case spaning across 2 P elements

1.1.0 / 2015-02-03
==================

  * package: update dependencies
  * package: allow any "zuul" v1
  * package: allow any "debug" v2
  * package: update "get-document" to v1
  * index: convert to using "range-iterator"

1.0.5 / 2014-12-09
==================

  * treat LI elements as block-level elements
  * index: add JSDoc comment for `doc` optional argument
  * index: adjust comment to have beginning and middle case examples
  * test: be consistent with the uppercasing of DOM element names in comments

1.0.4 / 2014-11-06
==================

  * test: use the "delete" command for collapsed range test

1.0.3 / 2014-11-06
==================

  * index: initial take a handling `collapsed` Ranges

1.0.2 / 2014-10-01
==================

  * index: use `range.toString()` to determine if the Range has "contents"
  * package: update "save-range" to v1.0.0
  * index: normalize() the sub-Ranges for each block

1.0.1 / 2014-10-01
==================

  * index: save and restore the Range state when re-wrapping left and right hand sides
  * index: use "range-extract-contents" module
  * package: update "zuul" to v1.11.0

1.0.0 / 2014-10-01
==================

  * add .gitignore file
  * refactor to use a block iterating approach
  * package: update "debug" to v2.0.0
  * bumping to v1.0.0 for better defined semver behavior

0.0.2 / 2014-09-10
==================

  * index: add TODO note
  * index: remove unnecessary "to-array" dependency
  * index: use "save-range" instead of "frozen-range"
  * index: beginnings of a refactor with all passing tests...
  * test: enable some more tests, add some Range assertions
  * test: clean up tests a bit
  * test: don't use HTML in the test names
  * index: remove dreadful `console.log()` calls

0.0.1 / 2014-09-09
==================

  * add README.md
  * enable Travis + SauceLabs testing
  * travis: fix SAUCE_ACCESS_KEY env variable
  * package: fix typo in "description" field
  * initial commit
