class EdgeConnector {
  constructor(graph, line) {
    this.graph = graph;
    this.line = line;
  }

  drawToPoint(point) {
    this.line.classed('hidden', false)
        .attr('d', `M${point.x},${point.y}L${point.x},${point.y}`);
  }

  drawTo(origin, destination) {
    this.graph.state.justDragged = true;

    this.line.attr('d', () => ConnectionDrawer.generateConnection(origin, destination));
  }

  hide() {
    this.line.classed('hidden', true);
  }
}
