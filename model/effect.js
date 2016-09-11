class Effect {
  constructor(id, x, y, data) {
    this.id = id;
    this.x = x;
    this.y = y;

    this.data = data;
    this.title = data.name;
  }

  dragmove(event) {
    this.x += event.dx;
    this.y += event.dy;
  }

  get input() {
    return this.data.ports.audio.input;
  }

  get output() {
    return this.data.ports.audio.output;
  }

  static effectOfPort(portElement) {
    return d3.select(portElement.node().parentElement.parentElement).data()[0];
  }
}
