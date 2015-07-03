var h = require('virtual-hyperscript-svg')

module.exports = renderNode

function renderNode (node) {
  var rect = h('rect', {
    class: 'body',
    x: 0,
    y: 0,
    rx: '8px',
    ry: '8px',
    width: 100,
    height: 100
  })

  var ports = node.inports.map(function (name, i) {
    return h('circle', {
      class: 'port input',
      id: node.id + '-inport-' + name,
      r: 5,
      cx: 0,
      cy: (i + 1) * 100 / (node.inports.length + 1)
    })
  })

  ports = ports.concat(node.outports.map(function (name, i) {
    return h('circle', {
      class: 'port output',
      id: node.id + '-outport-' + name,
      r: 5,
      cx: 100,
      cy: (i + 1) * 100 / (node.outports.length + 1)
    })
  }))

  var closeButton = h('rect', {
    class: 'close',
    x: 5,
    y: 5,
    width: '10px',
    height: '10px',
    rx: 2
  })
  var text = h('text', {x: 50, y: 50}, node.label || node.id)
  var domNode = h('g', {
    id: node.id,
    class: 'node',
    transform: 'translate(' + node.x + ',' + node.y + ')'
  },
    [
      rect,
      closeButton,
      text
    ].concat(ports))
  return domNode
}
