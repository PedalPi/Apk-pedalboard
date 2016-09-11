class EdgeConnector {
  constructor(svgGroup) {
    this.line = GraphDefinitions.generateEdgeLine(svgGroup);
  }

  drawToPoint(point) {
    this.line.attr('d', `M${point.x},${point.y}L${point.x},${point.y}`);
  }

  drawTo(origin, destination) {
    this.line.attr('d', () => ConnectionDrawer.generateConnection(origin, destination));
  }
}
