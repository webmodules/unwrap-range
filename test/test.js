
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

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('hello world', div.innerHTML);
  });

  it('should unwrap a Range selecting multiple B elements', function () {
    div = document.createElement('div');
    div.innerHTML = 'h<b>e</b>l<i>l</i>o <b>w</b>or<i>l</i>d';
    document.body.appendChild(div);

    // select all the inner contents of the <div>
    var range = document.createRange();
    range.setStart(div.firstChild, 0);
    range.setEnd(div.lastChild, div.lastChild.nodeValue.length);

    unwrap(range, 'b');

    // test that there's no more <b> elements in the <div>
    assert.equal('hel<i>l</i>o wor<i>l</i>d', div.innerHTML);
  });

  it('should unwrap a Range selecting part of a B element', function () {
    div = document.createElement('div');
    div.innerHTML = 'he<b>ll</b>o';
    document.body.appendChild(div);

    // select the first "e", and the first "l" inside the <b>
    var range = document.createRange();
    range.setStart(div.firstChild, 1);
    range.setEnd(div.childNodes[1].firstChild, 1);

    unwrap(range, 'b');

    // test that there's a <b> only around the second "l"
    assert.equal('hel<b>l</b>o', div.innerHTML);
  });

  it('should unwrap a Range selecting all text within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.selectNodeContents(b);

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('hello world', div.innerHTML);
  });

  it('should unwrap a Range selecting the first 2 chars within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.setStart(b.firstChild, 0);
    range.setEnd(b.firstChild, 2);

    // test that the Range is properly set up
    assert.equal('he', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('he<b>llo worl</b>d', div.innerHTML);
  });

  it('should unwrap a Range selecting the middle 2 chars within a B element', function () {
    div = document.createElement('div');
    div.innerHTML = '<b>hello worl</b>d';
    document.body.appendChild(div);

    var b = div.firstChild;
    var range = document.createRange();
    range.setStart(b.firstChild, 2);
    range.setEnd(b.firstChild, 4);

    // test that the Range is properly set up
    assert.equal('ll', range.toString());

    unwrap(range, 'b');

    // test that there's no more <b> element in the <div>
    assert.equal('<b>he</b>ll<b>o worl</b>d', div.innerHTML);
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
  });

});
