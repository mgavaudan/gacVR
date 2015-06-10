var container, stats;
var camera, scene, projector, raycaster, renderer;
var fullScreenButton = document.querySelector( '.button' );
var radius = 5000, theta = 0;

init1();
animate();

function init1() {

	// canvas

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// text info top of screen

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.innerHTML = 'GacVR';
	container.appendChild( info );

	var uploadstat = document.createElement( 'div' );
	uploadstat.style.position = 'absolute';
	uploadstat.style.top = '150px';
	uploadstat.style.width = '100%';
	uploadstat.style.size = '25px';
	uploadstat.style.textAlign = 'center';
	container.appendChild( uploadstat );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.y=250;
	
	scene.add( camera );
	

	/*********************** three.js scene *********************************/

	var light4 = new THREE.HemisphereLight();
	scene.add( light4 );

	//model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
			uploadstat.innerHTML = Math.round(percentComplete, 2) + '% downloaded';
			if ( percentComplete == 100 ) {
				uploadstat.innerHTML = "";
			};
		}
	};
	var onError = function ( xhr ) {
	};

	var loader = new THREE.OBJMTLLoader();
	loader.load( 'assets/FirstPersonExampleMap.obj', 'assets/FirstPersonExampleMap.mtl', function ( object ) {
		object.position.y =  0;
		scene.add( object );
	}, onProgress, onError );

	
	//sky

    // define path and box sides images
    var path = 'assets/';
    var sides = [ path + 'sbox_px.jpg', path + 'sbox_nx.jpg', path + 'sbox_py.jpg', path + 'sbox_ny.jpg', path + 'sbox_pz.jpg', path + 'sbox_nz.jpg' ];
 
    // load images
    var scCube = THREE.ImageUtils.loadTextureCube(sides);
    scCube.format = THREE.RGBFormat;
 
    // prepare skybox material (shader)
    var skyShader = THREE.ShaderLib["cube"];
    skyShader.uniforms["tCube"].value = scCube;
    var skyMaterial = new THREE.ShaderMaterial( {
      fragmentShader: skyShader.fragmentShader, vertexShader: skyShader.vertexShader,
      uniforms: skyShader.uniforms, depthWrite: false, side: THREE.BackSide
    });
 
    // create Mesh with cube geometry and add to the scene
    var skyBox = new THREE.Mesh(new THREE.CubeGeometry(50000, 50000, 50000), skyMaterial);
    skyMaterial.needsUpdate = true;
 
    this.scene.add(skyBox);

    //************************************************************************//


    // VR WebGL

	projector = new THREE.Projector();
	raycaster = new THREE.Raycaster();

	renderer = new THREE.WebGLRenderer();

	var threevr = new THREE.VR();
	// threevr.init({
	//   renderer: renderer,
	//   camera: camera,
	//   scene: scene
	// });

	

	renderer.setClearColor( 0x7ec0ee );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );


}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	// vrEffect.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );
    threevr.animate();
	render();
	stats.update();

}

function render() {

	// setControls();


	// find intersections

	var vector = new THREE.Vector3( 10, 10, 1 );
	projector.unprojectVector( vector, camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	// vrControls.update();
	// vrEffect.render( scene, camera );

}

function setControls() {
    
   
    var controls = {
        left: false,
        up: false,
        right: false,
        down: false
    };
    
    jQuery(document).keydown(function (e) {
        var prevent = true;
        // Update the state of the attached control to "true"
        switch (e.keyCode) {
            case 37:
                controls.left = true;
                break;
            case 38:
                controls.up = true;
                break;
            case 39:
                controls.right = true;
                break;
            case 40:
                controls.down = true;
                break;
            default:
                prevent = false;
        }
        // Avoid the browser to react unexpectedly
        if (prevent) {
            e.preventDefault();
        } else {
            return;
        }
        // Update the character's direction
        setDirection(controls);
    });

    // When the user releases a key
    jQuery(document).keyup(function (e) {
        var prevent = true;
        // Update the state of the attached control to "false"
        switch (e.keyCode) {
            case 37:
                controls.left = false;
                break;
            case 38:
                controls.up = false;
                break;
            case 39:
                controls.right = false;
                break;
            case 40:
                controls.down = false;
                break;
            default:
                prevent = false;
        }
        // Avoid the browser to react unexpectedly
        if (prevent) {
            e.preventDefault();
        } else {
            return;
        }
        // Update the character's direction
        setDirection(controls);
    });

    // On resize
    jQuery(window).resize(function () {
        // Redefine the size of the renderer
        onWindowResize();
    });
}

function setDirection(controls) {

		if(controls.left==true){
        	camera.position.x=camera.position.x-0.01;
        }
        else if(controls.right==true){
        	camera.position.x=camera.position.x+0.01;
        }
        else if(controls.up==true){
        	camera.position.z=camera.position.z-0.01;
        }
        else if(controls.down==true){
        	camera.position.z=camera.position.z+0.01;
        }

        camera.lookAt(scene.position);
}





