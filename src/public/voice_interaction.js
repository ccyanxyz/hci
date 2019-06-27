active_vi=false;

document.onkeydown=function(event){ 
    var e = event || window.event || arguments.callee.caller.arguments[0]; 
    if(e && e.keyCode==27){ // 按 Esc  
        //要做的事情 
        alert("按 esc"); 
    } 
    if(e && e.keyCode==113){ // 按 F2  
        //要做的事情 
        alert("按 f2"); 
    }             
    if(e && e.keyCode==13){ // enter 键 
        //要做的事情 
        zoomByVoice();
        
    }
    if (e.keyCode == 86 && e.ctrlKey) {  
        alert("你按下了ctrl+V");  
    }
 };  


if (annyang) {

    let ratio = 10;
	let change = 20;
	let rotate = projection.rotate()
	let duration_frames = 18;
	let d_roll = 0;
	let d_pitch = 0;
	let d_yaw = 0;

    let commands = {
        "left": function() {
            console.log("left")
            d_roll = change / duration_frames;
            changeByVoice();
            
        }
        ,
        "right": function() {
            console.log("right")
            d_roll = change / duration_frames;
            changeByVoice();
        }
        ,
        "up": function() {
            console.log("up")
            d_pitch = change / duration_frames;
            changeByVoice();
        }
        ,
        "down": function() {
            console.log("down")
            d_pitch = change / duration_frames;
            changeByVoice();
        }
        ,
        "zoom in": function() {

        }
        ,
        "zoom out": function() {

        }
        ,
        "switch": function() {

        }
        ,
        "fold": function() {

        }
        ,
        "expand": function() {

        }
    };

    let changeByVoice=function(){
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
    }




    annyang.addCommands(commands);


    annyang.start();

}

