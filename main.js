"use strict";

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

function teste(d3) {
  var docEl = document.documentElement,
      bodyEl = document.getElementsByTagName('body')[0];

  var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
      height =  window.innerHeight|| docEl.clientHeight|| bodyEl.clientHeight;

  var xLoc = width/2 - 25,
      yLoc = 100;

  // initial node data
  var nodes = [new Effect(0, 100, 150, effect),
               new Effect(1, xLoc, yLoc, effect),
               new Effect(2, xLoc, yLoc + 200, effect)];

  var edges = [];//new Edge({source: nodes[1], target: nodes[0]})];

  var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

  var graph = new GraphCreator(svg, nodes, edges);
  graph.update();

  document.querySelector("#add").onclick = () => graph.addEffect(200, 200);
  document.querySelector("#remove").onclick = () => graph.removeSelected();
}

window.onload = () => {
  teste(window.d3);
}
