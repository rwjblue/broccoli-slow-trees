function nameFromTreeNode(node) {
  return node.tree.description || node.tree.constructor.name;
}

function printSlowTrees(graph, factor) {
  try {
    var allSortResults = sortResults(graph)
    var flatSortedTrees = allSortResults.flatSortedTrees
    var groupedSortedTrees = allSortResults.groupedSortedTrees

    var minimumTime = graph.totalTime * (factor || 0.05)
    var logLines = [],
        cumulativeLogLines = [];

    var MAX_NAME_LENGTH = 30,
        MAX_VALUE_LENGTH = 15;

    for (var i = 0; i < flatSortedTrees.length; i++) {
      var node = flatSortedTrees[i]
      var name = nameFromTreeNode(node)

      if (node.selfTime > minimumTime) {
        logLines.push(pad(name, MAX_NAME_LENGTH) + ' | ' + pad(Math.floor(node.selfTime / 1e6) + 'ms', MAX_VALUE_LENGTH))
      }
    }

    if (logLines.length > 0) {
      logLines.unshift(pad('', MAX_NAME_LENGTH, '-') + '-+-' + pad('', MAX_VALUE_LENGTH, '-'))
      logLines.unshift(pad('Slowest Trees', MAX_NAME_LENGTH) + ' | ' + pad('Total', MAX_VALUE_LENGTH))
    }

    for (var i = 0; i < groupedSortedTrees.length; i++) {
      var group = groupedSortedTrees[i],
          averageStr

      if (group.totalSelfTime > minimumTime) {
        if (group.nodes.length > 1) {
          averageStr = ' (' + Math.floor(group.averageSelfTime / 1e6) + ' ms)';
        } else {
          averageStr = '';
        }

        cumulativeLogLines.push(pad(group.name + ' (' + group.nodes.length + ')', MAX_NAME_LENGTH) + ' | ' + pad(Math.floor(group.totalSelfTime / 1e6) + 'ms' + averageStr, MAX_VALUE_LENGTH))
      }
    }

    if (cumulativeLogLines.length > 0) {
      cumulativeLogLines.unshift(pad('', MAX_NAME_LENGTH, '-') + '-+-' + pad('', MAX_VALUE_LENGTH, '-'))
      cumulativeLogLines.unshift(pad('Slowest Trees (cumulative)', MAX_NAME_LENGTH) + ' | ' + pad('Total (avg)', MAX_VALUE_LENGTH))
      cumulativeLogLines.unshift('\n')
    }

    console.log('\n' + logLines.join('\n') + cumulativeLogLines.join('\n') + '\n')
  } catch (e) {
    console.error(e);
    throw e;
  }
}

function sortResults(graph) {
  var flattenedTrees = []
  var treesGroupedByName = Object.create(null)
  var groupedTrees = [];

  function process(node) {
    if (flattenedTrees.indexOf(node) > -1) { return } // for de-duping

    flattenedTrees.push(node)

    var name = nameFromTreeNode(node)
    if (treesGroupedByName[name] == null) {
      treesGroupedByName[name] = {
        name: name,
        nodes: [],
        totalSelfTime: undefined, // to calculate
        averageSelfTime: undefined // to calculate
      }
    }
    treesGroupedByName[name].nodes.push(node)

    var length = node.subtrees.length
    for (var i = 0; i < length; i++) {
      process(node.subtrees[i])
    }
  }


  process(graph) // kick off with the top item

  var flatSortedTrees = flattenedTrees.sort(function(a, b) {
    return b.selfTime - a.selfTime
  })


  for (var groupName in treesGroupedByName) {
    var group = treesGroupedByName[groupName];

    group.totalSelfTime = group.nodes.reduce(function(sum, node) {
      return sum + node.selfTime
    }, 0);

    group.averageSelfTime = group.totalSelfTime / group.nodes.length;

    groupedTrees.push(group);
  }

  var flatSortedTrees = flattenedTrees.sort(function(a, b) {
    return b.selfTime - a.selfTime
  })

  var groupedSortedTrees = groupedTrees.sort(function(a, b) {
    return b.totalSelfTime - a.totalSelfTime
  })

  return {
    flatSortedTrees: flattenedTrees,
    groupedSortedTrees: groupedSortedTrees
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

module.exports = printSlowTrees
