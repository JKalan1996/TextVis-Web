/*
	The diffusion visualization
	Author : Nan Cao (nancao.org)
*/
vis.comp3d = function(){

	///////////////////////////////////////////////////
	// Public Parameters

	var comp3d = {},
		container = null,
		size = [960, 800],
		data = [],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	comp3d.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return comp3d;
	};

	comp3d.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return comp3d;
	};

	comp3d.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return comp3d;
	};

	comp3d.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return comp3d;
	};

	comp3d.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
	var handle = -1;
	
	var group;
	var stats;
	var camera, scene, renderer, controls;
	var points = [];

	var r = 800;
	var rHalf = r / 2;
	
	var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    
    ///////////////////////////////////////////////////
	// Public Functions
    comp3d.layout = function() {
		
		// random layout
		var nodes = data.nodes;

		for(var i = 0; i < nodes.length; ++i) {
			nodes[i].x = Math.random() * size[0] - size[0] / 2.0; 
			nodes[i].y = Math.random() * size[1] - size[1] / 2.0;
			nodes[i].z = Math.random() * size[2] - size[2] / 2.0;
		}
			    	    	
	    return comp3d;
    };

	comp3d.render = function() {
		
		var geometry = null,
			mertial = null,
			positions,
			nodes,
			colors,
			r = 800,
			trajectory;
		
		camera = new THREE.PerspectiveCamera( 45, size[0] / size[1], 1, 1000 );
		controls = new THREE.OrbitControls( camera, container);
		camera.position.z = 500;
		controls.addEventListener('change', repaint);
		controls.enableZoom = false;
        controls.minDistance = 50;
        controls.maxDistance = 500000;
		
		// 1. initialize the scene graph
		scene = new THREE.Scene();
		group = new THREE.Group();
		scene.add(group);
		
		// 2. prepare geometries
		nodes = data.nodes;
		positions = new Float32Array( nodes.length * 3);
		colors = new Float32Array( nodes.length * 3);
		for ( var i = 0; i < nodes.length; i ++ ) {

			// positions
			positions[ i * 3 ] 		= nodes[i].x;
			positions[ i * 3 + 1 ] 	= nodes[i].y;
			positions[ i * 3 + 2 ] 	= nodes[i].z;

			// colors
			colors[ i * 3 ] 	= ( nodes[i].x / size[0] ) + 0.5;
			colors[ i * 3 + 1 ] = ( nodes[i].y / size[1] ) + 0.5;
			colors[ i * 3 + 2 ] = ( nodes[i].z / size[2] ) + 0.5;
		}
		geometry = new THREE.BufferGeometry();
		material = new THREE.PointsMaterial({ vertexColors: THREE.VertexColors, size: 10 });
		geometry.addAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
		geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
		points = new THREE.Points( geometry, material );
		group.add( points );
		
		
		// 3. rendering
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( size[0], size[1] );
		
		renderer.gammaInput = true;
		renderer.gammaOutput = true;

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '50px';

		container.appendChild( renderer.domElement );
		container.appendChild( stats.domElement );
		container.addEventListener( 'resize', onWindowResize, false );
		container.addEventListener('mousedown', onMouseDown, false);
		
/*
		if(handle != -1)
			clearInterval(handle);
		
		handle = setInterval(function(){
			repaint();
		}, 30);
*/	
		animate();
		
		return comp3d;
	};
			
	///////////////////////////////////////////////////
	// Private Functions	
	function repaint() {
/*
		var time = Date.now() * 0.001;
		group.rotation.y = time * 0.1;
*/
		
		renderer.render( scene, camera );
	};
	
	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		stats.update();
		repaint();
	};
	
	function onWindowResize() {
		camera.aspect = size[0] / size[1];
		camera.updateProjectionMatrix();
		renderer.setSize( size[0], size[1]);
		repaint()
	};
	
	function onMouseDown(e) {
		e.preventDefault();
	    
	    mouse.x =  e.clientX - renderer.domElement.offsetLeft;
        mouse.y =  e.clientY - renderer.domElement.offsetTop;
        
        mouse.x =  ( mouse.x / renderer.domElement.width  ) * 2 - 1;
        mouse.y = -( mouse.y / renderer.domElement.height ) * 2 + 1;
	    
	    raycaster.setFromCamera( mouse, camera );
	    raycaster.params.Points.threshold = 10;
	    
	    var intersects = raycaster.intersectObject( points, true );
	    
		console.log(intersects);
	    
	    if (intersects.length > 0) {
	        //console.log( 'intersects', intersects );
	        // Points.js::raycast() doesn't seem to sort this correctly atm,
	        // but how many points are found depends on the threshold set
	        // on the raycaster as well
	        intersects = intersects.sort( function( a, b ) {
	            return a.distanceToRay - b.distanceToRay;
	        });
	        var particle = intersects[0];
	        console.log( 'got a click on particle', data.nodes[particle.index]);
	
/*
	        // Change the color of this particular particle
	        particle.object.geometry.colors[ particle.index ].setHex( Math.random() * 0xFFFFFF ); 
	        particles.colorsNeedUpdate = true;
*/
	    }
	};
			
	return comp3d;
};

