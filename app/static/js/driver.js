/*
	System Driver
	Author : Nan Cao (nancao.org)
*/
// var compsvg = vis.compsvg().size([$("#mainview").width(), $("#mainview").width() * 0.6]),

//cookie title
var COOKIE_TITLE = "videobrowser_idvx_tongji_cookie";

var NObjectFull = ["category", "part-to-whole", "trend", "geo-spatial", "relationship"];
var NItentFull = {
	"presentation":["enter", "update", "depart"],
 	"interpretation":["emphasize", "compare", "concretize", "repeat"],
 	"reasoning":["filter", "sort", "compute", "predict", "correlate", "cluster", "encode"]
 }

var parameter = {
	'txt':'',
	'year':[2010,2019],
	'object':[],
	'intent':{'presentation': [], 'interpretation': [], 'reasoning': []},

	removeAll: function(intentItem) {
		this.intent[intentItem].splice(0, this.intent[intentItem].length);
		return true;
	},
	appendToIntent: function(item, intentItem) {
		this.intent[intentItem].push(item);
		return this.intent[intentItem].length;
	}
}
// layout UI and setup events

$(document).ready(function() {
	// init data list
	// $.get("/list", function(d) {
	// 	$("#dataset").empty();
	// 	d = $.parseJSON(d);
	// 	d.forEach(function(name) {
	// 		$("#dataset").append(
	// 			"<option>" + name + "</option>"
	// 		);
	// 	});
	// 	display();
	// });
	
	// $("#tabs").tabs();
	// $("#tablists").tabs();
	setupTooltips();
	loadData();
	setupHandlers();
	// console.log("ready");

	// wire_events();
	if(!$.cookie(COOKIE_TITLE))
		cookieSetting();
});

//////////////////////////////////////////////////////////////////////
// local functions
function wire_events() {//update
	
	// interaction interfaces (can be called by other components)
	// compsvg.dispatch.on("select", function(d){
	// 	console.log(d);
	// })
	// console.log("ready_event");
	
}

function display() { //initialize
	// clean contents
	// d3.select("#mainview").selectAll("*").remove();
	// d3.select("#overview").selectAll("*").remove();
	
	// // load datasets
	// var data = $('#dataset').val();
	// if(!data || data == '') {
	// 	return;
	// }
	
	// compsvg.container(d3.select("#mainview").append("svg"));
	// compwebgl.container(document.getElementById("overview"));
	// // var parameter={'txt':'','year':[2011,2014],'object':[],'task':{'pre':[],'inter':[],'reason':[]}}
	// var url = "list/" + data;
	// d3.json(url, function(error, d) {
	// 	if (error) {
	// 		console.log(error)
	// 		return;
	// 	}
	// 	console.log(d);
	// 	compsvg.data(d).layout().render();
	// 	compwebgl.data(d).layout().render();
	// });
}

//set cookie
function cookieSetting() {
	$.cookie(COOKIE_TITLE, true, { expires: 365, path: "/", source:true});
}

function setupTooltips() {
	$("#idvx-task").tooltip({
		selector: '[data-toggle="tooltip"]',
		container: "body",
		placement: "auto bottom"
	});

	$("#idvx-videoContainer").tooltip({
		selector: '[data-toggle="tooltip"]',
		container: ".idvx-content-row",
		placement: "auto bottom"
	});
}

//bind functions concerned to all handlers
function setupHandlers() {
	//set up the search handler
	$("#input-searchBar").on("focus", searchCSS);
	$("#input-searchBar").blur(searchCSSReturn);
	$("#input-searchBar").on("keyup", onSearchK);
	$("#idvx-searchBar-button").on("click", onSearchC);

	//set up Narrative Obejct handlers
	$("#idvx-NOpanel").on("click", ".idvx-bottom-btn", onFilterToggleNO);

	//set up Narrative Intent handlers
	$(".idvx-task-panelBody").on("click", ".idvx-collapsed-entry", onFilterToggleNI); //icons
	$("button.idvx-panel-buttonHeading").on("click", onFilterResetToggleNI); //collapse buttuns

	//set up Modals in video container
	$("#idvx-videoContainer").on("click", ".idvx-singleContainer", onVideoClick);
	$("#myModal").on("hidden.bs.modal", onModalHidden);
}


