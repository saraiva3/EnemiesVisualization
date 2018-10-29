//Grafico todos inimigos - Lucas Saraiva
//Configuracoes basicas

var outerWidth = 960;
var outerHeight = 500;
var margin = { left: 300, top: 40, right: 200, bottom: 90 };

var barPadding = 0.2;
var barPaddingOuter = 0.1;

var xColumn = "enemies";
var yColumn = "country";

var xAxisLabelText = "Enemies";
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

var filterData={"Europe":true,"Asia":true,"America":true,"Africa":true,"Oceania":true};

//Leitura dos dados e funcao para draw no grafico
function drawChart(filterData){
  d3.csv("cit.csv", type, function(error, data) {

    xScale.domain([0, d3.max(data, function (d){ return d[xColumn]; })]);
    yScale.domain(       data.map( function (d){ return d[yColumn]; }));
    xAxisG.call(xAxis);
    yAxisG.call(yAxis);

    //Filtra as barras
    var bars = g.selectAll("rect").data(data.filter(function(d){return filterData[d.continent]==true;}));
    bars.enter().append("rect")
    .attr("height", yScale.rangeBand()).attr("class", "bar");

    bars.attr("x", 0)
    .attr("y",     function (d){ return yScale(d[yColumn]); })
    .attr("width", function (d){ return xScale(d[xColumn]); })
    .on("mousemove", function(d){
      tooltip
      .style("left", d3.event.pageX - 50 + "px")
      .style("top", d3.event.pageY - 70 + "px")
      .style("display", "inline-block")
      .html((d.country) + "<br>" + "Total:" + (d.enemies) + "<br>" );
    })
    .on("mouseout", function(d){ tooltip.style("display", "none");})
    .enter()
    .append('text')
    .attr("id", function(d){
      var name = d.country;
      name = name.replace(" ","");
      return name })
      .attr({'x':function(d) { return xScale(d[xColumn])+15; },'y':function(d,i){ return yScale(d[yColumn])+17; }})
      .text(function(d){ return d.enemies;}).style({'fill':'#000','font-size':'15px'});

      //Filtra a label no fina da barra
      for(i = 0; i < data.length; i++){
        if(filterData[data[i].continent] == false ){
          var name = data[i].country.replace(" ","")
          d3.selectAll("#"+name).style("display", "none");
        }else{
          var name = data[i].country.replace(" ","")
          d3.selectAll("#"+name).style("display", "block");
        }
      }
      bars.exit().remove();
    });
  }
  
  //Inicia o grafico
  drawChart(filterData);
  function type(d){
    d.enemies = +d.enemies;
    return d;
  }

  //Ao clicar em um dos continentes, filtra e redesenha as barras
  function reDraw(name){
    filterData[name]=!filterData[name];
    drawChart(filterData);
  }
