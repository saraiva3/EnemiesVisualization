// Grafico para unique chart - Lucas Saraiva
// Configurações basicas do grafico
var outerWidth = 960;
var outerHeight = 500;
var margin = { left: 300, top: 40, right: 200, bottom: 90 };

var barPadding = 0.2;
var barPaddingOuter = 0.1;

var xColumn = "enemies";
var yColumn = "country";

var xAxisLabelText = "Number of unique enemies";
var xAxisLabelOffset = 75;

var innerWidth  = outerWidth  - margin.left - margin.right;
var innerHeight = outerHeight - margin.top  - margin.bottom;

var svg = d3.select("#Graph_1")
.attr("width",  outerWidth)
.attr("height", outerHeight);

var tooltip = d3.select("body").append("div").attr("class", "toolTip");

var g = svg.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var xAxisG = g.append("g")
.attr("class", "x axis")
.attr("transform", "translate(0," + innerHeight + ")")

var xAxisLabel = xAxisG.append("text")
.style("text-anchor", "middle")
.attr("x", innerWidth / 2)
.attr("y", xAxisLabelOffset)
.attr("class", "label")
.text(xAxisLabelText);

var yAxisG = g.append("g")
.attr("class", "y axis");
var xScale = d3.scale.linear().range([0, innerWidth]);
var yScale = d3.scale.ordinal().rangeRoundBands([0, innerHeight], barPadding, barPaddingOuter);
var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
.ticks(5)
.tickFormat(d3.format("s"))
.outerTickSize(0);
var yAxis = d3.svg.axis().scale(yScale).orient("left")
.outerTickSize(0);

function type(d){
  d.enemies = +d.enemies;
  return d;
}

// Leitura dos dados e configuração do grafico
d3.csv("unique.csv", type, function(error, data) {

  xScale.domain([0, d3.max(data, function (d){ return d[xColumn]; })]);
  yScale.domain(       data.map( function (d){ return d[yColumn]; }));
  xAxisG.call(xAxis);
  yAxisG.call(yAxis);

  //Barra e tooltip
  var bars = g.selectAll(".bar").data(data);
  bars.enter().append("rect")
  .attr("class", "bar")
  .attr("height", yScale.rangeBand()).attr("class", "bar");


  bars.attr("x", 0)
  .attr("y",     function (d){ return yScale(d[yColumn]); })
  .attr("width", function (d){ return xScale(d[xColumn]); })
  .on("mousemove", function(d){
    tooltip
    .style("left", d3.event.pageX - 50 + "px")
    .style("top", d3.event.pageY - 70 + "px")
    .style("display", "inline-block")
    .html((d.country) + "<br>" + "Total:" + (d.enemies) + "<br>" );})
  .on("mouseout", function(d){ tooltip.style("display", "none");})
  .enter()
  .append('text')
  .attr("id","valueLabel")
  .attr({'x':function(d) { return xScale(d[xColumn])+15; },'y':function(d,i){ return yScale(d[yColumn])+17; }})
  .text(function(d){ return d.enemies;}).style({'fill':'#000','font-size':'15px'});


  d3.select("#checkAs").on("change", ascending);
  d3.select("#checkDe").on("change", descending);

  //Ordenação ascending
  function ascending() {
    var x0 = yScale.domain(data.sort(this.checked
      ? function(a, b) { return b.enemies - a.enemies; }
      : function(a, b) { return d3.ascending(a.country, b.country); })
      .map(function(d) {   return d.country; }))
      .copy();

      svg.selectAll(".bar")
      .sort(function(a, b) { return x0(a.country) - x0(b.country); });

      // Efeito de transicao
      var transition = g.transition().duration(750),
      delay = function(d, i) { return i * 50; };

      transition.selectAll(".bar")
      .delay(delay)
      .attr("y", function(d) { return x0(d.country); });
      transition.select(".y.axis")
      .call(yAxis)
      .selectAll("g")
      .delay(delay);

      //Remove as labels e recoloca eles
      d3.selectAll("#valueLabel").remove();

      bars.enter().append('text')
      .data(data)
      .attr("id","valueLabel")
      .attr({'x':function(d) { return xScale(d[xColumn])+15; },'y':function(d,i){ return yScale(d[yColumn])+17; }})
      .text(function(d){ return d.enemies;}).style({'fill':'#000','font-size':'15px'});

    }

    //Ordenação descending
    function descending() {
      var x0 = yScale.domain(data.sort(this.checked
        ? function(a, b) { return a.enemies -  b.enemies ; }
        : function(a, b) { return d3.descending(a.country, b.country); })
        .map(function(d) {   return d.country; }))
        .copy();

        svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.country) - x0(b.country); });

        var transition = g.transition().duration(750),
        delay = function(d, i) { return i * 50; };
        transition.selectAll(".bar")
        .delay(delay)
        .attr("y", function(d) { return x0(d.country); });

        transition.select(".y.axis")
        .call(yAxis)
        .selectAll("g")
        .delay(delay);

        d3.selectAll("#valueLabel").remove();

        bars.enter().append('text')
        .data(data)
        .attr("id","valueLabel")
        .attr({'x':function(d) { return xScale(d[xColumn])+15; },'y':function(d,i){ return yScale(d[yColumn])+17; }})
        .text(function(d){ return d.enemies;}).style({'fill':'#000','font-size':'15px'});
      }
    });
