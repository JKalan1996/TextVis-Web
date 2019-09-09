/*
	The diffusion visualization
	Author : Nan Cao (nancao.org)
*/
vis.compwebgl = function(){

	///////////////////////////////////////////////////
	// Public Parameters

	var compwebgl = {},
		container = null,
		size = [960, 800],
		data = [],
	 	margin = {left:10, top:10, right:10, bottom:10},
		dispatch = d3.dispatch("select", "mouseover", "mouseout");

	compwebgl.container = function(_) {
		if (!arguments.length) return container;
		container = _;
		return compwebgl;
	};

	compwebgl.data = function(_) {
		if (!arguments.length) return data;
		data = _;
		return compwebgl;
	};

	compwebgl.size = function(_) {
		if (!arguments.length) return size;
		size = _;
		return compwebgl;
	};

	compwebgl.margin = function(_) {
		if (!arguments.length) return margin;
		margin = _;
		return compwebgl;
	};

	compwebgl.dispatch = dispatch;

	///////////////////////////////////////////////////
	// Private Parameters
	var handle = -1;
	
	var group;
	var stats;
	var camera, scene, renderer, controls;
	var particleSystem, particles;

	var r = 800;
	var rHalf = r / 2;
	
	var mouse = new THREE.Vector2();
    var raycaster = new THREE.Raycaster();
    
    ///////////////////////////////////////////////////
	// Public Functions
    compwebgl.layout = function() {
		
		// random layout
		var nodes = data.nodes;

		for(var i = 0; i < nodes.length; ++i) {
			nodes[i].x = Math.random() * size[0] - size[0] / 2.0; 
			nodes[i].y = Math.random() * size[1] - size[1] / 2.0;
			nodes[i].z = Math.random() * size[2] - size[2] / 2.0;
		}
			    	    	
	    return compwebgl;
    };

	compwebgl.render = function() {
		
		camera = new THREE.PerspectiveCamera(50, size[0] / size[1], 1, 100000 );
		controls = new THREE.OrbitControls( camera, container);
		camera.position.z = 500;
		controls.addEventListener('change', repaint);
		controls.enableZoom = false;
        controls.minDistance = 50;
        controls.maxDistance = 500000;
        
        raycaster.params.Points.threshold = 20;
		
		// 1. initialize the scene graph
		scene = new THREE.Scene();
		group = new THREE.Group();
		scene.add(group);
		
		// 2. prepare geometries
		nodes = data.nodes;
		particles = new THREE.Geometry();
		material = new THREE.PointsMaterial({
            size: 20,
            transparent: true,
            sizeAttenuation: false,
            vertexColors: THREE.VertexColors,
        });
        
        particleSystem = new THREE.Points( particles, material );
		for ( var i = 0; i < nodes.length; i ++ ) {
			particles.vertices.push( new THREE.Vector3( 
				nodes[i].x, 
				nodes[i].y, 
				nodes[i].z) 
			);
			particles.colors.push( new THREE.Color(
				( nodes[i].x / size[0] ) + 0.5, 
				( nodes[i].y / size[1] ) + 0.5, 
				( nodes[i].z / size[2] ) + 0.5) 
			);
		}
		
		group.add( particleSystem );
		
		
		// 3. rendering
		renderer = new THREE.WebGLRenderer( { antialias: true } );
		renderer.setClearColor("black");
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( size[0], size[1] );
		renderer.autoClear = false;

		stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '50px';

		container.appendChild( renderer.domElement );
		container.appendChild( stats.domElement );
		container.addEventListener( 'resize', onWindowResize, false);
		container.addEventListener('mousedown', onMouseDown, false);
		
		animate();
		
		return compwebgl;
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
		
		requestAnimationFrame(animate);
        stats.update();
        controls.update();
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
        
        console.log(mouse.y);
        
        mouse.x =  ( mouse.x / renderer.domElement.width ) * 2 - 1;
        mouse.y = -( mouse.y / renderer.domElement.height ) * 2 + 1;
        
        raycaster.setFromCamera( mouse, camera );
                
        var intersects = raycaster.intersectObject( particleSystem, true );
        
        if (intersects.length > 0) {
            //console.log( 'intersects', intersects );
            // Points.js::raycast() doesn't seem to sort this correctly atm,
            // but how many points are found depends on the threshold set
            // on the raycaster as well
            intersects = intersects.sort( function( a, b ) {
                return a.distanceToRay - b.distanceToRay;
            });
            var particle = intersects[0];
            //console.log( 'got a click on particle',
            //   particle.object.userData.particles[ particle.index ].name );
            
            dispatch.select(e, data.nodes[particle.index]);

            // Change the color of this particular particle
            particle.object.geometry.colors[ particle.index ].setHex( Math.random() * 0xFFFFFF ); 
            particles.colorsNeedUpdate = true;
        }
	};

	window.addEventListener('resize', onResize, false)
	function onResize () {
	    // 设置透视摄像机的长宽比
	    camera.aspect = 1;
	    // 摄像机的 position 和 target 是自动更新的，而 fov、aspect、near、far 的修改则需要重新计算投影矩阵（projection matrix）
	    camera.updateProjectionMatrix()
	    // 设置渲染器输出的 canvas 的大小
	    renderer.setSize($("#overview").width(), $("#overview").width())
	}
			
	return compwebgl;
};

