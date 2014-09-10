
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
var saveRange = require('save-range');
var normalize = require('range-normalize');
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

  // check common ancestor container for `nodeName`
  var node = closest(range.commonAncestorContainer, nodeName, true, root);
  if (node) {
    debug('found %o common ancestor element: %o', nodeName, node);

    info = saveRange.save(range, doc);

    var outer = unwrapNode(node, null, doc);
    // TODO: re-wrap left/right hand sides, when necessary

    range = saveRange.load(info, range.commonAncestorContainer);
  }

  info = saveRange.save(range, doc);

  // check inner nodes
  var fragment = range.extractContents();
  var nodes = query.all(nodeName, fragment);
  debug('%o %o elements to "unwrap"', nodes.length, nodeName);
  for (var i = 0; i < nodes.length; i++) {
    unwrapNode(nodes[i], null, doc);
  }
  insertNode(range, fragment);
  fragment = null;

  range = saveRange.load(info, range.commonAncestorContainer);

  normalize(range);
}
