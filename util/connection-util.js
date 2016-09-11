class ConnectionUtil {
  constructor(pedalboard) {
    this.pedalboard = pedalboard
  }

  elementOfPort(effect, port, type) {
    const effectElement = this.elementOfEffect(effect);
    const portsElements = effectElement.querySelectorAll(`.${type}-port`);

    return this.getPortInPortElements(port, portsElements);
  }

  elementOfEffect(effect) {
    const idEffect = this.indexOf(effect);
    return this.pedalboard.effectsElements.nodes()[idEffect];
  }

  indexOf(effect) {
    let id = 0;
    for (let otherEffect of this.pedalboard.effects) {
      if (effect.data == otherEffect.data)
        return id;

      id += 1;
    }
  }

  getPortInPortElements(port, portElements) {
    for (let element of portElements)
      if (port == d3.select(element).data()[0])
        return element;
  }
}
