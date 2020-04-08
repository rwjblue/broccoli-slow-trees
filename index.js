var calculateSummary = require('./calculate-summary');

function splitIntoLines(string, characterLimit, amountOfLines) {
  var output = [];

  while(output.length < amountOfLines) {
    var line = string.substring(0, characterLimit);

    output.push(line);

    string = string.substring(characterLimit, string.length);
  }

  return output;
}

module.exports = function printSlowNodes(tree, factor, log) {
  if(!log) {
    log = console.log
  }

  try {
    var summary = calculateSummary(tree);
    var pcThreshold = factor || 0.05;
    var msThreshold = pcThreshold * summary.totalTime;
    var cumulativeLogLines = [];

    var MAX_NAME_CELL_LENGTH = 45;
    var MAX_VALUE_CELL_LENGTH = 20;


    for (var i = 0; i < summary.groupedNodes.length; i++) {
      var group = summary.groupedNodes[i];
      var averageStr;

      if (group.totalSelfTime > msThreshold) {
        if (group.count > 1) {
          averageStr = ' (' + Math.floor(group.averageSelfTime) + ' ms)';
        } else {
          averageStr = '';
        }

        var countStr = ' (' + group.count + ')'

        // we will by default have one line and the rest are the amount of lines we reqiure to overflow
        var amountOfLines = Math.ceil((group.name.length - (MAX_NAME_CELL_LENGTH - countStr.length - '...'.length)) / MAX_NAME_CELL_LENGTH) + 1;
        var lines = splitIntoLines(group.name, (MAX_NAME_CELL_LENGTH - countStr.length - '...'.length), amountOfLines);

        lines.forEach((line, index) => {
          if(index === 0) {
            cumulativeLogLines.push(pad(line + (lines.length > 1 ? '...' : '') + countStr, MAX_NAME_CELL_LENGTH) + ' | ' + pad(Math.floor(group.totalSelfTime) + 'ms' + averageStr, MAX_VALUE_CELL_LENGTH))
          } else {
            cumulativeLogLines.push(pad('...' + line, MAX_NAME_CELL_LENGTH) + ' | ' + pad(" ", MAX_VALUE_CELL_LENGTH))
          }
        });
      }
    }

    cumulativeLogLines.unshift(pad('', MAX_NAME_CELL_LENGTH, '-') + '-+-' + pad('', MAX_VALUE_CELL_LENGTH, '-'))
    cumulativeLogLines.unshift(pad('Slowest Nodes (totalTime >= ' + (pcThreshold * 100) +'%)', MAX_NAME_CELL_LENGTH) + ' | ' + pad('Total (avg)', MAX_VALUE_CELL_LENGTH))

    log('\n' + cumulativeLogLines.join('\n') + '\n')
  } catch (e) {
    console.error('Error when printing slow nodes:', e);
    console.error(e.stack)
  }
}


function pad(str, len, char, dir) {
  if (!char) { char = ' '}

  if (len + 1 >= str.length)
    switch (dir){
      case 'left':
        str = Array(len + 1 - str.length).join(char) + str
        break

      case 'both':
        var padlen = len - str.length
        var right = Math.ceil(padlen / 2)
        var left = padlen - right
        str = Array(left + 1).join(char) + str + Array(right + 1).join(char)
        break

      default:
        str = str + Array(len + 1 - str.length).join(char)
    }

  return str
}