var itemsMap = {}; //filtered data
var itemsShortMap = {};
// load data from json file
function loadData() {
	$.getJSON("list/videos_data.json", function(data) {
		itemsMap = {};
		itemsShortMap = {};

		$.each(data, function(i, d) {
			// if((Object.keys(itemsShortMap)).indexOf(d.id) > -1)
			// 	return ;

			if(!itemsShortMap[d.id])
				itemsShortMap[d.id] = {"id":d.id, "name":d.name, "source":d.source, "year":d.year, "link":d.link}; //d is an Object

			//load png
			d.png = new Image(); //append a new prop(Object) to d Object
			d.png.src = "thumbnail/"+d.id+".PNG";

			itemsMap[i] = d;
		});

		configureTimeFilter();
		updateDisplayedContent();
		console.log("ready_data");
	})
}

//update the displayed content
function updateDisplayedContent() {
	var container = $("#idvx-videoContainer");
	container.empty();

	$(".tooltip").remove();

	var timeRangeMin = parameter.year[0];
	var timeRangeMax = parameter.year[1];
	var NObject = parameter.object;  //array
	var NIntent = parameter.intent;  //object
	var consistentId = {};  //if an was out or repeating

	//filter video contents according to parameter
	var eligibleItems = []; //eligible array
	$.each(itemsMap, function(i, d) {
		var ID = d.id;
		
		//initialize a identical array : [object mark, intent mark]
		if(!consistentId[ID] || consistentId[ID] != -1)
			consistentId[ID] = 1;
		else
			return ;

		//filter time range
		if((d.year < timeRangeMin) || (d.year > timeRangeMax)) {
			consistentId[ID] = -1;
			return ;
		}

		//filter search txt
		if(!isRelevantToSearch(d))
			return ;

		//filter the Narrartive Object
		if(NObject.length >= 1 && NObject.indexOf(d.object) != -1)
			return ;

		//filter the Narrative Intent
		if(NIntent[d["intent"]] && NIntent[d["intent"]].indexOf(d["sub-intent"]) != -1)
			return ;

		//ignore repeated items
		if(eligibleItems[eligibleItems.length-1] && (eligibleItems[eligibleItems.length-1]["id"] == ID))
			return ;
		
		//append the eligible item into the Object
		var itemInfo = {"id":ID, "link":d.link, "name":d.name, "year":d.year, "png":d.png, "source":d.source};
		eligibleItems.push(itemInfo);
	});

	eligibleItems.sort(function(d1, d2) {
		return d1.id - d2.id;
	});

	if(!eligibleItems.length) {
		container.append("<p class=\"text-muted\">No eligible videos found.</p>");
	} else {
		$.each(eligibleItems, function(i, d) {
			var element = $("<div class=\"idvx-singleContainer\" data-toggle=\"tooltip\" data-target=\"#myModal\">");
			element.attr("data-id", d.id);
			element.prop("title", d.name + " (" + d.year + ")");

			var image = $("<img class=\"idvx-videoImg\">");
			image.attr("src", d.png.src);

			element.append(image);
			container.append(element);
		});
	}

	updateDisplayedCount();
	// console.log("ready_filtercontent");

	//display all eligible items on screen

}


function updateDisplayedCount(){
	$("#idvx-searchBar-relativeNum").text($("#idvx-videoContainer .idvx-singleContainer").size());
}

//Search Bar
function searchCSS() {
	$(this).attr("placeholder", "");
	$(this).css("text-indent", 0);
	$("#magnify").hide();
}

function searchCSSReturn () {
	var value = $(this).val();
	value = $.trim(value);
	if(!value || value == " "){
		$(this).val("");
		$(this).attr("placeholder", "Search title");
		$(this).css("text-indent", "18px");
		$("#magnify").show();
	}
}

// Search Bar
function onSearchC() {
	parameter.txt = $("#input-searchBar").val().toLowerCase();
	$("#input-searchBar").blur();
	updateDisplayedContent();

	var txt = parameter.txt;
	// console.log(txt);
}

// Search Bar
function onSearchK(event) {
	if(event.keyCode == 13)
		$("#idvx-searchBar-button").trigger("click");
}

// var searchKeys = ['intent', 'name', 'object', 'sub-intent', 'subject', 'technique', 'visualization', 'year'];
var searchKeys = ['name'];
//if search txt in relevant values
function isRelevantToSearch(item) {
	var query = parameter.txt ? parameter.txt.trim() : null;

	//check if users do not send in search txt
	if(!query || !item)
		return true;

	for(var i = 0; i < searchKeys.length; i++) {
		if((item[searchKeys[i]].toLowerCase()).indexOf(query) != -1)
			return true;
	}

	return false;
}


// Configures the time filter
var timeFilterNum = [2010,2019];  //all corresponded years

