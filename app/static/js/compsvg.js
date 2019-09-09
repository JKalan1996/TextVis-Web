/*
	A code template for a visualization compsvg
	Author : Nan Cao (nancao.org)
*/

vis.compsvg = function() {
	
	var compsvg = {},
		container = null,
		data = {},
		size = [1024, 800],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	compsvg.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return compsvg;
	};

	compsvg.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return compsvg;
	};

	compsvg.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return compsvg;
	};

	compsvg.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return compsvg;
	};

	compsvg.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
	
	var trans = [0,0],
		scale = 1,
		zoom = d3.behavior.zoom().on("zoom", function() {
            scale = d3.event.scale;
            trans = d3.event.translate;
            container
            	.select(".canvas")
            	.attr("transform", "translate(" + (margin.left + trans[0]) + "," + (margin.top + trans[1]) + ") scale(" + scale + ")")
        });
    
	///////////////////////////////////////////////////
	// Public Function
	compsvg.layout = function() {
		
		// random layout

		var nodes = data.nodes;

		for(var i = 0; i < nodes.length; ++i) {
			nodes[i].x = Math.random() * size[0]; 
			nodes[i].y = Math.random() * size[1];
			nodes[i].r = 10;
		}
		
		return compsvg;
	};

	compsvg.render = function() {
	
		if(!container) {
			return;
		}
		
		// container.attr("width", size[0]).attr("height", size[1]);
		container.attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", "0, 0" + "," + size[0] + "," + size[1])
		
		container.selectAll(".canvas, .backrect, defs").remove();
		
		// initiate a zooming pannel
		container.append("rect")
			.attr("class", "backrect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", size[0])
			.attr("height", size[1])
			.attr("fill", 'lightgrey')
			.on('dblclick', function(d){
				trans = [0, 0];
				scale = 1;
				zoom.scale(scale).translate(trans);
				container.select(".canvas")
					.attr("transform", "translate(" + (margin.left + trans[0]) + "," + (margin.top + trans[1]) + ") scale(" + scale + ")")
			})
			.call(zoom).on("dblclick.zoom", null);
				
		// create the rendering pannel	
		container.append("g")
			.attr("class", "canvas")
			.attr("transform", "translate(" + (margin.left + trans[0]) + "," + (margin.top + trans[1]) + ") scale(" + scale + ")");
	
		return compsvg.update();
	};
		
	compsvg.update = function() {

		var canvas = container.select(".canvas");
		
		
		var vnodes = canvas.selectAll(".node")
			.data(data.nodes, function(d){return d.id});
			
			
			// remove old nodes
			vnodes.exit().remove();
			
			// update of all existing nodes
			container.selectAll(".node circle")
				.attr("cx", function(d){return d.x;})
				.attr("cy", function(d){return d.y;})
				.attr("r", function(d){return d.r});
			
			// append new nodes
			vnodes.enter().append("g")
				.attr("class", "node")
				.append("circle")
				.attr("cx", function(d){return d.x;})
				.attr("cy", function(d){return d.y;})
				.attr("r", function(d){return d.r})
				.style("fill", "blue")
				.on("mouseover", dispatch.mouseover)
				.on("mouseout", dispatch.mouseout)
				.on("click", dispatch.select);

		return compsvg;
	};
	
	///////////////////////////////////////////////////
	// Private Functions
	
	function private_function1() {
		
	};
	
	function private_function2() {
		
	};
	
	function private_function3() {
		
	};
	
	return compsvg;
};


