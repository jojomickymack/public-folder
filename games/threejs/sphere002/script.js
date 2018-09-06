var camera, scene, renderer;
var geometry, material, mesh;
var num;

init();
animate();

function init() {
	num = 0;

	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.01, 10 );
	camera.position.z = 1;

	scene = new THREE.Scene();

	geometry = new THREE.SphereGeometry( 5, 32, 32 );
	material = new THREE.MeshBasicMaterial( { color: 0xee7600, wireframe: true } );

	mesh = new THREE.Mesh( geometry, material );
	scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { antialias: true } );

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(new THREE.Color(0x000, 1.0));

	document.body.appendChild( renderer.domElement );

}

function animate() {

	requestAnimationFrame( animate );

	mesh.rotation.x += 0.005;
	mesh.rotation.y += 0.005;

	renderer.render( scene, camera );

}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
	console.log("new window size " + window.innerWidth + " : " + window.innerHeight);
}
