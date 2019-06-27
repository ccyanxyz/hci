
if (annyang) {

  
    let commands = {
        "left": function() {
            changeByVoice("left");
            
        }
        ,
        "right": function() {
            changeByVoice("right");
        }
        ,
        "up": function() {
            changeByVoice("up");
        }
        ,
        "down": function() {
            changeByVoice("down");
        }
        ,
        "zoom in": function() {
            changeByVoice("zoom-in");
        }
        ,
        "zoom out": function() {
            changeByVoice("zoom-out")
        }
        ,
        "switch": function() {
            changeByVoice("switch");
        }
        ,
        "fold": function() {
            changeByVoice("fold");
        }
        ,
        "expand": function() {
            changeByVoice("expand");
        }
    };

    let changeByVoice=function(signal){
        console.log("voice " + signal);
    }


    

    annyang.addCommands(commands);


    annyang.start();

}