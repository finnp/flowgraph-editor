var FlowGraph = require('flowgraph')
var FlowGraphView = require('./')
var insertCss = require('insert-css')

var graph = new FlowGraph()

graph.on('node-added', function (node) {
  console.log('added', node.id)
})

graph.on('edge-added', function (edge) {
  console.log('added edge', edge.source.id, edge.target.id)
})

graph.addNode({label: 'b'})
graph.addNode('a')
graph.addNode({id: 'd', label: 'a'})
graph.addNode({id: 'b', data: 'test'})
graph.addNode('c', ['1', '2', '3'], ['stdout', 'stderr'])
graph.connect('b', 'c', 'out', '2')

console.log(graph.export())

graph.on('node-deleted', function (node) {
  console.log('deleted', node.id)
})

graph.on('edge-deleted', function (edge) {
  console.log('deleted edge', edge.source.id, edge.target.id)
})

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

setTimeout(function () {
  view.blinkEdge('b', 'c', 'out', '2')
  setTimeout(function () {
    view.blinkEdge('b', 'c', 'out', '2')
  }, 500)
}, 2000)

view.on('node-select', function (node) {
  console.log('Node clicked', node)
})

insertCss(FlowGraphView.css)
