class EdgeConnector {
  constructor(graph, line) {
    this.graph = graph;
    this.line = line;
  }

  drawToPoint(point) {
    this.line.attr('d', `M${point.x},${point.y}L${point.x},${point.y}`);
  }

  drawTo(origin, destination) {
    this.line.attr('d', () => ConnectionDrawer.generateConnection(origin, destination));
  }
}
