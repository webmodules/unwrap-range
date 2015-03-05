
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

    // test that there's no more B element in the DIV
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

    // select all the inner contents of the DIV
    var range = document.createRange();
    range.setStart(div.firstChild, 0);
    range.setEnd(div.lastChild, div.lastChild.nodeValue.length);
    assert.equal('hello world', range.toString());

    unwrap(range, 'b');

    // test that there's no more B elements in the DIV
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

    // select the first "e", and the first "l" inside the B node
    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.childNodes[1].firstChild, 1);
    assert.equal('el', range.toString());

    unwrap(range, 'b');

    // test that there's a B node only around the second "l"
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

    // test that there's no more B element in the DIV
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

    // test that there's no more B element in the DIV
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

    // test that there's no more B element in the DIV
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

    // test that there's no more B element in the DIV
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

    // test that there's no more B element in the DIV
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

    unwrap(range, 'em');

    // test that there's no more EM element in the DIV
    assert.equal('<p><strong>hello</strong></p>', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('hello', range.toString());
  });

  it('should unwrap a Range that crosses multiple LI elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<ol><li>on<strong>e</strong></li><li><strong>tw</strong>o</li></ol>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.childNodes[1].firstChild, 0);
    range.setEnd(div.firstChild.lastChild.firstChild.firstChild, 2);

    // test that the Range is properly set up
    assert.equal('etw', range.toString());

    unwrap(range, 'strong');

    // test that there's no more STRONG elements in the DIV
    assert.equal('<ol><li>one</li><li>two</li></ol>', div.innerHTML);

    // test that the Range is still selecting the same text
    assert.equal('etw', range.toString());
  });

  it('should unwrap a Range that crosses multiple P elements', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><strong>aa</strong></p><p><strong>b</strong></p>';
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 0);
    range.setEnd(div.lastChild.firstChild.firstChild, 1);

    // test that the Range is properly set up
    assert.equal('aab', range.toString());

    unwrap(range, 'strong');

    // test that there's no more STRONG elements in the DIV
    assert.equal('<p>aa</p><p>b</p>', div.innerHTML);

    // test that the Range is still intact
    assert.equal('aab', range.toString());
    assert(range.startContainer === div.firstChild.firstChild);
    assert(range.startOffset === 0);
    assert(range.endContainer === div.lastChild.firstChild);
    assert(range.endOffset === 1);
  });

  it('should unwrap a Range that crosses 4 P elements', function () {
    div = document.createElement('div');
    document.body.appendChild(div);

    for (var i = 0; i < 20; i++) {
      div.innerHTML = '<p><strong>1</strong></p>' +
                      '<p><strong>2</strong></p>' +
                      '<p><strong>3</strong></p>' +
                      '<p><strong>4</strong></p>';

      var range = document.createRange();
      range.setStart(div.firstChild.firstChild.firstChild, 0);
      range.setEnd(div.lastChild.firstChild.firstChild, 1);

      // test that the Range is properly set up
      assert.equal('1234', range.toString());

      unwrap(range, 'strong');

      // test that there's no more STRONG elements in the DIV
      assert.equal('<p>1</p>' +
                   '<p>2</p>' +
                   '<p>3</p>' +
                   '<p>4</p>', div.innerHTML);

      // test that the Range is still intact
      assert.equal('1234', range.toString());
      assert(range.startContainer === div.firstChild.firstChild);
      assert(range.startOffset === 0);
      assert(range.endContainer === div.lastChild.firstChild);
      assert(range.endOffset === 1);
    }
  });

  it('should unwrap a Range that crosses 4 P elements with a BR inside one', function () {
    div = document.createElement('div');
    document.body.appendChild(div);

    for (var i = 0; i < 20; i++) {
      div.innerHTML = '<p><em>1</em></p>' +
                      '<p><em><br></em></p>' +
                      '<p><em>3</em></p>' +
                      '<p><em>4</em></p>';

      var range = document.createRange();
      range.setStart(div.firstChild.firstChild.firstChild, 0);
      range.setEnd(div.lastChild.firstChild.firstChild, 1);

      // test that the Range is properly set up
      assert.equal('134', range.toString());

      unwrap(range, 'em');

      // test that there's no more EM elements in the DIV
      assert.equal('<p>1</p>' +
                   '<p><br></p>' +
                   '<p>3</p>' +
                   '<p>4</p>', div.innerHTML);

      // test that the Range is still intact
      assert.equal('134', range.toString());
      assert(range.startContainer === div.firstChild.firstChild);
      assert(range.startOffset === 0);
      assert(range.endContainer === div.lastChild.firstChild);
      assert(range.endOffset === 1);
    }
  });

  it('should unwrap a collapsed Range', function () {
    div = document.createElement('div');
    div.innerHTML = '<p>hello <i><span class="zwsp">\u200B</span></i> world</p>';
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.childNodes[1].firstChild.firstChild, 1);
    range.setEnd(div.firstChild.childNodes[1].firstChild.firstChild, 1);

    // test that the Range is properly set up
    assert(range.collapsed);

    unwrap(range, 'i');

    // test that the I node is now within the B node
    assert.equal('<p>hello <span class="zwsp">\u200B</span> world</p>', div.innerHTML);

    assert(range.collapsed);
  });

  it('should move collapsed cursor outside of I element when at beginning boundary', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><i>hello</i> world</p>';
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 0);
    range.setEnd(div.firstChild.firstChild.firstChild, 0);

    // test that the Range is properly set up
    assert(range.collapsed);

    unwrap(range, 'i');

    // test that the I node is now within the B node
    assert.equal('<p><span class="zwsp">\u200B</span><i>hello</i> world</p>', div.innerHTML);

    assert(range.collapsed);
  });

  it('should move collapsed cursor outside of I element when at ending boundary', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><i>hello</i> world</p>';
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild, 5);
    range.setEnd(div.firstChild.firstChild.firstChild, 5);

    // test that the Range is properly set up
    assert(range.collapsed);

    unwrap(range, 'i');

    // test that the I node is now within the B node
    assert.equal('<p><i>hello</i><span class="zwsp">\u200B</span> world</p>', div.innerHTML);

    assert(range.collapsed);
  });

  it('should move collapsed cursor outside of I→B element when at ending boundary', function () {
    div = document.createElement('div');
    div.innerHTML = '<p><i><b>hello</b></i> world</p>';
    div.setAttribute('contenteditable', 'true');
    document.body.appendChild(div);

    var range = document.createRange();
    range.setStart(div.firstChild.firstChild.firstChild.firstChild, 5);
    range.setEnd(div.firstChild.firstChild.firstChild.firstChild, 5);

    // test that the Range is properly set up
    assert(range.collapsed);

    unwrap(range, 'i');

    // test that the I node is now within the B node
    assert.equal('<p><b><i>hello</i><span class="zwsp">\u200B</span></b> world</p>', div.innerHTML);

    assert(range.collapsed);
  });

});
