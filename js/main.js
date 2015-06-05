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
	info.innerHTML = 'GacVR';
	container.appendChild( info );

	camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 100000 );
	

	/*********************** three.js scene *********************************/

	scene = new THREE.Scene();

	//lights

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 10000, 10000, -10000 ).normalize();
	scene.add( light );

	var light0 = new THREE.DirectionalLight( 0xffffff );
	light0.position.set( -10000, 10000, 10000 ).normalize();
	scene.add( light0 );

	var light1 = new THREE.DirectionalLight( 0xffffff, 2 );
	light1.position.set( 10000, 10000, 10000 ).normalize();
	scene.add( light1 );

	var light2 = new THREE.DirectionalLight( 0xffffff );
	light2.position.set( -10000, 10000, -10000 ).normalize();
	scene.add( light2 );

	var light3 = new THREE.AmbientLight( 0xffffff ); // soft white light
	light3.position.set( 6000, 6000, 10000 ).normalize();
	scene.add( light3 );

	var light4 = new THREE.HemisphereLight(0xFDB813, 0xffffff , 5);
	scene.add( light4 );

	//model

	var onProgress = function ( xhr ) {
		if ( xhr.lengthComputable ) {
			var percentComplete = xhr.loaded / xhr.total * 100;
			console.log( Math.round(percentComplete, 2) + '% downloaded' );
		}
	};
	var onError = function ( xhr ) {
	};
	THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
	var loader = new THREE.OBJMTLLoader();
	loader.load( 'assets/FirstPersonExampleMap.obj', 'assets/FirstPersonExampleMap.mtl', function ( object ) {
		object.position.y =  0;
		scene.add( object );
	}, onProgress, onError );

	//floor

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
	function VREffectLoaded(error) {
		if (error) {
			fullScreenButton.innerHTML = error;
			fullScreenButton.classList.add('error');
		}
	}

	renderer.setClearColor( 0x7ec0ee );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.sortObjects = false;
	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );



	//************************************************************************//

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

	theta += 0.05;

	camera.position.x = radius * Math.sin( 2*THREE.Math.degToRad( theta ) );
	camera.position.y = radius * Math.abs(Math.sin( THREE.Math.degToRad( theta ) ));
	camera.position.z = radius * Math.cos( 2*THREE.Math.degToRad( theta ) );
	camera.lookAt( scene.position );

	// find intersections

	var vector = new THREE.Vector3( 10, 10, 1 );
	projector.unprojectVector( vector, camera );

	raycaster.set( camera.position, vector.sub( camera.position ).normalize() );

	vrControls.update();
	vrEffect.render( scene, camera );

}