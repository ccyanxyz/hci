let width = 600,
	height = 300,
	sens = 0.25;

// set projection
let projection = d3.geo.orthographic()
	.scale(160)
	.rotate([0, 0])
	.translate([width / 4 + 100, height / 2 - 50])
	.clipAngle(90);

let path = d3.geo.path()
	.projection(projection);

let zoom = d3.behavior.zoom()
	.scaleExtent([0.5, 5])
	.center([width / 4 + 100, height / 2 - 50])
	.on("zoom", zoomed);

function zoomed() {
	d3.select("g").attr(
		"transform", 
		"translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"
	);
}

// svg
let svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("transform", function () {
		return "translate(" + 200 + "," + 0 + ")";
	})
	.call(zoom)
	.on("mousedown.zoom", null)
	.append("g");

// grid
let graticule = d3.geo.graticule();

let dataTip = d3.select("body").append("div").attr("class", "dataTip"),
	dataList = d3.select("body").append("select").attr("data", "dataset").attr("class", "styled-select blue semi-square").attr("id", "myselect");

// color band
let defs = svg.append("defs");
let linearGradient = defs.append("linearGradient")
					.attr("id", "linearColor")
					.attr("x1", "0%")
					.attr("y1", "0%")
					.attr("x2", "0%")
					.attr("y2", "100%");
let stop1 = linearGradient.append("stop")
					.attr("offset", "0%");

let stop2 = linearGradient.append("stop")
					.attr("offset", "100%");

let colorRect = svg.append("rect")
					.attr("x", 30)
					.attr("y", 30)
					.attr("width", 10)
					.attr("height", 50)
					.style("fill", d3.rgb(255, 255, 255).toString());

let minValueText = svg.append("text")
			.attr("class","valueText")
			.attr("x", 152)
			.attr("y", 112)
			.attr("dx", "-1em");

let maxValueText = svg.append("text")
			.attr("class","valueText")
			.attr("x", 174)
			.attr("y", 298)
			.attr("dx", "-2.5em");


queue()
	.defer(d3.json, "./data/geo.json")
	.defer(d3.tsv, "./data/world-country-names.tsv")
	.defer(d3.csv, "./data/processed_data.csv")
	.defer(d3.json, "./data/params.json")
	.await(ready)

let cur_data_value = "";

