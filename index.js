
/**
 * Module dependencies.
 */

var contains = require('node-contains');
var getDocument = require('get-document');
var unwrapNode = require('unwrap-node');
var extractContents = require('range-extract-contents');
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
 * @param {Document} [doc] - Optional `Document` instance to use
 * @public
 */

function unwrap (range, nodeName, root, doc) {
  if (!doc) doc = getDocument(range) || document;

  var info, node, prevBlock;
  var next = range.startContainer;
  var end = range.endContainer;
  var iterator = domIterator(next).revisit(false);
  var originalRange = range.cloneRange();
  var workingRange = range.cloneRange();

  function doRange () {
    normalize(workingRange);
    debug('doRange() %s', workingRange.toString());

    node = closest(workingRange.commonAncestorContainer, nodeName, true, root);
    if (node) {
      debug('found %o common ancestor element: %o', nodeName, node);

      // unwrap the common ancestor element, saving the Range state
      // and restoring it afterwards
      info = saveRange.save(range, doc);
      var outer = unwrapNode(node, null, doc);
      range = saveRange.load(info, range.commonAncestorContainer);

      // at this point, we need to save down the Range state *again*.
      // This is somewhat a quick-fix, and more optimized logic could
      // probably be implemented
      info = saveRange.save(range, doc);

      // now re-wrap left-hand side, if necessary
      var left = outer.cloneRange();
      left.setEnd(range.startContainer, range.startOffset);
      if (left.toString()) {
        debug('re-wrapping left-hand side with new %o node', nodeName);
        wrapRange(left, nodeName, doc);
      }

      // now re-wrap right-hand side, if necessary
      var right = outer.cloneRange();
      right.setStart(range.endContainer, range.endOffset);
      if (right.toString()) {
        debug('re-wrapping right-hand side with new %o node', nodeName);
        wrapRange(right, nodeName, doc);
      }

      // restore the Range at this point
      range = saveRange.load(info, range.commonAncestorContainer);
    }

    info = saveRange.save(range, doc);

    var fragment = extractContents(workingRange);
    var nodes = query.all(nodeName, fragment);

    debug('%o %o elements to "unwrap"', nodes.length, nodeName);
    for (var i = 0; i < nodes.length; i++) {
      unwrapNode(nodes[i], null, doc);
    }
    insertNode(workingRange, fragment);

    range = saveRange.load(info, range.commonAncestorContainer);
  }

  if (range.collapsed) {
    // for a `collapsed` range, we must check if the current Range is within
    // a `nodeName` DOM element.
    // If no, do nothing.
    // If yes, then we need to unwrap and re-wrap the DOM element such that it
    // gets moved to the top of the DOM stack, and then the cursor needs to go
    // right beside it selecting a 0-width space TextNode.
    // So: <i><b>test|</b></i>  →  unwrap I  →  <b><i>test</i>|</b>
    //     <i><b>|test</b></i>  →  unwrap I  →  <b>|<i>test</i></b>
    //     <i><b>te|st</b></i>  →  unwrap I  →  <b><i>te</i>|<i>st</i></b>
    debug('unwrapping collapsed Range');
    node = closest(range.commonAncestorContainer, nodeName, true, root);
    if (node) {
      debug('found parent %o node within collapsed Range', nodeName);
      var oldRange = unwrapNode(node, null, doc);
      var els = wrapRange(oldRange, nodeName, doc);

      // a 0-width space text node is required, otherwise the browser will
      // simply continue to type into the old parent node.
      // TODO: handle before, and middle of word scenarios
      var t = doc.createTextNode('\u200B');
      els[0].parentNode.appendChild(t);
      range.setStartBefore(t);
      range.setEndAfter(t);
    }
  } else {
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
}
