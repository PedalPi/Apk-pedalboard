"use strict";

class GraphDefinitions {
  static defineArrow(defs) {
    // define arrow markers for graph links
    defs.append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', "32")
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');

    // define arrow markers for leading arrow
    defs.append('svg:marker')
      .attr('id', 'mark-end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 7)
      .attr('markerWidth', 3.5)
      .attr('markerHeight', 3.5)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');
  }

  static generateEdgeLine(node) {
    // Based in http://stackoverflow.com/a/34561659/1524997
    return node.append('svg:path')
      .attr('id', 'edgeConnector')
      .datum([{x:0, y:0}, {x:0, y:0}])
      .attr('class', 'link dragline')
      .attr('d', 'M0,0L0,0')
      .style('marker-end', 'url(#mark-end-arrow)');
  }
}
