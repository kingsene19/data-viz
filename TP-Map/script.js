const slider = document.getElementById("slider");
const yearDisplay = document.getElementById("year");

slider.addEventListener("input", function () {
  yearDisplay.textContent = "Année : " + slider.value;
});

yearDisplay.textContent = "Année : " + slider.value;

var width = 700,
  height = 580;

var svg = d3
  .select("#map-div")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g");

var projection = d3
  .geoConicConformal()
  .center([2.454071, 46.279229])
  .scale(2800);

var color = d3
  .scaleQuantize()
  .range(["#fff5e6", "#fee391", "#fdbb84", "#fc9272", "#de2d26"]);

var tooltip = d3.select("body").append("div").attr("class", "hidden tooltip");

var path = d3.geoPath().projection(projection);

drawMap("2009");
d3.select("#slider").on("input", function () {
  drawMap(this.value.toString());
});

function drawMap(year) {
  d3.csv("tonnage.csv").then((data) => {
    var cleanData = data.filter(
      (row) => (row.L_TYP_REG_DECHET === "DEEE") & (row.ANNEE === year)
    );
    color.domain([
      d3.min(cleanData, function (d) {
        return parseFloat(d.TONNAGE_T);
      }),
      d3.max(cleanData, function (d) {
        return parseFloat(d.TONNAGE_T);
      }),
    ]);
    d3.json("departements-version-simplifiee.geojson").then((json) => {
      for (var j = 0; j < json.features.length; j++) {
        var departement = json.features[j].properties.code;
        var anneeDepChoisi = cleanData.find(function (row) {
          return row.C_DEPT === departement;
        });
        json.features[j].properties.value = anneeDepChoisi;
      }
      g.selectAll("path")
        .data(json.features)
        .join("path")
        .attr("d", path)
        .attr("class", "province")
        .style("fill", function (d) {
          var value = d.properties.value;
          if (value) {
            return color(parseFloat(value.TONNAGE_T));
          } else {
            return "#ccc";
          }
        })
        .on("mousemove", function (e, d) {
          var mousePosition = [e.x, e.y];
          if (d) {
            htmlstr =
              "<strong>" +
              d.properties.value.N_DEPT +
              "</strong><br/>" +
              d.properties.value.TONNAGE_T +
              " tonnes";
          } else {
            htmlstr = "";
          }
          tooltip
            .classed("hidden", false)
            .attr(
              "style",
              "left:" +
                mousePosition[0] +
                "px; top:" +
                (mousePosition[1] - 35) +
                "px"
            )
            .html(htmlstr);
        })
        .on("mouseout", function () {
          tooltip.classed("hidden", true);
        });
    });
  });
}
