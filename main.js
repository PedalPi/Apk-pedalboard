"use strict";

const effect2 = {
  "name": "GxReverb-Stereo2",
  "label": "GxReverb-Stereo2",
  "ports": {
    "audio": {
      "output": [
        {
          "name": "Out",
          "shortName": "Out",
          "symbol": "out",
          "index": 5
        },
        {
          "name": "Out1",
          "shortName": "Out1",
          "symbol": "out1",
          "index": 6
        }
      ],
      "input": [
        {
          "name": "In",
          "shortName": "In",
          "symbol": "in",
          "index": 7
        },
        {
          "name": "In1",
          "shortName": "In1",
          "symbol": "in1",
          "index": 8
        }
      ]
    }
  }
};

const effect = {
  "name": "GxReverb-Stereo",
  "label": "GxReverb-Stereo",
  "ports": {
    "audio": {
      "output": [
        {
          "name": "Out",
          "shortName": "Out",
          "symbol": "out",
          "index": 5
        },
        {
          "name": "Out1",
          "shortName": "Out1",
          "symbol": "out1",
          "index": 6
        },
        {
          "name": "Out2",
          "shortName": "Out2",
          "symbol": "out2",
          "index": 6
        }
      ],
      "input": [
        {
          "name": "In",
          "shortName": "In",
          "symbol": "in",
          "index": 7
        },
        {
          "name": "In1",
          "shortName": "In1",
          "symbol": "in1",
          "index": 8
        }
      ]
    }
  }
};

var pedalboard;

function windowSize() {
  var docEl = document.documentElement,
      bodyEl = document.getElementsByTagName('body')[0];

  return {
    width: window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
    height: window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight
  }
}

function initialize(d3) {
  const size = windowSize();

  var xLoc = size.width/2 - 25,
      yLoc = 100;

  // initial node data
  const effects = [
    new Effect(0, 100, 150, effect),
    new Effect(1, xLoc, yLoc, effect2),
    new Effect(2, xLoc, yLoc + 200, effect)
  ];

  var svg = d3.select("body")
    .append("svg")
    .attr("width", size.width)
    .attr("height", size.height);

  pedalboard = new Pedalboard(svg, effects, []);
  pedalboard.onConnectionAdded = (connection) => console.log(connection);
  pedalboard.onConnectionRemoved = (connection) => console.log(connection);
  pedalboard.onEffectRemoved = (effect) => console.log(effect);
  pedalboard.update();

  document.querySelector("#add").onclick = () => pedalboard.addEffect(200, 200);
  document.querySelector("#remove").onclick = () => pedalboard.removeSelected();
}

window.onload = () => initialize(window.d3);
