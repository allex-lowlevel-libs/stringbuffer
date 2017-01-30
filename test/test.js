var expect = require('chai').expect,
  Checks = require('allex_checkslowlevellib'),
  DListBase = require('allex_doublelinkedlistbaselowlevellib'),
  Inherit = require('allex_inheritlowlevellib').inherit,
  Fifo = require('allex_fifolowlevellib')(DListBase,Inherit),
  StringBuffer = require('..')(Fifo),
  testjob1 = 10000,
  teststring1 = 'Test string 1',
  sb;

function consumeString(testobj, string) {
  StringBuffer.consumeString(string, processUnit.bind(null, testobj));
}
function processUnit (testobj, string) {
  expect(string).to.equal(testobj.string);
  testobj.count++;
}

describe('Testing the String Buffer', function () {
  it('Create', function () {
    sb = new StringBuffer();
  });
  it('Add '+testjob1+' strings', function () {
    for(var i=0; i<testjob1; i++) {
      sb.add(teststring1);
    }
  });
  it('Get strings', function () {
    var testobj = {string: teststring1, count:0};
    while(sb.hasContents()) {
      sb.get(consumeString.bind(null, testobj));
    }
    expect(testobj.count).to.equal(testjob1);
  });
  it('Check for empty', function () {
    expect(sb.hasContents()).to.equal(false);
  });
  it('Add '+testjob1+' strings', function () {
    for(var i=0; i<testjob1; i++) {
      sb.add(teststring1);
    }
  });
  it('Consume buffer', function () {
    sb.consume(processUnit.bind(null, {string: teststring1, count:0}));
  });
  it('Check for empty', function () {
    expect(sb.hasContents()).to.equal(false);
  });
});
