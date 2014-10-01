var jsonDataGlobal = []; //holds array of values which will be taken from backend. used for legend in d3.



$("document").ready(function(){
  createSVG(.1,"30 min",.3,"jennifer");
  createSVG(.1,"40 min",.4,"jack");
  createSVG(.1,"50 min",.5,"jill");
  createSVG(.1,"20 min",.2,"yugioh");
  //createLegend(); //create a legend
})


function createSVG(index_p,text_p,value_p,name_p)
{
      //Variable declarations for SVGs...i know its messy to put here...but aiya
      var temp = [
        {index: index_p, text: text_p, value: value_p ,name: name_p}
      ];
      jsonDataGlobal.push(temp)

      var index_ = index_p;
      var text_ = text_p;
      var value_ = value_p;
      var name_ = name_p;

      var width = 300,
      height = 300,
      radius = 600,
      spacing = .12;


      var color = d3.scale.linear()
        .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
        .interpolate(interpolateHsl);

      var arc = d3.svg.arc()
        .startAngle(0)
        .endAngle(function(d) { return d.value * 2 * Math.PI; })
        .innerRadius(function(d) { return d.index * radius; })
        .outerRadius(function(d) { return (d.index + spacing) * radius; });

      d3.select("#svgContainer").append("div")
        .attr("class","svgDiv")
        .attr("id",name_)
      d3.select("#"+name_).append("h3")
        .text(name_)

      var svg = d3.select("#"+name_).append("svg")
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


    var color = d3.scale.linear()
    .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
    .interpolate(interpolateHsl);

     function arcTween(d) {
      var i = d3.interpolateNumber(d.previousValue, d.value);
      return function(t) { d.value = i(t); return arc(d); };
    }

    function fields() {
      var now = new Date; //just messing with values
      var temp1 = [
        {index: index_, text: text_, value: value_ ,name: name_}
      ];
      return temp1;
    }
    // Avoid shortest-path interpolation.
    function interpolateHsl(a, b) {
      var i = d3.interpolateString(a, b);
      return function(t) {
        return d3.hsl(i(t));
      };
    }
}
      var color = d3.scale.linear()
          .range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
          .interpolate(interpolateHsl);

      function interpolateHsl(a, b) {
      var i = d3.interpolateString(a, b);
      return function(t) {
        return d3.hsl(i(t));
      };
    }

/*function createLegend(){
  console.log(jsonDataGlobal)
  jsonDataGlobal.forEach(function(data){
      var redColor = color(data[0].value).rgb().r;
      var greenColor = color(data[0].value).rgb().g;
      var blueColor = color(data[0].value).rgb().b;
      var dataValue = data[0].value;
      var dataText = data[0].text;
      var dataName = data[0].name;
      $("#legend-labels").append("<li id = '"+ dataName+ "'></li>");
     $("#"+dataName).text(dataName)
     $("#"+dataName).append("<span></span>")
     var backgroundColor = " rgb(" + redColor + "," + greenColor + "," + blueColor + ")";
     $("#"+dataName+" span").css("background",backgroundColor);
  })
  console.log(color(.2).rgb())

}*/