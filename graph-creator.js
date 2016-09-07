"use strict";

class GraphCreator {

  constructor(svg, effects = [], edges = []) {
    this.consts = {
      graphClass: "graph",
      activeEditId: "active-editing",
      BACKSPACE_KEY: 8,
      DELETE_KEY: 46,
      ENTER_KEY: 13
    }

    this.id = effects.length;

    this.effects = effects;
    this.connections = edges;

    this.effects.map(effect => effect.graph = this);
    this.connections.map(connection => connection.graph = this);

    this.currentState = {
      connectionPortElementOrigin: null,
      selectedEffect: null,
      selectedConnection: null
    };

    // FIXME - Deprecated
    this.state = {
      justDragged: false,
      justScaleTransGraph: false,
      lastKeyDown: -1
    };

    this.draw(svg);
  }

  draw(svg) {
    // define arrow markers for graph links
    var defs = svg.append('svg:defs');
    GraphDefinitions.defineArrow(defs);

    this.svg = svg;
    this.svgG = svg.append("g")
        .classed(this.consts.graphClass, true);
    var svgG = this.svgG;

    // displayed when dragging between nodes
    this.dragLine = GraphDefinitions.generateEdgeLine(svgG);
    this.edgeConnector = new EdgeConnector(this, this.dragLine);

    // svg nodes and edges
    this.paths = svgG.append("g").attr('id', 'edges').selectAll("g");
    this.circles = svgG.append("g").attr('id', 'nodes').selectAll("g");

    // listen for key events
    d3.select(window)
      .on("keydown", () => this.svgKeyDown())
      .on("keyup", () => this.svgKeyUp());

    svg.on("mouseup", d => this.svgMouseUp(d));

    // listen for dragging
    var dragSvg = d3.zoom()
      .scaleExtent([1/2, 2])
      .on("zoom", () => {
        this.zoomed();
        return true;
      })
      .on("start", () => {
        var ael = d3.select("#" + this.consts.activeEditId).node();
        if (ael)
          ael.blur();
        if (d3.event.sourceEvent && !d3.event.sourceEvent.shiftKey)
          d3.select('body').style("cursor", "move");
      })
      .on("end", () => d3.select('body').style("cursor", "auto"));

    svg.call(dragSvg)/*.on("dblclick.zoom", null);*/

    // listen for resize
    window.onresize = () => this.updateWindow(svg);
  }

  svgMouseUp() {
    // dragged not clicked
    if (this.state.justScaleTransGraph)
      this.state.justScaleTransGraph = false;
  }

  svgKeyDown() {
    // make sure repeated key presses don't register for each keydown
    if (this.state.lastKeyDown !== -1)
      return;

    this.state.lastKeyDown = d3.event.keyCode;
    const selectedEffect = this.currentState.selectedEffect;
    const selectedConnection = this.currentState.selectedConnection;

    switch(d3.event.keyCode) {
      case this.consts.BACKSPACE_KEY:
      case this.consts.DELETE_KEY:
        d3.event.preventDefault();

        if (selectedEffect)
          this.removeSelectedEffect();
        else if (selectedConnection)
          this.removeSelectedConnection()

        this.update();
    }
  }

  removeSelectedEffect() {
    this.removeEffect(this.currentState.selectedEffect);
    this.currentState.selectedEffect = null;
  }

  removeEffect(effect) {
    this.effects.splice(this.effects.indexOf(effect), 1);
    this.removeConnectionsOf(effect);
  }

  removeConnectionsOf(effect) {
    let connectionsRemoved = this.connections.filter(
      connection => connection.source === effect || connection.target === effect
    );

    connectionsRemoved.map(connection => this.removeConnection(connection));
  }

  removeSelectedConnection() {
    this.removeConnection(this.currentState.selectedConnection);
    this.currentState.selectedConnection = null;
  }

  removeConnection(connection) {
    this.connections.splice(this.connections.indexOf(connection), 1);
  }

  svgKeyUp() {
    this.state.lastKeyDown = -1;
  }

  // call to propagate changes to graph
  update() {
    this.updateEdges();
    this.updateEffects();
  }

  updateEdges() {
    const elements = this.paths.data(this.connections);
    const selectedConnection = this.currentState.selectedConnection;

    this.paths = new ConnectionDrawer().draw(elements, selectedConnection);
  }

  updateEffects() {
    const elements = this.circles.data(this.effects, node => node.id);
    this.circles = new EffectDrawer(this).draw(elements);
  }

  zoomed() {
    this.state.justScaleTransGraph = true;
    d3.select("." + this.consts.graphClass)
      .attr("transform", d3.event.transform);
  }

  updateWindow(svg) {
    const documentElement = document.documentElement;
    const body = document.getElementsByTagName('body')[0];

    var x = window.innerWidth || documentElement.clientWidth || body.clientWidth;
    var y = window.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    svg.attr("width", x).attr("height", y);
  }


  hasRequestCreationConnection() {
    return this.currentState.connectionPortElementOrigin != null;
  }

  createConnection(origin, destination) {
    const newConnection = new Edge({source: origin, target: destination});
    newConnection.graph = this;

    for (let connection of this.connections)
      if (connection.source === newConnection.source && connection.target === newConnection.target)
        return;

    this.connections.push(newConnection);
    this.update();
  }

  /*************************************
   * Selection
   *************************************/
  selectConnection(element, connection) {
    this.removeCurrentSelection();

    element.classed(Node.SELECTED_CLASS, true);

    this.currentState.selectedConnection = connection;
    this.update();
  }

  selectEffect(element, effect) {
    this.removeCurrentSelection();

    element.classed(Node.SELECTED_CLASS, true);

    this.currentState.selectedEffect = effect;
    this.update();
  }

  removeCurrentSelection() {
    if (this.currentState.selectedEffect !== null) {
      this.removeSelectionOfEffect(this.currentState.selectedEffect);
      this.currentState.selectedEffect = null;

    } else if (this.currentState.selectedConnection !== null) {
      this.removeSelectionOfConnection(this.currentState.selectedConnection);
      this.currentState.selectedConnection = null;
    }
  }

  removeSelectionOfEffect(effect) {
    this.circles.filter(circle => circle.id === effect.id)
        .classed(Node.SELECTED_CLASS, false);
  }

  removeSelectionOfConnection(connection) {
    this.paths.filter(cd => cd === connection)
        .classed(Node.SELECTED_CLASS, false);
  }

  /********************************
   *
   ********************************/
   clear() {
     this.effects = [];
     this.connections = [];
     this.update();
   }

   addEffect(x, y) {
     const effect = new Effect(this.id++, x, y, {name: "port created", ports:{audio: {input:[{}, {}], output:[{}]}}});
     effect.graph = this;

     this.effects.push(effect);
     this.update();
   }

   removeSelected() {
     if (this.currentState.selectedEffect !== null)
       this.removeSelectedEffect();
     else if (this.currentState.selectedConnection !== null)
       this.removeSelectedConnection();

     this.update();
   }
}
