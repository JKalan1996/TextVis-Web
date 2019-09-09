/*
	System Driver
	Author : Nan Cao (nancao.org)
*/
var compsvg = vis.compsvg().size([$("#mainview").width(), $("#mainview").width() * 0.6]),
	compwebgl = vis.compwebgl().size([$("#overview").width(), $("#overview").width(), $("#overview").width()]);

// layout UI and setup events
$(document).ready(function() {
	// init data list
	$.get("/list", function(d) {
		$("#dataset").empty();
		d = $.parseJSON(d);
		d.forEach(function(name) {
			$("#dataset").append(
				"<option>" + name + "</option>"
			);
		});
		display();
	});
	
	$("#tabs").tabs();
	$("#tablists").tabs();
	
	wire_events();
});

//////////////////////////////////////////////////////////////////////
// local functions
function wire_events() {
	
	// interaction interfaces (can be called by other components)
	compsvg.dispatch.on("select", function(d){
		console.log(d);
	})
	
	compwebgl.dispatch.on("select", function(e, d){
		console.log("nodes selected in 3D view - " + d);
	});
};

function display() {
	// clean contents
	d3.select("#mainview").selectAll("*").remove();
	d3.select("#overview").selectAll("*").remove();
	
	// load datasets
	var data = $('#dataset').val();
	if(!data || data == '') {
		return;
	}
	
	compsvg.container(d3.select("#mainview").append("svg"));
	compwebgl.container(document.getElementById("overview"));
	
	var url = "data/" + data;
	d3.json(url, function(error, d) {
		if (error) {
			console.log(error)
			return;
		}
		console.log(d);
		compsvg.data(d).layout().render();
		compwebgl.data(d).layout().render();
	});
};