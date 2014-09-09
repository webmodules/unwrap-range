
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
var toArray = require('to-array');
var FrozenRange = require('frozen-range');
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
  var fr;
  var index;
  if (!doc) doc = getDocument(range) || document;

  // check common ancestor container for `nodeName`
  var node = closest(range.commonAncestorContainer, nodeName, true, root);
  if (node) {
    debug('found %o common ancestor element: %o', nodeName, node);

    fr = new FrozenRange(range, node);

    var parent = node.parentNode;
    index = toArray(parent.childNodes).indexOf(node);

    var outer = unwrapNode(node, parent, doc);

    // a little bit hacky (but not really) but we need to replace the top-most
    // element's childNode offsets since we're unwrapping the Node into another
    // node which may or may not have other elements before/after this one.
    fr.startPath[0] = index;
    fr.endPath[0] = index;

    fr.thaw(parent, range);
  }

  var common = range.commonAncestorContainer;
  index = toArray(common.parentNode.childNodes).indexOf(common);
  fr = new FrozenRange(range, common);

  // check inner nodes
  var fragment = range.extractContents();
  var nodes = query.all(nodeName, fragment);
  debug('%o %o elements to "unwrap"', nodes.length, nodeName);
  if (nodes.length) {
    for (var i = 0; i < nodes.length; i++) {
      unwrapNode(nodes[i], null, doc);
    }
    insertNode(range, fragment);
  } else {
    insertNode(range, fragment);

    fr.startPath.push(index);
    fr.endPath.push(index);

    fr.thaw(range.commonAncestorContainer, range);
  }
  fragment = null;
}
