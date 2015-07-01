#flowgraph-editor
[![NPM](https://nodei.co/npm/flowgraph-editor.png)](https://nodei.co/npm/flowgraph-editor/)

Editor view for the `flowgraph` module.

```js
var FlowGraph = require('flowgraph')
var FlowGraphView = require('flowgraph-editor')

var insertCss = require('insert-css')

// define your graph
graph = new FlowGraph()
graph.addNode('A', ['in'], ['out'])
graph.addNode('B') // default ports are in and out
graph.addNode('C', ['1', '2', '3'], ['stdout', 'stderr'])
graph.connect('B', 'C', 'out', '2')

var view = new FlowGraphView(graph)
document.body.appendChild(view.svg)

view.on('node-select', function (node) {
  console.log(node)
})

// insert default css, you can use your own as well
insertCss(FlowGraphView.css)
```