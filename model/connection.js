class Connection {
  constructor(data) {
    this.source = data.source;
    this.target = data.target;
  }

  details() {
    const originElement = d3.select(this.source);
    const destinationElement = d3.select(this.target);

    return {
      effectSource: Effect.effectOfPort(originElement).data,
      portSource: d3.select(this.source).data()[0],
      effectTarget: Effect.effectOfPort(destinationElement).data,
      portTarget: d3.select(this.target).data()[0]
    };
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