// main
function ready(error, world, countryData, dataset, weights) {
	let countryById = {},
		countries = topojson.feature(world, world.objects.countries).features;
	console.log(countries.length);

	countryData.forEach(function(d) {
		countryById[d.id] = d.name;
	});

	let options = ["Score", "GINI index", "happy planet index", "human development index", "world happiness report score"];

	for(let i = 0; i < options.length; ++i) {
		let value = options[i];
		let option = dataList.append("option");
		option.text(value);
		option.property("value", value);
	}

	// grid
	grid = graticule();
	svg.append("path")
		.datum(grid)
		.attr("class", "grid_path")
		.attr("d", path);

	// draw countries
	let globe = svg.selectAll("path.land")
		.data(countries)
		.enter().append("path")
		.attr("class", "land")
		.attr("d", path);
		// drag
		globe.call(d3.behavior.drag()
			.origin(function() { let r = projection.rotate(); return {x: r[0] / sens, y: -r[1] / sens}; })
			.on("drag", function() {
				let rotate = projection.rotate();
				projection.rotate([d3.event.x * sens, -d3.event.y * sens, rotate[2]]);
				svg.selectAll(".grid_path").attr("d", path);
				svg.selectAll("path.land").attr("d", path);
				svg.selectAll(".focused").classed("focused", focused = false);
			}))

		// mouse
		.on("mouseover", function(d) {
			let sel = document.getElementById("myselect");
			let key = sel.options[sel.selectedIndex].value;
			console.log("key_mouse:", key);
			let value;
			for(let i = 0; i < dataset.length; ++i) {
				if(d.id == dataset[i].id) {
					value = dataset[i][key];
				}
			}
			dataTip.text(countryById[d.id] + ":" + Number(value).toFixed(2))
				.style("left", (d3.event.pageX + 7) + "px")
				.style("top", (d3.event.pageY - 15) + "px")
				.style("display", "block")
				.style("opacity", 1);
		})
		.on("mouseout", function(d) {
			dataTip.style("opacity", 0)
				.style("display", "none");
		})
		.on("mousemove", function(d) {
			dataTip.style("left", (d3.event.pageX + 7) + "px")
				.style("top", (d3.event.pageY - 15) + "px");
		});



	cur_data = d3.select("svg").append("text")
		.datum(cur_data_value)
		.attr("class", "curdata")
		.attr("x", 120)
		.attr("y", 120)
		.text(function(d){
			return "current dataset: " + d;
		})

	// change dataset
	d3.select("select").on("change", function() {

		let key = this.value;
		console.log("key:", key);

		cur_data_value = key;

		cur_data
		.datum(cur_data_value)
		.text(function(d){
			console.log("cur_data:", d)
			return "current dataset: " + d;
		})

		let max = 0;
		let min = 10000000000000000;
		console.log(dataset);
		for(let i = 0; i < dataset.length; ++i) {
			if(dataset[i][key] == "") {
				continue;
			}
			//console.log("data:", dataset[i][key]);
			let num = Number(dataset[i][key])
			if(num < min) {
				min = num
			}
			if(num > max) {
				max = num
			}
		}
		
		let linear = d3.scale.linear()
						.domain([min, max])
						.range([0, 1]);
		
		let a = d3.rgb(0, 255, 255);
		let b = d3.rgb(0, 0, 255);
		let computeColor = d3.interpolate(a, b);

		globe.style("fill", function (d, i) {
			let id = Number(d.id);
			let value;
			for(let i = 0; i < dataset.length; ++i) {
				if(id == Number(dataset[i].id)) {
					value = dataset[i][key];
				}
			}
			let t = linear(value);
			let color = computeColor(t);
			return color.toString();
		});

		stop1.style("stop-color", computeColor(0).toString());
		stop2.style("stop-color", computeColor(1).toString());
		colorRect.style("fill", "url(#" + linearGradient.attr("id") + ")");
		minValueText.text(min.toFixed(2));
		maxValueText.text(max.toFixed(2));

		//// draw weights
		//let wei = weights[key].coef;
		//let keys = [];
		//let values = [];
		//for(let k in wei) {
			//keys.push(k);
			//values.push(Math.abs(wei[k]).toFixed(4));
		//}

		//let padding = { left: 850, top: 50, right: 50, bottom: 50 };
		//let xScale = d3.scale.ordinal()
			//.domain(d3.range(keys.length))
			//.rangeRoundBands([0, height - padding.top * 4]);
		//let yScale = d3.scale.linear()
			//.domain([0, d3.max(values)])
			//.range([0, width - padding.left - 300]);

		//let xAxis = d3.svg.axis()
			//.scale(xScale)
			//.orient("left");
		//let yAxis = d3.svg.axis()
			//.scale(yScale)
			//.orient("top");

		//svg.selectAll(".MyRect").remove();
		//svg.selectAll(".MyText").remove();
		//svg.selectAll(".axis").remove();

		//let rectPadding = 10;
		//let rects = svg.selectAll(".MyRect")
			//.data(values).enter()
			//.append("rect")
			//.attr("class", "MyRect")
			//.attr("transform", "translate(" + padding.left + "," + padding.top + ")")
			//.attr("x", 0)
			//.attr("y", function(d, i) {
				//return xScale(i);
			//})
			//.attr("height", 2 * rectPadding)
			//.attr("width", function (d) {
				//return yScale(d);
			//})
			//.style("fill", d3.rgb(100, 200, 200).toString())
			//.on("mouseover", function(d, i) {
				//dataTip.text(values[i])
					//.style("left", (d3.event.pageX + 7) + "px")
					//.style("top", (d3.event.pageY - 15) + "px")
					//.style("display", "block")
					//.style("opacity", 1);
			//})
			//.on("mouseout", function(d) {
				//dataTip.style("opacity", 0)
					//.style("display", "none");
			//})
			//.on("mousemove", function(d) {
				//dataTip.style("left", (d3.event.pageX + 7) + "px")
					//.style("top", (d3.event.pageY - 15) + "px");
			//});

		//let texts = svg.selectAll(".MyText")
			//.data(values)
			//.enter()
			//.append("text")
			//.attr("class", "MyText")
			//.attr("transform","translate(" + padding.left + "," + padding.top + ")")
			//.attr("x", 0)
			//.attr("y",function(d, i){
				//return rectPadding;
			//})
			//.attr("dx",function(d){
				//return 4 + yScale(d);
			//})
			//.attr("dy",function(d, i){
				//return rectPadding / 2 + xScale(i);
			//})
			//.text(function(d, i){
				//return keys[i];
			//});

		//svg.append("g")
		  //.attr("class","axis")
		  //.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		  //.call(xAxis)
		  //.attr("class", "axis"); 

		//svg.append("g")
		  //.attr("class","axis")
		  //.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		  //.call(yAxis)
		  /*.attr("class", "axis");*/
	});
};
