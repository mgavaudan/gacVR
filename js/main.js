var container, stats;
var camera, scene, projector, raycaster, renderer;
var vrEffect;
var vrControls;
var fullScreenButton = document.querySelector( '.button' );
var radius = 5000, theta = 0;

init();
animate();

function init() {

	// canvas

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	// text info top of screen

	var info = document.createElement( 'div' );
	info.style.position = 'absolute';
	info.style.top = '10px';
	info.style.width = '100%';
	info.style.textAlign = 'center';
	info.style.fontSize = '150px';
	info.style.color = 'white';
	info.style.fontFamily = "Arial,Charcoal,sans-serif";
	info.innerHTML = 'GacVR';
	container.appendChild( info );

	var uploadstat = document.createElement( 'div' );
	uploadstat.style.position = 'absolute';
	uploadstat.style.top = '350px';
	uploadstat.style.width = '100%';
	uploadstat.style.fontSize = '25px';
	uploadstat.style.textAlign = 'center';
	container.appendChild( uploadstat );

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
	camera.position.y=45;
	camera.position.x=25;
	
	scene.add( camera );
	

	/*********************** three.js scene *********************************/

	

	//lights

	// var light = new THREE.DirectionalLight( 0xffffff );
	// light.position.set( 10000, 10000, -10000 ).normalize();
	// scene.add( light );

	// var light0 = new THREE.DirectionalLight( 0xffffff );
	// light0.position.set( -10000, 10000, 10000 ).normalize();
	// scene.add( light0 );

	// var light1 = new THREE.DirectionalLight( 0xffffff, 2 );
	// light1.position.set( 10000, 10000, 10000 ).normalize();
	// scene.add( light1 );

	// var light2 = new THREE.DirectionalLight( 0xffffff );
	// light2.position.set( -10000, 10000, -10000 ).normalize();
	// scene.add( light2 );

	// var light3 = new THREE.AmbientLight( 0xffffff ); // soft white light
	// light3.position.set( 6000, 6000, 10000 ).normalize();
	// scene.add( light3 );

	var light4 = new THREE.HemisphereLight();
	scene.add( light4 );

	//model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
			uploadstat.innerHTML = Math.round(percentComplete, 2) + '% downloaded';
		}
	};
	var onError = function ( xhr ) {
	};
	// THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
	var loader = new THREE.OBJMTLLoader();
	loader.load( 'assets/Lobby.obj', 'assets/Lobby.mtl', function ( object ) {
		object.position.y = 0;
		object.rotation.x=(object.rotation.x)-90;

		scene.add( object );
		info.remove();
		uploadstat.remove();
		addLogo();
	}, onProgress, onError );


	// var texture = THREE.ImageUtils.loadTexture('assets/asphalt.jpg');
	// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
	// texture.repeat.set(10, 10);
 
	// var ground = new THREE.Mesh( new THREE.PlaneGeometry(window.innerWidth, window.innerHeight),
	// 	new THREE.MeshBasicMaterial(
	// 	{ color: this.textureGround ? 0xffffff : 0xaaaaaa, ambient: 0x333333, map:texture }
	// 	)
	// );
	// ground.rotation.x = -Math.PI/2;
	// ground.position.y = -250;
	// scene.add( ground );
	
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

	var fullScreenButton = document.querySelector( '.button' );
	fullScreenButton.onclick = function() {
		vrEffect.setFullScreen( true );
	};

	vrEffect = new THREE.VREffect(renderer, VREffectLoaded);
	vrControls = new THREE.VRControls(camera);
	// controls = new THREE.OrbitControls( camera );
 //  	controls.addEventListener( 'change', render );

	function VREffectLoaded(error) {
		if (error) {
			fullScreenButton.innerHTML = error;
			fullScreenButton.classList.add('error');
		}
	}

	var mgr = new WebVRManager(vrEffect);

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

	vrEffect.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

	requestAnimationFrame( animate );

	render();
	stats.update();

}

function render() {

	setControls();

	// find intersections

	var vector = new THREE.Vector3( 10, 10, 1 );
	projector.unprojectVector( vector, camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	vrControls.update();
	vrEffect.render( scene, camera );

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

function addLogo() {

	var logo = document.createElement( 'div' );
	logo.style.position = 'absolute';
	logo.style.bottom = '10px';
	logo.style.left = '10px';
	// logo.style.width = '100%';
	logo.style.textAlign = 'center';
	logo.style.fontSize = '30px';
	logo.style.color = 'white';
	logo.style.fontFamily = "Arial,Charcoal,sans-serif";
	logo.innerHTML = 'GacVR';
	container.appendChild( logo );
		
}





