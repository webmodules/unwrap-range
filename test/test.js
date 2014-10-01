
/**
 * Module dependencies.
 */

var assert = require('assert');
var unwrap = require('../');

describe('unwrap-range', function () {
  var div;

  afterEach(function () {
    if (div) {
      // clean up...
      document.body.removeChild(div);
      div = null;
    }
  });

  it('should unwrap a Range selecting a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.selectNode(b);
    assert.equal('hello worl', range.toString());

    unwrap(range, 'b');

    // test that there's no more B element in the DIV
    assert.equal('hello world', div.innerHTML);

    // test that the Range is still intact
    assert.equal('hello worl', range.toString());
    assert(range.startContainer === div.firstChild);
    assert(range.startOffset === 0);
    assert(range.endContainer === div.firstChild);
    assert(range.endOffset === 10);
  });

  it('should unwrap a Range selecting text within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = 'h<b>ello worl</b>d';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.childNodes[1].firstChild, 0);
    range.setEnd(div.childNodes[1].firstChild, 9);
    assert.equal('ello worl', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('hello world', div.innerHTML);

    // test that the Range is still intact
    assert.equal('ello worl', range.toString());
    assert(range.startContainer === div.childNodes[1]);
    assert(range.startOffset === 0);
    assert(range.endContainer === div.childNodes[1]);
    assert(range.endOffset === 9);
  });

  it('should unwrap a Range selecting multiple B elements', function () {
    div = document.createElement('div');
    div.innerHTML = 'h<b>e</b>l<i>l</i>o <b>w</b>or<i>l</i>d';
    document.body.appendChild(div);

    // select all the inner contents of the <div>
    var range = document.createRange();
    range.setStart(div.firstChild, 0);
    range.setEnd(div.lastChild, div.lastChild.nodeValue.length);
    assert.equal('hello world', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> elements in the <div>
    assert.equal('hel<i>l</i>o wor<i>l</i>d', div.innerHTML);

    // test that the Range is still intact
    assert.equal('hello world', range.toString());
    assert(range.startContainer === div.firstChild);
    assert(range.startOffset === 0);
    assert(range.endContainer === div.lastChild);
    assert(range.endOffset === div.lastChild.nodeValue.length);
  });

  it('should unwrap a Range selecting part of a B element', function () {
    div = document.createElement('div');
    div.innerHTML = 'he<b>ll</b>o';
    document.body.appendChild(div);

    // select the first "e", and the first "l" inside the <b>
    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.childNodes[1].firstChild, 1);
    assert.equal('el', range.toString());

    unwrap(range, 'b');

    // test that there's a <b> only around the second "l"
    assert.equal('hel<b>l</b>o', div.innerHTML);

    // test that the Range is still intact
    assert.equal('el', range.toString());
  });

  it('should unwrap a Range selecting all text within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.selectNodeContents(b);
    assert.equal('hello worl', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('hello world', div.innerHTML);

    // test that the Range is still intact
    assert.equal('hello worl', range.toString());
  });

  it('should unwrap a Range selecting the first 2 chars within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 0);
    range.setEnd(div.firstChild.firstChild, 2);

    // test that the Range is properly set up
    assert.equal('he', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('he<b>llo worl</b>d', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('he', range.toString());
  });

  it('should unwrap a Range selecting the middle 2 chars within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild, 2);
    range.setEnd(div.firstChild.firstChild, 4);

    // test that the Range is properly set up
    assert.equal('ll', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('<b>he</b>ll<b>o worl</b>d', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('ll', range.toString());
  });

  it('should unwrap a Range selecting the last 2 chars within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.setStart(b.firstChild, b.firstChild.length - 2);
    range.setEnd(b.firstChild, b.firstChild.length);

    // test that the Range is properly set up
    assert.equal('rl', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('<b>hello wo</b>rld', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('rl', range.toString());
  });

  it('should unwrap a Range spanning across block elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><b>hello</b></p><p><b>world</b></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 3);
    range.setEnd(div.lastChild.firstChild.firstChild, 3);

    // test that the Range is properly set up
    assert.equal('lowor', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('<p><b>hel</b>lo</p><p>wor<b>ld</b></p>', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('lowor', range.toString());
  });

  it('should unwrap a Range nested inside another inline element', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><em><strong>hello</strong></em></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild.firstChild, 0);
    range.setEnd(div.firstChild.firstChild.firstChild.firstChild, 5);

    // test that the Range is properly set up
    assert.equal('hello', range.toString());

    console.log(div.innerHTML);
    unwrap(range, 'em');
    console.log(div.innerHTML);

    // test that there's no more <b> element in the <div>
    assert.equal('<p><strong>hello</strong></p>', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('hello', range.toString());
  });

});
