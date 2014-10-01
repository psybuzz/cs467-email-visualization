var jsonDataGlobal; //holds array of values which will be taken from backend. used for legend in d3.

var width = 960,
    height = 800,
    radius = Math.min(width, height) / 1.9,
    spacing = .09;
var color = d3.scale.linear()
    .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
    .interpolate(interpolateHsl);

var arc = d3.svg.arc()
    .startAngle(-1.6)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return d.index * radius; })
    .outerRadius(function(d) { return (d.index + spacing) * radius; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var field = svg.selectAll("g")
    .data(fields)
  .enter().append("g");

field.append("path");

field.append("text");

d3.transition().duration(0).each(tick);

d3.select(self.frameElement).style("height", height + "px");

createLegend(); //create a legend

function tick() {
  field = field
      .each(function(d) { this._value = d.value;})
      .data(fields)
      .each(function(d) { d.previousValue = this._value; });

  field.select("path")
    .transition()
      .ease("elastic")
      .attrTween("d", arcTween)
      .style("fill", function(d) { return color(d.value); });

  field.select("text")
      .attr("dy", function(d) { return d.value < .5 ? "-.5em" : "1em"; })
      .text(function(d) { return d.text; })
    .transition()
      .ease("elastic")
      .attr("transform", function(d) {
        return "rotate(" + 360 * d.value + ")"
            + "translate(0," + -(d.index + spacing / 2) * radius + ")"
            + "rotate(" + (d.value < .5 ? -90 : 90) + ")"
      });

  setTimeout(tick, 1000 - Date.now() % 1000);
}

function arcTween(d) {
  var i = d3.interpolateNumber(d.previousValue, d.value);
  return function(t) { d.value = i(t); return arc(d); };
}

function fields() {
  var now = new Date; //just messing with values
  jsonDataGlobal = [
    {index: .7, text: "20 min",value: .34,name: "jake"},
    {index: .6, text: "21 min",value: .36,name: "bob"},
    {index: .5, text: "22 min",value: .50,name: "alex"},
    {index: .4, text: "23 min",value: .21,name: "chris"},
    {index: .3, text: "24 min",value: .42,name: "jennifer"},
    {index: .2, text: "25 min",value: .52,name: "jasmine"},
    {index: .1, text: "26 min", value: .60,name: "emily"}
  ];
  return jsonDataGlobal;
}
// Avoid shortest-path interpolation.
function interpolateHsl(a, b) {
  var i = d3.interpolateString(a, b);
  return function(t) {
    return d3.hsl(i(t));
  };
}



function createLegend(){
  jsonDataGlobal.forEach(function(data){
      var redColor = color(data.value).rgb().r;
      var greenColor = color(data.value).rgb().g;
      var blueColor = color(data.value).rgb().b;
      var dataValue = data.value;
      var dataText = data.text;
      var dataName = data.name;
      $("#legend-labels").append("<li id = '"+ dataName+ "'></li>");
     $("#"+dataName).text(dataName)
     console.log($("#"+dataName +" span").text("fuck"))
     $("#"+dataName).append("<span></span>")
     var backgroundColor = " rgb(" + redColor + "," + greenColor + "," + blueColor + ")";
     $("#"+dataName+" span").css("background",backgroundColor);
  })
  console.log(color(.2).rgb())

}