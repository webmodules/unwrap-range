
/**
 * Module dependencies.
 */

var getDocument = require('get-document');
var unwrapNode = require('unwrap-node');
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

  console.log(range.startContainer, range.startOffset);
  console.log(range.endContainer, range.endOffset);

  // check common ancestor container for `nodeName`
  var node = closest(range.commonAncestorContainer, nodeName, true, root);
  if (node) {
    debug('found %o common ancestor element: %o', nodeName, node);
    var outer = unwrapNode(node, null, doc);


  }

  // check inner nodes
  var fragment = range.extractContents();
  var nodes = query.all(nodeName, fragment);
  debug('%o %o elements to "unwrap"', nodes.length, nodeName);
  for (var i = 0; i < nodes.length; i++) {
    unwrapNode(nodes[i], null, doc);
  }
  range.insertNode(fragment);
  range.selectNodeContents(fragment);
  fragment = null;
}
