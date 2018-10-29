//Grafico barras agrupada - Lucas Saraiva
//Configurações base do grafico

var svg = d3.select("svg"),
margin = {top: 40, right: 100, bottom: 100, left: 40},
width = +svg.attr("width") - margin.left - margin.right,
height = +svg.attr("height") - margin.top - margin.bottom,
g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var x0 = d3.scaleBand()
.rangeRound([0, width])
.paddingInner(0.3);

var x1 = d3.scaleBand()
.padding(0.05);

var y = d3.scaleLinear()
.rangeRound([height, 0]);

var z = d3.scaleOrdinal()
.range(["#ca0020", "#f4a582"]);


//Leitura dos dados
d3.csv("grouped.csv", function(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) d[columns[i]] = +d[columns[i]];
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);

  x0.domain(data.map(function(d) { return d.country; }));
  x1.domain(keys).rangeRound([0, x0.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { return d[key]; }); })]).nice();
  var div = d3.select("body").append("div").attr("class", "toolTip");

  g.append("g")
  .selectAll("g")
  .data(data)
  .enter().append("g")
  .attr("class","bar")
  .attr("transform", function(d) { return "translate(" + x0(d.country) + ",0)"; })
  .selectAll("rect")
  .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })
  .enter().append("rect")
  .attr("x", function(d) { return x1(d.key); })
  .attr("y", function(d) { return y(d.value); })
  .attr("width", x1.bandwidth())
  .attr("height", function(d) { return height - y(d.value); })
  .attr("fill", function(d) { return z(d.key); })
  .on("mousemove", function(d){
    div.style("left", d3.event.pageX+10+"px");
    div.style("top", d3.event.pageY-25+"px");
    div.style("display", "inline-block");
    div.html((d.key)+"<br>"+(d.value));})
    .on("mouseout", function(d){
      div.style("display", "none");
    });

    //Legendas X e Y
    g.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x0)).append("text")
    .style("text-anchor", "middle")
    .attr("x", width / 2)
    .attr("fill","#000")
    .attr("font-size", "11")
    .attr("font-weight", "bold")
    .attr("y", "50")
    .text("Countries");

    g.append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).ticks(null, "s"))
    .append("text")
    .attr("x", 5)
    .attr("y", y(y.ticks().pop()) - 15)
    .attr("dy", "0.32em")
    .attr("fill", "#000")
    .attr("font-size", "11")
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text("Enemies");

    //Variaveis
    g.append("text")
    .attr("x", width-45)
    .attr("y", -25)
    .attr("dy", "0.32em")
    .attr("font-size", "18")
    .text("Filter variables: ");

    var legend = g.append("g")
    .attr("font-family", "sans-serif")
    .attr("font-size", 10)
    .attr("text-anchor", "end")
    .selectAll("g")
    .data(keys.slice().reverse())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(0," + i * 25 + ")"; });

    legend.append("rect")
    .attr("x", width + 40)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", z)
    .attr("stroke", z)
    .attr("stroke-width",2)
    .attr("cursor", "pointer")
    .on("click",function(d) { update(d) });

    legend.append("text")
    .attr("x", width + 30)
    .attr("y", 9.5)
    .attr("dy", "0.32em")
    .attr("font-size","12")
    .text(function(d) { return d; })
    .attr("cursor", "pointer")
    .on("click",function(d) { update(d) });

    var filtered = [];

    // Atualiza as barras e faz o efeito de transicao
    function update(d) {

      if (filtered.indexOf(d) == -1) {
        filtered.push(d);
        if(filtered.length == keys.length) filtered = [];
      }
      else {
        filtered.splice(filtered.indexOf(d), 1);
      }


      var newKeys = [];
      keys.forEach(function(d) {
        if (filtered.indexOf(d) == -1 ) {
          newKeys.push(d);
        }
      })
      x1.domain(newKeys).rangeRound([0, x0.bandwidth()]);
      y.domain([0, d3.max(data, function(d) { return d3.max(keys, function(key) { if (filtered.indexOf(key) == -1) return d[key]; }); })]).nice();


      svg.select(".y")
      .transition()
      .call(d3.axisLeft(y).ticks(null, "s"))
      .duration(500);

      var bars = svg.selectAll(".bar").selectAll("rect")
      .data(function(d) { return keys.map(function(key) { return {key: key, value: d[key]}; }); })

      bars.filter(function(d) {
        return filtered.indexOf(d.key) > -1;
      })
      .transition()
      .attr("x", function(d) {
        return (+d3.select(this).attr("x")) + (+d3.select(this).attr("width"))/2;
      })
      .attr("height",0)
      .attr("width",0)
      .attr("y", function(d) { return height; })
      .duration(500);

      bars.filter(function(d) {
        return filtered.indexOf(d.key) == -1;
      })
      .transition()
      .attr("x", function(d) { return x1(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .attr("width", x1.bandwidth())
      .attr("fill", function(d) { return z(d.key); })
      .duration(500);

      legend.selectAll("rect")
      .transition()
      .attr("fill",function(d) {
        if (filtered.length) {
          if (filtered.indexOf(d) == -1) {
            return z(d);
          }
          else {
            return "white";
          }
        }
        else {
          return z(d);
        }
      })
      .duration(200);
    }
  });
