var Checks = require('allex_checkslowlevellib'),
  DListBase = require('allex_doublelinkedlistbaselowlevellib'),
  Inherit = require('allex_inheritlowlevellib').inherit,
  Fifo = require('allex_fifolowlevellib')(DListBase,Inherit),
  StringBuffer = require('..')(Fifo);

var JobBase = qlib.JobBase;

function Filler (burstcount, msgsperburst, burstpause, defer) {
  JobBase.call(this, defer);
  this.burstcount = burstcount;
  this.msgsperburst = msgsperburst;
  this.burstpause = burstpause;
  this.burstsdone = 0;
  if (!lib.isNumber(this.burstpause) || this.burstpause<0) this.burstpause = 0;
}
lib.inherit(Filler, JobBase);
Filler.prototype.destroy = function () {
  this.burstsdone = null;
  this.burstpause = null;
  this.msgsperburst = null;
  this.burstcount = null;
  JobBase.prototype.destroy.call(this);
};
Filler.prototype.go = function () {
  var ok = this.okToGo();
  if (!ok.ok) {
    return ok.val;
  }
  this.doBurst();
  return ok.val;
};
Filler.prototype.doBurst = function () {
  var i;
  if (!this.okToProceed()) {
    return;
  }
  if (this.burstsdone >= this.burstcount) {
    this.resolve(this.burstsdone);
    return;
  }
  for(i=0; i<this.msgsperburst; i++) {
    Buffer.add(this.burstsdone+':'+i);
  }
  this.burstsdone ++;
  lib.runNext(this.doBurst.bind(this), this.burstpause);
};

var _burstcount = 50;
var _msgsperburst = 50;
var _burstpause = 1;

describe('Testing fill/emptying', function () {
  it('Init', function () {
    return setGlobal('Buffer', new StringBuffer());
  });
  it('Init waiters', function () {
    return setGlobal('Waiters', []);
  });
  it('Start Filler', function () {
    var f = (new Filler(_burstcount, _msgsperburst)).go();
    Waiters.push(f);
  });
  it('Wait', function () {
    this.timeout = 1e5;
    return q.all(Waiters);
  });
});