function configureTimeFilter() {
	// console.log("ready_filter");
	
	// Update labels
	$("#left_Num").text(timeFilterNum[0]);
	// $("#right_Num").text(timeFilterNum[timeFilterEntries.length-1]);
	$("#right_Num").text(timeFilterNum[1]);
	// console.log("ready_num");
	
	// Setup the slider
	$("#timeFilter").slider({
		range: true,
		min: 201000,
		max: 201920,
		values: [201000, 201920],
		slide: function(event, ui) {

			timeFilterNum[0] = parseInt(ui.values[0]/ 100);
			timeFilterNum[1] = parseInt(ui.values[1]/ 100);

			// d3.json("",function(e,d){
			// 	compsvg.data(d).update()
			// })

			if (timeFilterNum) {
				$("#left_Num").text(timeFilterNum[0]);
				$("#right_Num").text(timeFilterNum[1]);
				parameter.year = timeFilterNum;
			}

			
		// 	console.log("ready_slider_slide");
		// },
		// stop: function(event, ui) {
			updateDisplayedContent();
			// console.log("ready_slider");
		}
	});
};


function onFilterToggleNO() {
	var element = $(this);
	
	//keywords in parameter.object should be excluded!
	var keywordOnClick = element.children(".idvx-task-subtitle").text().toLowerCase();

	if (!element.hasClass("active"))
		element.children(".true").show();
	else
		element.children(".true").hide();

	if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.object)<0))
		parameter.object.push(keywordOnClick);
	else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.object)>=0)
		parameter.object.splice($.inArray(keywordOnClick, parameter.object), 1);

	// element.children(".true").toggle();
	updateDisplayedContent();
	// console.log("onFilterToggle "+ keywordOnClick +" changed");
}


function onFilterToggleNI() {
	var element = $(this);
	var collapseContainer = element.parents(".panel-collapse").prev();

	//the names of keyword and its container
	var keywordOnClick = element.attr("name").toLowerCase();
	var keywordContainer = collapseContainer.attr("id").toLowerCase();

	if (element.hasClass("active") && ($.inArray(keywordOnClick, parameter.intent[keywordContainer])<0))
		parameter.intent[keywordContainer].push(keywordOnClick);
	else if(!element.hasClass("active") && $.inArray(keywordOnClick, parameter.intent[keywordContainer]>=0))
		parameter.intent[keywordContainer].splice($.inArray(keywordOnClick, parameter.intent[keywordContainer]), 1);

	updateDisplayedContent();
	// console.log(keywordOnClick+" in "+keywordContainer+" acted");
}

function onFilterResetToggleNI() {
	var element = $(this); //button
	var elementChildren = $(this).next().find(".idvx-collapsed-container")[0].children; //the set of small icon
	var keywordOnClick = element.attr("id");

	element.children(".true").toggle();

	//clean the array
	parameter.removeAll(keywordOnClick);

	if ($(this).next().hasClass("in")){
		//append all icons into the array
		for(var i=0; i<elementChildren.length; i++) {
			parameter.appendToIntent($(elementChildren[i]).attr("name").toLowerCase(), keywordOnClick);
			if($(elementChildren[i]).hasClass("active"))
				$(elementChildren[i]).removeClass("active");
		}
	} else {
		//light all the icons up
		$.each(elementChildren, function(i, d) {
			$(d).addClass("active");
		});
	} 

	updateDisplayedContent();
	// console.log(keywordOnClick+" has been reset.");
}

function onVideoClick(){
	var id = $(this).attr("data-id");

	if (!itemsShortMap[id])
		return ;
	
	$(this).tooltip("hide");
	
	$(this).addClass("active");
	
	displayModalDetails(id);

}

function onModalHidden(){
	$(".idvx-singleContainer.active").removeClass("active");
}

function displayModalDetails(id){
	if(!itemsShortMap[id])
		return;

	var item = itemsShortMap[id];
	$("#myModal .modalContent").empty();

	$("#idvx-modalImage").html("<img class=\"idvx-modalPng\" src=\"thumbnail/" + id + ".PNG\" >");

	$("#idvx-modalTitle").html(item.name + " (" + item.year + ")");

	$("#idvx-modalChannel").html("Source:&nbsp;&nbsp;" + item.source);

	$("#idvx-modalURL").html("URL:&nbsp;&nbsp;<a href=\"" + item.link + "\" target=\"_blank\">" + item.link + "</a>");

	// console.log("single Modal loaded.ID:" + item.id);

	$("#myModal").modal("show");
}
