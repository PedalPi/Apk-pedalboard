class EffectDrawer {
  constructor(graph) {
    EffectDrawer.SIZE = {width:100, height:150};
    this.graph = graph;
  }

  draw(elements) {
    elements.attr("transform", d => this.resize(d));

    elements.exit().remove();
    const newElements = this.drawIn(elements.enter());

    return elements.merge(newElements);
  }

  resize(d) {
    return `translate(${d.x},${d.y})`;
  }

  drawIn(effect) {
    const self = this;

    const container = effect.append("g")
      .classed("effect", true)
      .attr("transform", d => this.resize(d))

      .on("mousedown", function(node) { self.mouseDown(d3.select(this), node) })
      .on("touchstart", function(node) { self.mouseDown(d3.select(this), node) })
      .on("mouseover", function(node) { node.mouseOver(d3.select(this)); })
      .on("mouseout", function(node) { node.mouseOut(d3.select(this)); })

      .call(this.generateDragBehavior());

    container.append("rect")
      .attr('class', 'back');

    const portsInput = container.append("g")
      .attr('class', 'port input');

    const portsOuput = container.append("g")
      .attr('class', 'port output');

    new PortDrawerInput(this.graph, EffectDrawer.SIZE).drawIn(portsInput);
    new PortDrawerOutput(this.graph, EffectDrawer.SIZE).drawIn(portsOuput);

    container.each(function(d) {
      self.insertTitleLinebreaks(d3.select(this), d.title);
    });

    return container;
  }

  generateDragBehavior() {
    return d3.drag()
      .on("drag", node => this.drag(node));
  }

  drag(node) {
    node.dragmove(d3.event);
    node.graph.update();
  }

  mouseDown(element, node) {
    node.graph.selectEffect(element, node);

    d3.event.stopPropagation();
  }

  /* insert svg line breaks: taken from http://stackoverflow.com/questions/13241475/how-do-i-include-newlines-in-labels-in-d3-charts */
  insertTitleLinebreaks(gEl, title) {
    const words = title.split(/\s+/g);
    const nwords = words.length;

    const el = gEl.append("text")
      .attr("text-anchor","middle")
      .attr("dy", "-" + (nwords-1)*7.5);

    for (let i = 0; i < words.length; i++) {
      const tspan = el.append('tspan').text(words[i]);
      if (i > 0)
        tspan.attr('x', 0).attr('dy', '15');
    }
  }
}
