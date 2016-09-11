class ConnectionDrawer {
  constructor(pedalboard) {
    this.pedalboard = pedalboard;
  }

  draw(elements, selectedConnection) {
    // update existing connections
    elements.style('marker-end', 'url(#end-arrow)')
      .classed("selected", d => d === selectedConnection)
      .attr("d", connection => this.resize(connection));

    // add new connection
    const newElements = this.drawIn(elements.enter())

    // remove old links
    elements.exit().remove();

    return elements.merge(newElements);
  }

  drawIn(node) {
    const self = this;

    const container = node
      .append("path")
      .style('marker-end','url(#end-arrow)')
      .attr("id", connection => Connection.generateId(connection))
      .classed("link", true)
      .attr("d", connection => this.resize(connection))
      .on("mousedown", function(connection) { self.mouseDown(d3.select(this), connection) })
      .on("touchstart", function(connection) { self.mouseDown(d3.select(this), connection) });

    return container;
  }

  mouseDown(element, connection) {
    this.pedalboard.selectConnection(element, connection);

    d3.event.stopPropagation();
  }

  resize(connection) {
    const source = PortDrawer.positionOfPortElement(d3.select(connection.source));
    const target = PortDrawer.positionOfPortElement(d3.select(connection.target));

    return ConnectionDrawer.generateConnection(source, target);
  }

  static generateConnection(source, target) {
    return `M${source.x},${source.y}`
         + `C${(source.x + target.x) / 2},${source.y}`
         + ` ${(source.x + target.x) / 2},${target.y}`
         + ` ${target.x},${target.y}`;

    /*
    const diagonal = d3.line()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveStep);

    return diagonal([source, target]);
    */
  }
}
