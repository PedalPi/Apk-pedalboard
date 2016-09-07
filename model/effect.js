class Effect {
  constructor(id, x, y, data) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.data = data;
    this.title = data.name;
    this.graph = null;
  }

  dragmove(event) {
    this.x += event.dx;
    this.y += event.dy;
  }

  mouseOver(element) {
    if (this.graph.hasRequestCreationConnection())
      element.classed(Node.CONNECT_CLASS, true);
  }

  mouseOut(element) {
    element.classed(Node.CONNECT_CLASS, false);
  }

  get input() {
    return this.data.ports.audio.input;
  }

  get output() {
    return this.data.ports.audio.output;
  }
}

Node.CONNECT_CLASS = 'connect-node';
Node.SELECTED_CLASS = 'selected'
