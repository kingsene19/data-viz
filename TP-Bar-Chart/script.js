import * as d3 from "https://cdn.skypack.dev/d3@7.6.1";

var w = 800,
h = 400,

barw = w / 275,

overlay = d3.select(".bars")
            .append("div")
            .attr("class","overlay")
            .style("opacity",0),

tooltip= d3.select(".bars")
           .append("div")
           .attr("id","tooltip")
           .style("opacity",0),

svgCont=d3.select(".bars")
          .append("svg")
          .attr("width", w + 100)
          .attr("height", h + 60);

d3.json("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json").then(data => {
  svgCont
      .append('text')
      .attr('x', -200)
      .attr('y', 80)
      .attr('transform', "rotate(-90)")
      .text('Gross Domestic Product');

   svgCont
      .append('text')
      .attr('x', w / 2 + 120)
      .attr('y', h + 40)
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('class', 'info'); 
  
  var years = data.data.map(item => {
    var quarter;
    var temp = item[0].substring(5,7);
    if(temp === "01"){
       quarter = "Q1";
    }
    else if(temp === "04"){
       quarter = "Q2";
    }
    else if(temp === "07"){
       quarter = "Q3";
    }
    else if(temp === "10"){
       quarter = "Q4";
    }
    return item[0].substring(0,4) + " " + quarter; 
  });
  
 var yearsDate=data.data.map(item => {
    return new Date(item[0]);
  });
  
 var tMax=new Date(d3.max(yearsDate));
 tMax.setMonth(tMax.getMonth() + 3);
  
 var xScale=d3.scaleTime()
              .domain([d3.min(yearsDate),tMax])
              .range([0,w]);
  
  var xAxis=d3.axisBottom(xScale);
  svgCont.append("g")
     .call(xAxis)
     .attr("id","x-axis")
     .attr("transform","translate(60, 400)");
  
 var gdp=data.data.map(item => {
   return item[1];
 })
 
 var scale=d3.scaleLinear().domain([0,d3.max(gdp)]).range([0,h]);
 var yscale=d3.scaleLinear().domain([0,d3.max(gdp)]).range([h,0]);
 
 var yAxis=d3.axisLeft(yscale)
  svgCont.append("g")
     .call(yAxis)
     .attr("id","y-axis")
     .attr('transform','translate(60, 0)');
  
  d3.select("svg").selectAll("rect")
     .data(gdp)
     .enter()
     .append("rect")
     .attr('data-date',(d, i) => data.data[i][0])
     .attr('data-gdp',(d, i) => data.data[i][1])
     .attr('class', 'bar')
     .attr("x", (d,i) => xScale(yearsDate[i]))
     .attr("y", d => h - scale(d))
     .attr("width",  barw)
     .attr("height", d => scale(d))
     .attr("transform", "translate(60,0)")
     .attr("fill","#33adff")
     .attr("index",(d,i) => i)
     .on("mouseover",function (event,d){
    var i = this.getAttribute("index");
    
    overlay.transition().duration(0)
    .style("width", barw + "px")
    .style("height", scale(d) + "px")
    .style("top", h - scale(d) + "px")
    .style("left", i * barw + "px")
    .style("transform","translateX(60px)")
    .style("opacity", 0.9);
    
    tooltip.transition().duration(200)
    .style("opacity",0.9);
    
    tooltip.html(years[i] + "<br>" + '$' +
   gdp[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
              ' Billion')
    .attr("data-date", data.data[i][0])
    .style("top",h - 100 + "px")
    .style("left", i * barw + 10 + "px" )
    .style("transform","translateX(60px)")
    
  })
.on('mouseout', () => {
        tooltip.transition().duration(200).style('opacity', 0);
        overlay.transition().duration(200).style('opacity', 0);
 });
 
});