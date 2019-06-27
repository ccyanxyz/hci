let width = window.innerWidth + 200,
	height = 800,
	sens = 0.25,
	legend = {
		x: 200,
		minY: 100,
		maxY: 200,
		rect: {
			x: 200, y:120, w:20, h: 60
		}
	},
	_dataTip = {
		dx: 7,
		dy: -15,
		dataRect: {
			w: 100, h: 20
		},
		dataText: {
			x: 10, y: 15, fill: 'black',
			w_char: 9
		}
	};


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
let svg = d3.select("#page-inner").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr("transform", function () {
		return "translate(" + 0 + "," + 0 + ")";
	})
	.call(zoom)
	.on("mousedown.zoom", null)
	.append("g");

// grid
let graticule = d3.geo.graticule();

// let dataTip = d3.select("#page-inner")
// 	.append("div")
// 	.attr("class", "dataTip")
// 	.attr("position", "fixed")

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
					.attr("x", legend.rect.x)
					.attr("y", legend.rect.y)
					.attr("width", legend.rect.w)
					.attr("height", legend.rect.h)
					.style("fill", d3.rgb(255, 255, 255).toString());

let minValueText = svg.append("text")
			.attr("class","valueText")
			.attr("x", legend.x)
			.attr("y", legend.minY)

let maxValueText = svg.append("text")
			.attr("class","valueText")
			.attr("x", legend.x)
			.attr("y", legend.maxY)


queue()
	.defer(d3.json, "/data/geo.json")
	.defer(d3.tsv, "/data/world-country-names.tsv")
	// .defer(d3.csv, "/data/processed_data.csv")
	.defer(d3.csv, "/data/data0.csv")
	.defer(d3.json, "/data/params.json")
	.await(ready)

let cur_data_value = "";

// main
function ready(error, world, countryData, dataset, weights) {

	let dataTip = d3.select("svg")
		.append("g")
		.attr('id', "dataTip")

	let dataRect = dataTip.append("rect")
		.attr('id', "dataRect")
		.attr('width', _dataTip.dataRect.w)
		.attr('height', _dataTip.dataRect.h)
		.style("fill", "white")

	let dataText = dataTip.append("text")
		.attr('id', "dataText")
		.attr('x', _dataTip.dataText.x)
		.attr('y', _dataTip.dataText.y)
		.attr('fill', _dataTip.dataText.fill)

	// let cur_data = d3.select("svg").append("text")
	// 	.datum(cur_data_value)
	// 	.attr("class", "curdata")
	// 	.attr("x", 300)
	// 	.attr("y", 120)
	// 	.text(function(d){
	// 		return "current dataset: " + d;
	// 	})

	let countryById = {},
		countries = topojson.feature(world, world.objects.countries).features;
	console.log("ready:", countries.length);

	countryData.forEach(function(d) {
		countryById[d.id] = d.name;
	});

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
			// let sel = document.getElementById("myselect");
			// let key = sel.options[sel.selectedIndex].value;
			let key = cur_data_value;
			let value;
			for(let i = 0; i < dataset.length; ++i) {
				if(d.id == dataset[i].id) {
					value = dataset[i][key];
				}
			}
			var text = countryById[d.id] + ":" + Number(value).toFixed(2);
			var w_dataRect = text.length * _dataTip.dataText.w_char;
			dataText
				.text(text);
			dataRect
				.attr('width', w_dataRect)
			dataTip
				.attr("transform", function(d){
					var tx = d3.event.offsetX + _dataTip.dx;
					var ty = d3.event.offsetY + _dataTip.dy;
					return ("translate(" + tx + ", " + ty +")");
				})
				.style("opacity", 1);
		})
		.on("mouseout", function(d) {
			dataTip.style("opacity", 0)
		})
		.on("mousemove", function(d) {
			dataTip.attr("transform", function(d){
				var tx = d3.event.offsetX + _dataTip.dx;
				var ty = d3.event.offsetY + _dataTip.dy;
				return ("translate(" + tx + ", " + ty +")");
			});
		});


	// change dataset
	d3.selectAll(".dataset").on("click", function(){
		var filepath = "/uploads/"
		var filename = this.getAttribute('value');
		console.log("filename", filename)
		var suffix = ".csv";
		var index_suf = filename.indexOf(suffix);
		var key = filename.substr(0, index_suf);
		console.log("key outside:", key);
		d3.select("#dataset_breadcrumb")
			.text(key);
		filepath += filename;
		console.log("filepath", filepath)
		var match_key = "ISO Country code";
		if (!dataset[0][key]){
			d3.csv(filepath, function(error, new_data){
				console.log("new_data", new_data)
				console.log("key number:", new_data[0][key])
				for (var i = dataset.length - 1; i >= 0; i--) {
					for (var j = new_data.length - 1; j >= 0; j--) {
						if(dataset[i][match_key] == new_data[j][match_key]){
							dataset[i][key] = new_data[j][key];
						}
					}
				}
				console.log("after key number:", dataset[0][key])
				changeDatasetByKey(key);
			})
		}else{
			changeDatasetByKey(key);
		}

	})

	function changeDatasetByKey(key) {

		// let key = this.value;
		console.log("key:", key);

		cur_data_value = key;

		// cur_data
		// .datum(cur_data_value)
		// .text(function(d){
		// 	console.log("cur_data:", d)
		// 	return "current dataset: " + d;
		// })

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

	};
};
