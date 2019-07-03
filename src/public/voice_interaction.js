function expand() {
	projection = d3.geo.orthographic()
    	.scale(10)
    	.rotate([100, 100])
	path = d3.geo.path(projection)


	 svg.selectAll(".grid_path").attr("d", path);
	 svg.selectAll("path.land").attr("d", path);
	 svg.selectAll(".focused").classed("focused", focused = false);
}

function fold() {
	projection = d3.geo.orthographic()
		.scale(160)
		.rotate([0, 0])
		//.translate([width / 4 + 100, height / 2 - 50])
		//.clipAngle(90);

	console.log("fold call")
	path = d3.geo.path(projection)
	svg.selectAll(".grid_path").attr("d", path);
	svg.selectAll("path.land").attr("d", path);
	svg.selectAll(".focused").classed("focused", focused = false);
}

if (annyang) {
	let ratio = 10;
    let change = -Math.round(60);
    let change_scale=30;
	let rotate = projection.rotate()
	let duration_frames = 18;
	let d_roll = 0;
	let d_pitch = 0;
    let d_yaw = 0;
    let d_scale = 0;

    let commands = {
        "left": function() {
            changeByVoice("left");
			d_roll = change / duration_frames;
        },
        "right": function() {
            changeByVoice("right");
			d_roll = - change / duration_frames;
        },
        "up": function() {
            changeByVoice("up");
			d_pitch = change / duration_frames;
        },
        "down": function() {
            changeByVoice("down");
			d_pitch = - change / duration_frames;
        },
        "zoom in": function() {
            changeByVoice("zoom-in");
            d_scale =change_scale / duration_frames;
        },
        "zoom out": function() {
            changeByVoice("zoom-out")
            d_scale = -change_scale / duration_frames;
        },
        "switch": function() {
            changeByVoice("switch");
			switchByVoice();
        },
		"expand": function() {
            changeByVoice("expand");
			expand();
        },
		"fold": function() {
			changeByVoice("fold");
			fold();
		}
    };

	var func = function() {
		let frame = 0;
		console.log('func call')
		d3.timer(function() {
			if (frame++ == duration_frames) {
				return true;
			}
            projection.rotate([rotate[0] + d_roll * frame, rotate[1] + d_pitch * frame, rotate[2] + d_yaw * frame])
            projection.scale([Math.min(Math.max(projection.scale()+d_scale,10),500)]);
			svg.selectAll(".grid_path").attr("d", path);
			svg.selectAll("path.land").attr("d", path);
			svg.selectAll(".focused").classed("focused", focused = false);
		})
		d_roll = 0;
		d_pitch = 0;
		d_yaw = 0;
	}

    let changeByVoice=function(signal){
        console.log("voice " + signal);
		func();
    }
    annyang.addCommands(commands);
	annyang.addCallback("error", function() {
		console.log("error");
	});

    annyang.start();
}
