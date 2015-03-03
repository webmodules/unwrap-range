
/**
 * Module dependencies.
 */

var getDocument = require('get-document');
var unwrapNode = require('unwrap-node');
var extractContents = require('range-extract-contents');
var insertNode = require('range-insert-node');
var wrapRange = require('wrap-range');
var closest = require('component-closest');
var query = require('component-query');
var saveRange = require('save-range');
var RangeIterator = require('range-iterator');
var normalize = require('range-normalize');

// create a CSS selector string from the "block elements" array
var blockSel = ['li'].concat(require('block-elements')).join(', ');

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

  var info, node, prevBlock, next;

  function doRange (workingRange) {
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
    node = closest(range.endContainer, nodeName, true, root);
    if (node) {
      debug('found parent %o node within collapsed Range', nodeName);

      // first attempt to find any existing `.zwsp` span, and remove it
      // so that it's not considered when checking if the `node` is "empty"
      var span = closest(range.endContainer, '.zwsp', true, root);
      if (span) span.parentNode.removeChild(span);

      var isEmpty = !node.firstChild;

      var parentNode = node.parentNode;
      var nextSibling = node.nextSibling;
      var previousSibling = node.previousSibling;

      var oldRange = unwrapNode(node, null, doc);

      if (!span) {
        span = doc.createElement('span');
        span.className = 'zwsp';
      }
      var text = span.firstChild;
      if (!text) {
        text = doc.createTextNode('\u200B');
        span.appendChild(text);
      }

      if (!isEmpty) {
        var els = wrapRange(oldRange, nodeName, doc);

        // a 0-width space text node is required, otherwise the browser will
        // simply continue to type into the old parent node.
        // TODO: handle before, and middle of word scenarios
        debug('inserting 0-width space TextNode after new %o element', els[0].nodeName);
        node.appendChild(span);

        insertAfter(span, els[els.length - 1]);
      } else {
        // empty
        if (previousSibling) {
          insertAfter(span, previousSibling);
        } else if (nextSibling) {
          parent.insertBefore(span, nextSibling);
        } else {
          parent.appendChild(span);
        }
      }

      var l = text.nodeValue.length;
      range.setStart(text, l);
      range.setEnd(text, l);
    }
  } else {
    var originalRange = range.cloneRange();
    var workingRange = range.cloneRange();
    var iterator = new RangeIterator(range)
      .revisit(false)
      .select(3 /* text nodes */)
      .select(function (node) {
        // nodes with no child nodes
        return node.childNodes.length === 0;
      });

    var ranges = [];
    while (next = iterator.next()) {
      var block = closest(next, blockSel, true, root);

      if (prevBlock && prevBlock !== block) {
        debug('found block boundary point for %o!', prevBlock);
        workingRange.setEndAfter(prevBlock);

        ranges.push(normalize(workingRange));

        // now we clone the original range again, since it has the
        // "end boundary" set up the way to need it still. But reset the
        // "start boundary" to point to the beginning of this new block
        workingRange = originalRange.cloneRange();
        workingRange.setStartBefore(block);
      }

      prevBlock = block;
    }
    ranges.push(normalize(workingRange));

    for (var i = 0; i < ranges.length; i++) {
      doRange(ranges[i]);
    }

    normalize(range);
  }
}

function insertAfter(newElement, targetElement) {
  var parent = targetElement.parentNode;

  if (parent.lastChild === targetElement) {
    parent.appendChild(newElement);
  } else {
    parent.insertBefore(newElement, targetElement.nextSibling);
  }
}
