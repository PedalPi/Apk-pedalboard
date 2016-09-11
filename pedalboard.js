"use strict";

class Pedalboard {

  constructor(svg, effects = [], connections = []) {
    this.id = effects.length;

    this.effects = effects;
    this.connections = connections;

    this.callback = {
      onConnectionAdded: (_) => {},
      onConnectionRemoved: (_) => {},
      onEffectRemoved: (_) => {}
    };

    this.selected = {
      effect: null,
      connection: null
    };

    // FIXME - Deprecated
    this.state = {
      lastKeyDown: -1
    };

    this.svg = svg;
    this.draw(svg);

    d3.select(window)
      .on("keydown", () => this.svgKeyDown())
      .on("keyup", () => this.svgKeyUp());

    window.onresize = () => this.updateWindow(svg);
  }

  draw(svg) {
    var defs = svg.append('svg:defs');
    GraphDefinitions.defineArrow(defs);

    const svgG = svg.append("g")
        .attr("id", "pedalboard");

    this.edgeConnector = new EdgeConnector(svgG);

    this.connectionsElements = svgG.append("g").attr('id', 'edges').selectAll("g");
    this.effectsElements = svgG.append("g").attr('id', 'nodes').selectAll("g");

    svg.call(this.dragPedalboardEvent());
  }

  dragPedalboardEvent() {
    return d3.zoom()
      .scaleExtent([1/2, 2])
      .on("zoom", () => this.zoomed())
      .on("start", () => d3.select('body').style("cursor", "move"))
      .on("end", () => d3.select('body').style("cursor", "auto"));
  }

  /*************************************
   * Events
   *************************************/
  svgKeyDown() {
    // make sure repeated key presses don't register for each keydown
    if (this.state.lastKeyDown !== -1)
      return;

    const BACKSPACE_KEY = 8;
    const DELETE_KEY = 46;

    this.state.lastKeyDown = d3.event.keyCode;

    switch(d3.event.keyCode) {
      case BACKSPACE_KEY:
      case DELETE_KEY:
        d3.event.preventDefault();
        this.removeSelected();
        this.update();
    }
  }

  svgKeyUp() {
    this.state.lastKeyDown = -1;
  }

  zoomed() {
    this.svg.select("#pedalboard")
      .attr("transform", d3.event.transform);

    return true;
  }

  updateWindow(svg) {
    const documentElement = document.documentElement;
    const body = document.getElementsByTagName('body')[0];

    var x = window.innerWidth || documentElement.clientWidth || body.clientWidth;
    var y = window.innerHeight|| documentElement.clientHeight|| body.clientHeight;

    svg.attr("width", x).attr("height", y);
  }

  /*************************************
   * Update
   *************************************/
  update() {
    this.updateConnections();
    this.updateEffects();
  }

  updateConnections() {
    const elements = this.connectionsElements.data(this.connections);
    const connection = this.selected.connection;

    this.connectionsElements = new ConnectionDrawer(this).draw(elements, connection);
  }

  updateEffects() {
    const elements = this.effectsElements.data(this.effects, node => node.id);
    this.effectsElements = new EffectDrawer(this).draw(elements);
  }

  /*************************************
   * Selection and desselection
   *************************************/
  selectConnection(element, connection) {
    this.deselectCurrent();

    element.classed("selected", true);

    this.selected.connection = connection;
    this.update();
  }

  selectEffect(element, effect) {
    this.deselectCurrent();

    element.classed("selected", true);

    this.selected.effect = effect;
    this.update();
  }

  deselectCurrent() {
    if (this.selected.effect !== null) {
      this.deselectEffect(this.selected.effect);
      this.selected.effect = null;

    } else if (this.selected.connection !== null) {
      this.deselectConnection(this.selected.connection);
      this.selected.connection = null;
    }
  }

  deselectEffect(effect) {
    this.effectsElements.filter(circle => circle.id === effect.id)
        .classed("selected", false);
  }

  deselectConnection(connection) {
    this.connectionsElements.filter(cd => cd === connection)
        .classed("selected", false);
  }

  /*************************************
   * Drag
   *************************************/
  startConnecting() {
    this.svg.classed('connecting', true);
  }

  endConnecting() {
    this.svg.classed('connecting', false);
  }

  /********************************
   * API methods
   ********************************/
   clear() {
     this.effects = [];
     this.connections = [];
     this.update();
   }

   addEffect(x, y, data) {
     data = {name: "port created", ports:{audio: {input:[{}, {}], output:[{}]}}}
     const effect = new Effect(this.id++, x, y, data);

     this.effects.push(effect);
     this.update();
   }

   addConnection(effectSource, portSource, effectTarget, portTarget) {
     const newEffectOutput = new Effect(0, 0, 0, effectSource);
     const newEffectInput = new Effect(0, 0, 0, effectTarget);

     const util = new ConnectionUtil(this);

     const outputSourceElement = util.elementOfPort(newEffectOutput, portSource, 'output');
     const inputTargetElement = util.elementOfPort(newEffectInput, portTarget, 'input');

     this.createConnection(outputSourceElement, inputTargetElement)
   }

   // Private
   createConnection(elementSource, elementTarget) {
     const newConnection = new Connection({source: elementSource, target: elementTarget});

     for (let connection of this.connections)
       if (connection.source === newConnection.source && connection.target === newConnection.target)
         return;

     this.connections.push(newConnection);
     this.update();
     this.callback.onConnectionAdded(newConnection.details());
   }

   removeSelected() {
     if (this.selected.effect !== null)
       this.removeSelectedEffect();
     else if (this.selected.connection !== null)
       this.removeSelectedConnection();

     this.update();
   }

  /*************************************
   * Remove
   ************************************/
  removeSelectedEffect() {
    this.removeEffect(this.selected.effect);
    this.selected.effect = null;
  }

  removeEffect(effect) {
    this.effects.splice(this.effects.indexOf(effect), 1);
    this.removeConnectionsOf(effect);
    this.callback.onEffectRemoved(effect.data);
  }

  removeConnectionsOf(effect) {
    let connectionsRemoved = this.connections.filter(
      connection => {
        const source = Effect.effectOfPort(d3.select(connection.source));
        const target = Effect.effectOfPort(d3.select(connection.target));

        return source === effect || target === effect;
      }
    );

    connectionsRemoved.map(connection => this.removeConnection(connection));
  }

  removeSelectedConnection() {
    this.removeConnection(this.selected.connection);
    this.selected.connection = null;
  }

  removeConnection(connection) {
    this.connections.splice(this.connections.indexOf(connection), 1);
    this.callback.onConnectionRemoved(connection.details());
  }

  /********************************
   * Gets
   ********************************/
  get mousePosition() {
    const mouse = d3.mouse(this.svg.select('#pedalboard').node());
    return {
      x: mouse[0],
      y: mouse[1]
    };
  }

  get inputPorts() {
    return this.svg.selectAll('.input-port');
  }

  /********************************
   * Callback
   ********************************/
  set onConnectionAdded(callback) {
    this.callback.onConnectionAdded = callback;
  }

  set onConnectionRemoved(callback) {
    this.callback.onConnectionRemoved = callback;
  }

  set onEffectRemoved(callback) {
    this.callback.onEffectRemoved = callback;
  }
}
