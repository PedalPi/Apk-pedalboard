class Edge {
  constructor(data) {
    this.source = data.source;
    this.target = data.target;

    this.graph = null;
  }

  static generateId(connection) {
    const originElement = d3.select(connection.source);
    const destinationElement = d3.select(connection.target);

    const portOrigin = originElement.data()[0];
    const portDestination = destinationElement.data()[0];

    const effectOrigin = Effect.effectOfPort(originElement);
    const effectDestination = Effect.effectOfPort(destinationElement);

    return `Connection-`
         + `${effectOrigin.id}:${portOrigin.index}-`
         + `${effectDestination.id}:${portDestination.index}`;
  }
}
