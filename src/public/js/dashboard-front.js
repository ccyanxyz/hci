function changeDataset(argument) {
	console.log("argument:", argument)
	// argument = "GINI index";
	let iframe = document.querySelector('iframe').contentWindow.document;
	let select = iframe.querySelector('select');
	let tag = iframe.querySelector(".curdata")
	tag.innerHTML = "fajdsfdsas";
	for (var i = select.options.length - 1; i >= 0; i--) {
		let option = select.options[i]
		if (option.value == argument){
			console.log("option:", option.value)
			option.selected = true;
			if ("createEvent" in iframe) {
				console.log("supported!")
				var evt = iframe.createEvent("HTMLEvents");
				evt.initEvent("change", false, true);
				select.dispatchEvent(evt);
			}
			else{
				console.log("not supported!");
				select.fireEvent("onchange");
			}
			break;
		}
	}
	console.log("select:", select);
}
