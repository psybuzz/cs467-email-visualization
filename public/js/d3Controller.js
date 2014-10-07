var jsonDataGlobal = []; //holds array of values which will be taken from backend. used for legend in d3.



$("document").ready(function(){
	//createLegend(); create a legend
})

function createSVG(index_p,text_p,value_p,name_p,container)
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
	var id_ = 'circle-' + (++state.circleNum);

	var width = 200,
	height = 200,
	radius = 300,
	spacing = .12;


	var color = d3.scale.linear()
		.range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
		.interpolate(interpolateHsl);

	var arc = d3.svg.arc()
		.startAngle(0)
		.endAngle(function(d) { return d.value * 2 * Math.PI; })
		.innerRadius(function(d) { return d.index * radius; })
		.outerRadius(function(d) { return (d.index + spacing) * radius; });

	d3.select("#" + (container || "svgContainer")).append("div")
		.attr("class","svgDiv")
		.attr("id",id_)


	var svg = d3.select("#"+id_).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", id_+"SVG")
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

//try several contacts on one graph
function createSVGlarge(
					text_p,value_p,
					text_q,value_q,
					text_r,value_r,
					text_s,value_s,
					text_t,value_t, name_p, container)
{	
	var temp = [
		{index: 0.1, text: text_p, value: value_p ,name: name_p}
	];
	jsonDataGlobal.push(temp)

	var width = 500,
	    height = 500,
	    radius = Math.min(width, height) / 1.9,
 	    spacing = .15;

	var text_1 = text_p,
		text_2 = text_q,
		text_3 = text_r,
		text_4 = text_s,
		text_5 = text_t;

	var value_1 = value_p,
		value_2 = value_q,
		value_3 = value_r,
		value_4 = value_s,
		value_5 = value_t;
		
	var name_ = name_p;
	
	var id_ = 'circle-' + (++state.circleNum);

	var color = d3.scale.linear()
    	.range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
	    .interpolate(interpolateHsl);

	var arc = d3.svg.arc()
	    .startAngle(0)
	    .endAngle(function(d) { return d.value * 2 * Math.PI; })
  	 	.innerRadius(function(d) { return d.index * radius; })
 	    .outerRadius(function(d) { return (d.index + spacing) * radius; });

	d3.select("#" + (container || "svgContainer")).append("div")
		.attr("class","svgDiv")
		.attr("id",id_)
	d3.select("#"+id_).append("h3")
		.text(name_)

	var svg = d3.select("#"+id_).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", id_+"SVG")
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

	setInterval(function() {
  		foreground.transition()
      .duration(7500)
      .call(arcTween, d.value * 2 * Math.PI);
	}, 15000);

	function arcTween(d) {
		var i = d3.interpolateNumber(d.previousValue, d.value);
		return function(t) { d.value = i(t); return arc(d); };
	}

	function fields() {
	  var now = new Date;
	  return [
	  	{index: .78, text: text_5, value: value_5},
	    {index: .61, text: text_4, value: value_4},
	    {index: .44, text: text_3, value: value_3},
	    {index: .27, text: text_2, value: value_2},
	    {index: .10, text: text_1, value: value_1}
	  ];
	}
	
	// Avoid shortest-path interpolation.
	function interpolateHsl(a, b) {
		var i = d3.interpolateString(a, b);
		return function(t) {
			return d3.hsl(i(t));
		};
	}
}



function createLegend(jsonDataGlobal1){
	var color = d3.scale.linear()
			.range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
			.interpolate(interpolateHsl);
	function interpolateHsl(a, b) {
			var i = d3.interpolateString(a, b);
			return function(t) {
				return d3.hsl(i(t));
			};
		}
	console.log(jsonDataGlobal1)
	jsonDataGlobal1.forEach(function(data){
			console.log(data)
			var redColor = color(data.value).rgb().r;
			var greenColor = color(data.value).rgb().g;
			var blueColor = color(data.value).rgb().b;
			var dataValue = data.value;
			var dataName = data.text;
			var dataText = data.identification;
			$("#legend-labels").append("<li id = '"+ dataText+ "'></li>");
		 $("#"+dataText).text(dataName)
		 $("#"+dataText).append("<span></span>")
		 var backgroundColor = " rgb(" + redColor + "," + greenColor + "," + blueColor + ")";
		 $("#"+dataText+" span").css("background",backgroundColor);
})};


/*
	how sad....no need for this anymore
	var color = d3.scale.linear()
					.range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
					.interpolate(interpolateHsl);

			function interpolateHsl(a, b) {
			var i = d3.interpolateString(a, b);
			return function(t) {
				return d3.hsl(i(t));
			};
		}

function createLegend(){
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

}
//try some ticking...
function createSVG2(index_p,
					text_p,value_p,
					text_q,value_q,
					text_r,value_r,
					text_s,value_s,
					text_t,value_t,
					name_p,container)
{
	//Variable declarations for SVGs...i know its messy to put here...but aiya
	var temp = [
		{index: index_p, text: text_p, value: value_p ,name: name_p}
	];
	jsonDataGlobal.push(temp)

	var index_ = index_p;
	var text_ = [0,text_p,text_q,text_r,text_s,text_t];
	var value_ = [0,value_p,value_q,value_r,value_s,value_t];
	var name_ = name_p;
	var id_ = 'circle-' + (++state.circleNum);

	var width = 200,
	height = 200,
	radius = 300,
	spacing = .12;


	var color = d3.scale.linear()
		.range(["hsl(-180,50%,50%)", "hsl(180,50%,50%)"])
		.interpolate(interpolateHsl);

	var valueNum = 0;
	
	var arc = d3.svg.arc()
		.startAngle(0)
		.endAngle(function(d) { return d.value * 2 * Math.PI; })
		.innerRadius(function(d) { return d.index * radius; })
		.outerRadius(function(d) { return (d.index + spacing) * radius; });

	d3.select("#" + (container || "svgContainer")).append("div")
		.attr("class","svgDiv")
		.attr("id",id_)
	d3.select("#"+id_).append("h3")
		.text(name_)

	var svg = d3.select("#"+id_).append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", id_+"SVG")
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

	setInterval(function() {
  		foreground.transition()
      .duration(750)
      .call(arcTween, d.value * 2 * Math.PI);
	}, 12000);

	function arcTween(d) {
		var i = d3.interpolateNumber(d.previousValue, d.value);
		return function(t) { d.value = i(t); return arc(d); };
	}

	function fields() {
		var now = new Date; //just messing with values
		var temp1 = [
			{index: index_, text: text_[Math.min(valueNum,5)], value: value_[Math.min(valueNum++,5)] ,name: name_}
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
}*/