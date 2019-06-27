
if (annyang) {
	let ratio = 10;
	let change = -Math.round(60);
	let rotate = projection.rotate()
	let duration_frames = 18;
	let d_roll = 0;
	let d_pitch = 0;
	let d_yaw = 0;

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
        },
        "zoom out": function() {
            changeByVoice("zoom-out")
        },
        "switch": function() {
            changeByVoice("switch");
        },
    };

	var func = function() {
		let frame = 0;
		console.log('func call')
		d3.timer(function() {
			if (frame++ == duration_frames) {
				return true;
			}
			projection.rotate([rotate[0] + d_roll * frame, rotate[1] + d_pitch * frame, rotate[2] + d_yaw * frame])
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
