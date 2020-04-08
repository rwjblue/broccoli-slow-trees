var Heimdall = require('heimdalljs/heimdall');
var chai = require('chai'), expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');

var printSlowNodes = require('../index');

chai.use(chaiAsPromised);

function stubTime(ms) {
  process.hrtime = function () {
    return [0, ms * 1e6];
  };
}

var originalHrtime = process.hrtime;

function restoreTime() {
  process.hrtime = originalHrtime;
}

describe('printSlowNodes', function() {
  afterEach(restoreTime);

  it('prints slow nodes for simple graphs', function() {
    stubTime(100);

    var heimdall = new Heimdall();

    return expect(heimdall.node({ name: 'babel', broccoliNode: true, }, function () {
      stubTime(200);
      return heimdall.node({ name: 'merge-trees', broccoliNode: true }, function () {
        stubTime(350);
      });
    }).then(function () {
      return heimdall.node({ name: 'merge-trees', broccoliNode: true }, function () {
        stubTime(600);
      });
    }).then(function () {
      var output = [];

      printSlowNodes(heimdall, null, (data) => output.push(data));

      return output;
    })).to.eventually.deep.equal([
      '\n' +
        'Slowest Nodes (totalTime >= 5%)               | Total (avg)         \n' +
        '----------------------------------------------+---------------------\n' +
        'merge-trees (2)                               | 400ms (200 ms)      \n' +
        'babel (1)                                     | 100ms               \n'
    ]);
  });

  it('prints large node names on the next line', function() {
    stubTime(100);

    var heimdall = new Heimdall();

    return expect(heimdall.node({ name: 'broccoli-persistent-filter:TemplateCompilerConcat', broccoliNode: true, }, function () {
      stubTime(350);
    }).then(function () {
      var output = [];

      printSlowNodes(heimdall, null, (data) => output.push(data));

      return output;
    })).to.eventually.deep.equal([
      '\n' +
        'Slowest Nodes (totalTime >= 5%)               | Total (avg)         \n' +
        '----------------------------------------------+---------------------\n' +
        'broccoli-persistent-filter:TemplateCom... (1) | 250ms               \n' +
        '...pilerConcat                                |                     \n'
    ])
  });
});
