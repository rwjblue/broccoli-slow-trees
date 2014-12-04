var MINIMUM_ENTRY_SIZE = 15

function printSlowTrees(graph, factor) {
  var sortedTrees = sortResults(graph)
  var minimumTime = graph.totalTime * (factor || 0.05)
  var bodyRows = convertTreeToRows(sortedTrees, minimumTime)

  var rows = [["Slowest Trees", "Total"]].concat(bodyRows)

  var maxColLengths = findMaximumColumnLengths(rows).map(function(length) { return Math.max(length, MINIMUM_ENTRY_SIZE) })

  console.log('\n' + buildTableString(rows, maxColLengths) + '\n')
}

function convertTreeToRows(tree, minimumTime) {
  return tree
          .filter(function(node) {
            return (node.selfTime > minimumTime)
          })
          .map(function(node) {
            var name = node.tree.description || node.tree.constructor.name

            return [name, Math.floor(node.selfTime / 1e6) + 'ms']
          })
}

function buildTableString(rows, maxColLengths) {
  if (rows.length <= 0) { return '' }

  var table = rows
                .map(function(row) {
                  return row.map(function(entry, idx) { return pad(entry, maxColLengths[idx]) })
                })
                .map(function(row) {
                  return row.join(' | ')
                })
  
  table.splice(1, 0, buildHeaderSeparatorString(rows[0].length, maxColLengths))  

  return table.join('\n')
}

function buildHeaderSeparatorString(size, maxColLengths) {
  var headerSeparator = Array.apply(null, new Array(size)).map(String.prototype.valueOf, "-")
  return headerSeparator
          .map(function(val, idx) { return pad('', maxColLengths[idx] + 1, val) })
          .join('+')
}

function findMaximumColumnLengths(rows) {
  if (rows.length <= 0) { return [] }

  // creates an array filled with 0s that is the same size as the first logEntry
  var initialArray = Array.apply(null, new Array(rows[0].length)).map(Number.prototype.valueOf, 0)

  var maxColLengths = rows
                        .map(function(row) {
                          return row.map(function(entry) { return entry.length })
                        })
                        .reduce(function(previous, lengths) {
                          return previous.map(function (prev, idx) { return Math.max(prev || 0, lengths[idx]) })
                        }, initialArray)

  return maxColLengths
}

function sortResults(graph) {
  var flattenedTrees = []

  function process(node) {
    if (flattenedTrees.indexOf(node) > -1) { return } // for de-duping

    flattenedTrees.push(node)

    var length = node.subtrees.length
    for (var i = 0; i < length; i++) {
      process(node.subtrees[i])
    }
  }

  process(graph) // kick off with the top item

  return flattenedTrees.sort(function(a, b) {
    return b.selfTime - a.selfTime
  })
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
