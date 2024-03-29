function createStringBuffer (Fifo, debug) {
  'use strict';

  var _zeroString = String.fromCharCode(0);

  function StringBuffer (maxlength, delimiter) {
    this.maxlength = maxlength || 64*1024;
    this.fifo = new Fifo();
    this.buffer = '';
    this.delimiter = (delimiter instanceof String || 'string' === typeof delimiter) ? delimiter : _zeroString;
  }
  StringBuffer.prototype.destroy = function () {
    this.buffer = null;
    if (this.fifo) {
      this.fifo.destroy();
    }
    this.fifo = null;
    this.maxlength = null;
  };
  StringBuffer.prototype.add = function (string) {
    if (!this.fifo) {
      return;
    }
    if (this.buffer.length > 0 && this.buffer.length + string.length + 1 > this.maxlength) {
      this.fifo.push(this.buffer);
      this.buffer = '';
      if (debug) {
        console.log(process.pid+' StringBuffer +', this.fifo.length, 'strings');
      }
    }
    if (this.buffer) {
      this.buffer += (this.delimiter+string);
    } else {
      this.buffer = string;
    }
  }
  StringBuffer.prototype.addWithHandlers = function (string, wasemptyhandler, wasnotemptyhandler) {
    var wasempty = !this.hasContents();
    this.add(string);
    if (wasempty) {
      if ('function' === typeof wasemptyhandler) {
        wasemptyhandler();
      }
      return;
    }
    if ('function' === typeof wasnotemptyhandler) {
      wasnotemptyhandler();
    }
  };
  StringBuffer.prototype.get = function (consumerfunc) {
    var ret;
    if (!this.fifo.length) {
      ret = this.buffer;
      this.buffer = '';
      consumerfunc(ret);
      return ret;
    }
    this.fifo.pop(consumerfunc);
    if (debug) {
      if (this.fifo) {
        console.log(process.pid+' StringBuffer -', this.fifo.length, 'strings');
      } else {
        console.log('StringBuffer destroyed during get');
      }
    }
  };
  StringBuffer.prototype.hasContents = function () {
    if (!this.fifo) {
      return false;
    }
    if (this.buffer.length > 0) {
      return true;
    }
    return this.fifo.length > 0;
  };
  StringBuffer.prototype.consume = function (consumerfunc) {
    while (this.hasContents()) {
      this.get(this.onStringToConsume.bind(this, consumerfunc));
    }
  };
  StringBuffer.prototype.onStringToConsume = function (consumerfunc, string) {
    StringBuffer.consumeString(string, consumerfunc);
  };
  StringBuffer.consumeString = function (string, func, dojsonparse, delimiterchar) {
    var c1, c2, dc, sl = string.length;
    c1 = c2 = 0;
    dc = delimiterchar || 0;
    while (c2 < sl) {
      if (string.charCodeAt(c2) === dc) {
        func(stringFromPositions(string, c1, c2, dojsonparse));
        c1 = c2+1;
      }
      c2++;
    }
    if (c1!==c2) {
      func(stringFromPositions(string, c1, c2, dojsonparse));
    }
  };
  function stringFromDelimiter (string, cursor) {
    var sl=string.length;
    while (cursor<sl) {
    }
    if (cursor>=sl) {
    }
  }
  function stringFromPositions (string, start, end, dojsonparse) {
    if (start===0 && end === string.length) {
      return dojsonparse ? parse(string) : string;
    }
    return dojsonparse ? parse(string.substring(start, end)) : string.substring(start, end);
  }
  function parse (string) {
    try {
      return JSON.parse(string);
    }
    catch (ignore) {
      return string;
    }
  }


  return StringBuffer;
}

module.exports = createStringBuffer;

