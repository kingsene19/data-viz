var appearances = [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40,
    41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
    60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78,
    79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97,
    98, 99, 100, 101, 102, 103, 104, 105, 106,
  ];
  var zones = [
    0, 1, 6, 16, 50, 67, 72, 73, 77, 78, 79, 80, 81, 83, 84, 85, 86, 87, 88, 11,
    18, 31, 32, 34, 35, 36, 39, 40, 66, 96, 97, 10, 17, 24, 25, 26, 27, 28, 29, 2,
    3, 4, 5, 7, 12, 14, 15, 21, 30, 33, 37, 38, 41, 43, 44, 45, 46, 47, 48, 49,
    68, 69, 70, 71, 74, 75, 76, 89, 90, 91, 92, 94, 95, 98, 99, 100, 101, 104,
    106, 42, 63, 64, 82, 93, 105, 8, 9, 13, 19, 20, 65, 103, 22, 23, 51, 52, 53,
    54, 55, 56, 57, 58, 59, 60, 61, 62, 102,
  ];
  var influences = [
    4, 16, 41, 39, 2, 5, 12, 65, 3, 15, 66, 1, 10, 42, 102, 19, 6, 14, 103, 37,
    21, 11, 32, 34, 70, 7, 33, 38, 46, 49, 75, 9, 17, 22, 45, 56, 60, 68, 74, 81,
    20, 27, 30, 31, 44, 48, 67, 71, 77, 84, 93, 0, 13, 18, 24, 25, 29, 40, 43, 47,
    51, 52, 54, 55, 76, 80, 82, 85, 87, 88, 100, 35, 61, 72, 78, 79, 91, 92, 95,
    8, 26, 28, 36, 58, 73, 86, 90, 94, 97, 98, 104, 23, 50, 53, 57, 59, 62, 63,
    64, 69, 83, 89, 96, 99, 101, 105, 106,
  ];
  
  const margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 800,
    height = 800;
  
  const svg = d3
    .select("#visu-tp4")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  let currentPositions = appearances;
  const selectElement = document.getElementById("options");
  selectElement.addEventListener("change", function () {
    const selectedValue = selectElement.value;
    if (selectedValue === "appearances") update(appearances);
    if (selectedValue === "influences") update(influences);
    if (selectedValue === "zones") update(zones);
  });
  update(currentPositions);
  
  function createAdjacencyMatrix(nodes, edges, symetric = false) {
    var edgeHash = {};
    for (const x in edges) {
      var id = edges[x].source + "-" + edges[x].target;
      edgeHash[id] = edges[x];
    }
  
    var matrix = [];
    for (const [a, node_a] of nodes.entries()) {
      for (const [b, node_b] of nodes.entries()) {
        var grid = {
          id: node_a.id + "-" + node_b.id,
          x: parseInt(node_a.id),
          y: parseInt(node_b.id),
          weight: 0,
          name_s: node_a.character,
          name_t: node_b.character,
          zone_s: node_a.zone,
          zone_t: node_b.zone,
        };
        if (edgeHash[grid.id]) {
          grid.weight += parseInt(edgeHash[grid.id].weight);
        }
        if (symetric && edgeHash[node_b.id + "-" + node_a.id])
          grid.weight += parseInt(edgeHash[node_b.id + "-" + node_a.id].weight);
        matrix.push(grid);
      }
    }
    return matrix;
  }
  
  function findMaxWeight(matrix) {
    return Math.max(...matrix.map((grid) => grid.weight));
  }
  
  function update(newPositions) {
    const previousPositions = currentPositions;
    currentPositions = newPositions;
  
    d3.json("got_social_graph.json").then((data) => {
      const nodes = data.nodes;
      const edges = data.links;
  
      const adjacencyMatrix = createAdjacencyMatrix(nodes, edges, true);
      const maxWeight = findMaxWeight(adjacencyMatrix);
  
      const zoneScale = d3.scaleOrdinal(d3.schemeCategory10);
  
      const cellSize = Math.min(
        (width - margin.left - margin.right) / nodes.length,
        (height - margin.top - margin.bottom) / nodes.length
      );
  
      const echellexyprev = d3
        .scaleBand()
        .range([0, cellSize * nodes.length])
        .domain(previousPositions)
        .paddingInner(0.1);
  
      const echellexy = d3
        .scaleBand()
        .range([0, cellSize * nodes.length])
        .domain(currentPositions)
        .paddingInner(0.1);
  
      const matrixViz = svg.selectAll("rect").data(adjacencyMatrix, (d) => d.id);
  
      matrixViz
        .join(
          (enter) =>
            enter
              .append("rect")
              .attr("width", cellSize)
              .attr("height", cellSize)
              .attr("x", (d) => echellexyprev(d.x))
              .attr("y", (d) => echellexyprev(d.y))
              .style("stroke-width", ".2px")
              .style("fill", (d) =>
                d.zone_s === d.zone_t ? zoneScale(d.zone_s) : "#eee"
              )
              .style("opacity", (d) => (d.weight / maxWeight) * 10),
          (update) => update,
          (exit) => exit.remove()
        )
        .transition()
        .duration(1000)
        .attr("x", (d) => echellexy(d.x))
        .attr("y", (d) => echellexy(d.y));
  
      const labels = svg.selectAll(".labels").data([null]);
      labels.enter().append("g").attr("class", "labels").merge(labels);
  
      const rows = svg
        .select(".labels")
        .selectAll(".row-label")
        .data(nodes, (d) => d.id);
  
      rows
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "row-label")
              .attr("x", -5)
              .attr("y", (d, i) => echellexyprev(i) + cellSize / 2)
              .attr("text-anchor", "end")
              .attr("dominant-baseline", "middle")
              .style("font-size", "6px")
              .text((d) => d.character),
          (update) => update,
          (exit) => exit.remove()
        )
        .transition()
        .duration(1000)
        .attr("y", (d, i) => echellexy(i) + cellSize / 2);
  
      const columns = svg
        .select(".labels")
        .selectAll(".col-label")
        .data(nodes, (d) => d.id);
  
      columns
        .join(
          (enter) =>
            enter
              .append("text")
              .attr("class", "col-label")
              .attr("x", cellSize / 2)
              .attr("y", 3)
              .attr(
                "transform",
                (d, i) => `translate(${echellexyprev(i)}, 0) rotate(-90)`
              )
              .attr("text-anchor", "start")
              .attr("dominant-baseline", "middle")
              .style("font-size", "6px")
              .text((d) => d.character),
          (update) => update,
          (exit) => exit.remove()
        )
        .transition()
        .duration(1000)
        .attr("transform", (d, i) => `translate(${echellexy(i)}, 0) rotate(-90)`);
  
      svg
        .select(".labels")
        .selectAll(".row-line")
        .data(nodes)
        .join("line")
        .attr("class", "row-line")
        .attr("x1", 0)
        .attr("x2", 0)
        .attr("y1", (d, i) => echellexy(i))
        .attr("y2", (d, i) => echellexy(i) + cellSize)
        .attr("stroke", "black");
  
      svg
        .select(".labels")
        .selectAll(".col-line")
        .data(nodes)
        .join("line")
        .attr("class", "col-line")
        .attr("x1", (d, i) => echellexy(i))
        .attr("x2", (d, i) => echellexy(i) + cellSize)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("stroke", "black");
    });
  }
  