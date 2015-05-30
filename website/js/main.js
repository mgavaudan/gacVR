window.onload=function(){
  init();
  animate();
}

function init() {

  container = document.getElementById( 'container' );
  console.log(container)
  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
  camera.position.z = 100;

  scene = new THREE.Scene();

  var ambient = new THREE.AmbientLight( 0x101030 );
  scene.add( ambient );

  var directionalLight = new THREE.DirectionalLight( 0xffeedd );
  directionalLight.position.set( 0, 0, 1 );
  scene.add( directionalLight );

  var loader = new THREE.OBJLoader();
  loader.load( 'model.obj', function ( object ) {
    console.log(object);
    scene.add( object );
  } );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );

}

function animate() {

  requestAnimationFrame( animate );
  render();

}

function render() {

  renderer.render( scene, camera );

}