
/**
 * Module dependencies.
 */

var findWithin = require('find-within');
var getDocument = require('get-document');
var unwrapNode = require('unwrap-node');
var insertNode = require('range-insert-node');
var wrapRange = require('wrap-range');
var closest = require('component-closest');
var query = require('component-query');
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
  if (!doc) doc = getDocument(range) || document;

  var startLeft = findWithin(range.startContainer, Node.TEXT_NODE, true);
  var startLeftOffset = range.startContainer.nodeType === Node.TEXT_NODE ? range.startOffset : 0;
  var startRight = findWithin(range.endContainer, Node.TEXT_NODE, false);
  var startRightOffset = range.startContainer.nodeType === Node.TEXT_NODE ? range.endOffset : startRight.nodeValue.length;

  console.log('startLeft', range.startContainer, range.startOffset, startLeft, startLeftOffset);
  console.log('startRight', range.endContainer, range.endOffset, startRight, startRightOffset);

  // check common ancestor container for `nodeName`
  var node = closest(range.commonAncestorContainer, nodeName, true, root);
  if (node) {
    debug('found %o common ancestor element: %o', nodeName, node);

    var outer = unwrapNode(node, null, doc);
    var r = doc.createRange();

    var left = findWithin(outer.startContainer, Node.TEXT_NODE, true);
    var leftOffset = outer.startContainer.nodeType === Node.TEXT_NODE ? outer.startOffset : 0;

    console.error('left:', left, leftOffset);

    if (left !== startLeft || leftOffset !== startLeftOffset) {
      debug('need to re-wrap left-hand side');
      r.setStart(left, leftOffset);
      r.setEnd(startLeft, startLeftOffset);
      var l = wrapRange(r, nodeName);
      console.error('l:', l);
    }

    var right = findWithin(outer.endContainer, Node.TEXT_NODE, false);
    var rightOffset = outer.endContainer.nodeType === Node.TEXT_NODE ? outer.endOffset : right.nodeValue.length;

    console.error('right:', right, rightOffset);

    if (right !== startRight || rightOffset !== startRightOffset) {
      debug('need to re-wrap right-hand side');
      console.log('start right value', right.nodeValue, findWithin(outer.endContainer, Node.TEXT_NODE, false));
      r.setStart(startRight, startRightOffset);
      r.setEnd(right, rightOffset);
      var ri = wrapRange(r, nodeName);
      console.error('ri:', ri);
    }
  }

  // check inner nodes
  var fragment = range.extractContents();
  var nodes = query.all(nodeName, fragment);
  debug('%o %o elements to "unwrap"', nodes.length, nodeName);
  for (var i = 0; i < nodes.length; i++) {
    unwrapNode(nodes[i], null, doc);
  }
  insertNode(range, fragment);
  range.selectNodeContents(fragment);
  fragment = null;
}
