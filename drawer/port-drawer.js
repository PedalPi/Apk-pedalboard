class PortDrawer {
  constructor(pedalboard, effectSize) {
    PortDrawer.RADIUS = 20;
    PortDrawer.PADDING = 5;

    this.effectSize = effectSize;
    this.pedalboard = pedalboard;
  }

  drawIn(container) {
    const self = this;

    return container.selectAll("circle")
      .data(effect => this.filterPorts(effect))
      .enter()
      .append("circle")
      .attr("r", PortDrawer.RADIUS)
      .attr("cx", (data, index) => this.x(index))
      .attr("cy", (data, index) => this.y(index))
  }

  filterPorts() {}

  x(index) {}

  y(index) {
    const startPosition = PortDrawer.RADIUS + PortDrawer.PADDING - this.effectSize.height/2;
    const elementSize = 2*PortDrawer.RADIUS + 2*PortDrawer.PADDING;

    return index*elementSize + startPosition;
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

  drawIn(container) {
    return super.drawIn(container)
      .call(this.generateDragBehavior());
  }

  generateDragBehavior() {
    const self = this;

    return d3.drag()
      .on("start", function(port) { self.dragStart(d3.select(this)) })
      .on("drag", function(port) { self.drag(d3.select(this), port) })
      .on("end", function(port) { self.dragEnd(d3.select(this), port) });
  }

  dragStart(element) {
    this.pedalboard.startConnecting();

    const position = PortDrawer.positionOfPortElement(element);
    this.pedalboard.edgeConnector.drawToPoint(position);
  }

  drag(element, port) {
    const elementPosition = PortDrawer.positionOfPortElement(element);

    this.pedalboard.edgeConnector.drawTo(elementPosition, this.pedalboard.mousePosition);
  }

  /** Based in http://jsfiddle.net/AkPN2/5/ */
  dragEnd(originElement, originNode) {
    this.pedalboard.endConnecting();

    const mouseCirclePosition = this.generateCirclePositionByMouse(this.pedalboard.mousePosition);

    const destinationElement = this.getPortColidedWith(mouseCirclePosition);

    if (destinationElement !== undefined && originElement !== destinationElement)
      this.pedalboard.createConnection(originElement.node(), destinationElement.node());
  }

  getPortColidedWith(mouseCirclePosition) {
    for (let destination of this.pedalboard.inputPorts.nodes()) {
      const destinationElement = d3.select(destination);
      const elementCirclePosition = this.generateCirclePositionByElement(destinationElement);

      const hasColision = this.detectColision(elementCirclePosition, mouseCirclePosition);

      if (hasColision)
        return destinationElement;
    }
  }

  generateCirclePositionByMouse(mousePosition) {
    return this.generateCirclePosition(mousePosition.x, mousePosition.y, 1);
  }

  generateCirclePositionByElement(element) {
    const position = PortDrawer.positionOfPortElement(element);
    return this.generateCirclePosition(position.x, position.y, element.attr('r'));
  }

  generateCirclePosition(cx, cy, r) {
    return { 'cx': parseInt(cx), 'cy': parseInt(cy), 'r': parseInt(r) };
  }

  detectColision(c1, c2) {
    let distance = Math.sqrt(
      Math.pow(c2.cx - c1.cx, 2) +
      Math.pow(c2.cy - c1.cy, 2)
    );

    return distance < (c1.r + c2.r);
  }
}
