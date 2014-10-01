
/**
 * Module dependencies.
 */

var contains = require('node-contains');
var getDocument = require('get-document');
var unwrapNode = require('unwrap-node');
var insertNode = require('range-insert-node');
var wrapRange = require('wrap-range');
var closest = require('component-closest');
var query = require('component-query');
var saveRange = require('save-range');
var domIterator = require('dom-iterator');
var normalize = require('range-normalize');
var blockSel = require('block-elements').join(', ');
var debug = require('debug')('unwrap-range');

/**
 * Module exports.
 */

module.exports = unwrap;

/**
 * Removes any `nodeName` DOM elements from within the given `range` boundaries.
 *
 * @param {Range} range - DOM range to "unwrap"
 * @param {String} nodeName - Selector to use to determine which nodes to "unwrap"
 * @param {Element} [root] - Optional `root` DOM element to stop traversing the parents for
 * @public
 */

function unwrap (range, nodeName, root, doc) {
  var info;
  if (!doc) doc = getDocument(range) || document;

  var info;
  var next = range.startContainer;
  var end = range.endContainer;
  var iterator = domIterator(next).revisit(false);
  var originalRange = range.cloneRange();
  var workingRange = range.cloneRange();
  var prevBlock;

  function doRange () {
    debug('doRange() %s', workingRange.toString());

    var node = closest(workingRange.commonAncestorContainer, nodeName, true, root);
    if (node) {
      debug('found %o common ancestor element: %o', nodeName, node);

      info = saveRange.save(range, doc);

      var outer = unwrapNode(node, null, doc);

      range = saveRange.load(info, range.commonAncestorContainer);

      // now re-wrap left-hand side, if necessary
      var left = outer.cloneRange();
      left.setEnd(range.startContainer, range.startOffset);
      if (!left.collapsed) {
        debug('re-wrapping left-hand side with new %o node', nodeName);
        wrapRange(left, nodeName, doc);
      }

      // now re-wrap right-hand side, if necessary
      var right = outer.cloneRange();
      right.setStart(range.endContainer, range.endOffset);
      if (!right.collapsed) {
        debug('re-wrapping right-hand side with new %o node', nodeName);
        wrapRange(right, nodeName, doc);
      }
    }

    info = saveRange.save(range, doc);

    var fragment = workingRange.extractContents();
    var nodes = query.all(nodeName, fragment);

    debug('%o %o elements to "unwrap"', nodes.length, nodeName);
    for (var i = 0; i < nodes.length; i++) {
      unwrapNode(nodes[i], null, doc);
    }
    insertNode(workingRange, fragment);

    range = saveRange.load(info, range.commonAncestorContainer);
  }

  while (next) {
    var block = closest(next, blockSel, true);

    if (prevBlock && prevBlock !== block) {
      debug('found block boundary point for %o!', prevBlock);
      workingRange.setEndAfter(prevBlock);

      doRange();

      // now we clone the original range again, since it has the
      // "end boundary" set up the way to need it still. But reset the
      // "start boundary" to point to the beginning of this new block
      workingRange = originalRange.cloneRange();
      workingRange.setStartBefore(block);
    }

    prevBlock = block;
    if (contains(end, next)) break;
    next = iterator.next(3 /* Node.TEXT_NODE */);
  }

  doRange();

  normalize(range);
}
