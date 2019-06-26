active = false;

document.addEventListener('gest', function(gesture) {
	let ratio = 10;
	let change = -Math.round(gesture.change * ratio);
	let rotate = projection.rotate()
	let duration_frames = 18;
	let d_roll = 0;
	let d_pitch = 0;
	let d_yaw = 0;
	
	if (gesture.left) {
		console.log("left")
		d_roll = change / duration_frames;
	} else if (gesture.right) {
		console.log("right")
		d_roll = change / duration_frames;
	} else if (gesture.up) {
		console.log("up")
		d_pitch = change / duration_frames;
	} else if (gesture.down) {
		console.log("down")
		d_pitch = change / duration_frames;
	}

	if (!active) {
		active = true;
		let frame = 0;
		d3.timer(function() {
			if (frame++ == duration_frames) {
				active = false;
				return true;
			}
			projection.rotate([rotate[0] + d_roll * frame, rotate[1] + d_pitch * frame, rotate[2] + d_yaw * frame])
			svg.selectAll(".grid_path").attr("d", path);
			svg.selectAll("path.land").attr("d", path);
			svg.selectAll(".focused").classed("focused", focused = false);
		})
	}

}, false)
	
gest.start()