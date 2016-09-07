class PortDrawer {
  constructor(graph, effectSize) {
    PortDrawer.RADIUS = 20;
    PortDrawer.PADDING = 5;

    this.effectSize = effectSize;
    this.graph = graph;
  }

  drawIn(container) {
    const self = this;

    container.selectAll("circle")
      .data(effect => this.filterPorts(effect))
      .enter()
      .append("circle")
      .attr("r", PortDrawer.RADIUS)
      .attr("cx", (data, index) => this.x(index))
      .attr("cy", (data, index) => this.y(index))

      .on("mousedown", function(node) { self.mouseDown(d3.select(this), node)} )
      .on("touchstart", function(node) { self.mouseDown(d3.select(this), node)} )

      .on("click", function(node) { console.log('clicked'); self.mouseUp(d3.select(this), node); })
      .on("touchend", function(node) { self.touchEnd(d3.select(this), node); })

      .call(this.generateDragBehavior())
  }

  filterPorts() {}

  x(index) {}

  y(index) {
    const startPosition = PortDrawer.RADIUS + PortDrawer.PADDING - this.effectSize.height/2;
    const elementSize = 2*PortDrawer.RADIUS + 2*PortDrawer.PADDING;

    return index*elementSize + startPosition;
  }

  generateDragBehavior() {
    const self = this;

    return d3.drag()
      .on("drag", function(port) { self.drag(d3.select(this), port) })
      .on("end", function(port) { self.dragEnd(d3.select(this), port) });
  }

  drag(element, port) {
    const mouse = d3.mouse(this.graph.svgG.node());

    const mousePosition = {
      x: mouse[0],
      y: mouse[1]
    }
    const elementPosition = PortDrawer.positionOfPortElement(element);

    this.graph.edgeConnector.drawTo(elementPosition, mousePosition);
  }

  dragEnd(elementOrigin, nodeOrigin) {
    this.graph.edgeConnector.hide();
    this.touchEnd(elementOrigin, nodeOrigin);
  }

  mouseDown(element, port) {
    this.graph.currentState.connectionPortElementOrigin = element.node();

    const position = PortDrawer.positionOfPortElement(element);

    this.graph.edgeConnector.drawToPoint(position);
    d3.event.stopPropagation();
  }

  mouseUp(element, port) {
    if (this.graph.hasRequestCreationConnection()) {
      const origin = this.graph.currentState.connectionPortElementOrigin;
      const destination = element.node();

      if (origin !== destination)
        this.graph.createConnection(origin, destination);
    }

    this.graph.currentState.connectionPortElementOrigin = null;
  }

  touchEnd(originElement, originNode) {
    // Based in http://jsfiddle.net/AkPN2/5/
    const mouse = d3.mouse(this.graph.svgG.node());

    const detectorInputPort = {
      cx: mouse[0],
      cy: mouse[1],
      r: 50
    }

    const self = this;
    const inputPorts = this.graph.svgG.selectAll('circle');
    inputPorts.each(function(port) {
      self.detectColision(this, port, detectorInputPort)
    });
  }

  detectColision(element, port, detectorInputPort) {
    const d3Element = d3.select(element);
    const position = PortDrawer.positionOfPortElement(d3Element);

    const portCircleDetectable = {
      cx: position.x,
      cy: position.y,
      r: element.getAttribute("r")
    };

    if (this.circleOverlapQ(detectorInputPort, portCircleDetectable))
      this.mouseUp(d3Element, port);
  }

  circleOverlapQ(c1, c2) {
    let distance = Math.sqrt(
      Math.pow(parseInt(c2.cx) - parseInt(c1.cx), 2) +
      Math.pow(parseInt(c2.cy) - parseInt(c1.cy), 2)
    );

    return distance < (parseInt(c1.r) + parseInt(c2.r));
  }

  static positionOfPortElement(element) {
    const effectElement = element.node().parentElement.parentElement;
    const effect = d3.select(effectElement).datum();

    return {
      x: effect.x + parseInt(element.attr("cx")),
      y: effect.y + parseInt(element.attr("cy")),
    }
  }
}

class PortDrawerInput extends PortDrawer {
  filterPorts(effect) {
    return effect.input;
  }

  x(index) {
    return this.effectSize.width/2 * -1;
  }
}

class PortDrawerOutput extends PortDrawer {
  filterPorts(effect) {
    return effect.output;
  }

  x(index) {
    return this.effectSize.width/2;
  }
}
