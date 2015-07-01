var EventEmitter = require('events').EventEmitter
var fs = require('fs')

var inherits = require('inherits')
var delegate = require('delegate-dom')
var classList = require('dom-classlist')
var domArray = require('dom-array')

var h = require('virtual-hyperscript-svg')
var diff = require('virtual-dom/diff')
var patch = require('virtual-dom/patch')
var createElement = require('virtual-dom/create-element')

var edge = require('./edge.js')
var renderEdge = edge.render
var renderCurve = edge.renderCurve

var renderNode = require('./node.js')

module.exports = FlowGraphView

FlowGraphView.css = fs.readFileSync(__dirname + '/style.css').toString()

inherits(FlowGraphView, EventEmitter)

function FlowGraphView (data, element) {
  this.data = data
  this.tree = this.render()
  this.svg = createElement(this.tree)
  this.registerHandlers()
}

FlowGraphView.prototype.render = function () {
  var domNodes = this.data.getEdges()
    .map(renderEdge.bind(this, this.data))

  if (this.data.connector.active) {
    var line = renderCurve(
      this.data.connector.from,
      this.data.connector.to,
      'connector'
    )
    domNodes.push(line)
  }
  domNodes = domNodes.concat(this.data.getNodes().map(renderNode))
  var svg = h('svg', {}, domNodes)
  return svg
}

FlowGraphView.prototype.activateEdge = function (source, target, outport, inport) {
  outport = outport || 'out'
  inport = inport || 'in'

  var selector = '.edge-source-' + source + '-' + outport
  if (target) selector += '.edge-target-' + target + '-' + inport

  var edges = document.querySelectorAll(selector)
  domArray(edges).forEach(function (edge) {
    classList(edge).add('edgeactive')
  })
}

FlowGraphView.prototype.deactivateEdge = function (source, target, outport, inport) {
  outport = outport || 'out'
  inport = inport || 'in'

  var selector = '.edge-source-' + source + '-' + outport
  if (target) selector += '.edge-target-' + target + '-' + inport

  var edges = document.querySelectorAll(selector)
  domArray(edges).forEach(function (edge) {
    classList(edge).remove('edgeactive')
  })
}

FlowGraphView.prototype.blinkEdge = function (source, target, outport, inport, ms) {
  ms = ms || 300
  this.activateEdge(source, target, outport, inport)
  setTimeout(this.deactivateEdge.bind(this, source, target, outport, inport), ms)
}

FlowGraphView.prototype.registerHandlers = function () {
  var self = this
  var data = this.data

  setInterval(function () {
    var newTree = this.render()
    var patches = diff(this.tree, newTree)
    this.svg = patch(this.svg, patches)
    this.tree = newTree
  }.bind(this), 50)

  delegate.on(this.svg, '.edge', 'click', function (e) {
    var id = e.target.getAttribute('id')
    var a = id.split('-')
    data.disconnect(a[0], a[1], a[2], a[3])
  })

  delegate.on(this.svg, '.node rect, .node text', 'click', function (e) {
    var id = e.target.parentNode.getAttribute('id')
    self.emit('node-select', data.getNode(id))
  })

  delegate.on(this.svg, '.node .close', 'click', function (e) {
    var id = e.target.parentNode.getAttribute('id')
    data.deleteNode(id)
  })

  delegate.on(this.svg, '.node rect, .node text', 'mousedown', function (e) {
    var id = e.target.parentNode.getAttribute('id')

    document.onmousemove = moveObject
    var moved = data.getNode(id)
    function moveObject (e) {
      moved.x = e.pageX - 50
      moved.y = e.pageY - 50
    }
  })

  delegate.on(this.svg, '.node circle', 'mouseover', function (e) {
    var id = e.target.parentNode.getAttribute('id')
    var port = e.target.getAttribute('id').split('-')[2]
    var isInput = hasClass(e.target, 'input')
    var compatible = data.connector.isInput !== isInput
    if (data.connector.active && compatible) {
      stopDrag()
      var sourceId = isInput ? data.connector.from.id : id
      var targetId = isInput ? id : data.connector.from.id
      var sourcePort = isInput ? data.connector.from.port : port
      var targetPort = isInput ? port : data.connector.from.port
      data.connect(sourceId, targetId, sourcePort, targetPort)
    }
  })

  delegate.on(this.svg, '.node circle', 'mousedown', function (e) {
    var id = e.target.parentNode.getAttribute('id')
    var port = e.target.getAttribute('id').split('-')[2]
    var isInput = hasClass(e.target, 'input')

    document.onmousemove = moveLine
    data.connector.from.x = e.pageX
    data.connector.from.y = e.pageY
    data.connector.from.id = id
    data.connector.from.port = port
    data.connector.isInput = isInput
    data.connector.active = true
    data.connector.to.x = e.pageX
    data.connector.to.y = e.pageY
    function moveLine (e) {
      data.connector.to.x = e.pageX
      data.connector.to.y = e.pageY
    }
  })

  document.body.addEventListener('mouseup', stopDrag)

  function stopDrag () {
    document.onmousemove = function () {}
    data.connector.active = false
  }
}

function hasClass (element, className) {
  return element.getAttribute('class').split(' ').indexOf(className) > -1
}
