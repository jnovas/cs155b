
/*
Game 0
This is a ThreeJS program which implements a simple game
The user moves a cube around the board trying to knock balls into a cone

*/


	// First we declare the variables that hold the objects we need
	// in the animation code
	var scene, renderer;  // all threejs programs need these
	var camera, avatarCam, edgeCam;  // we have two cameras in the main scene
	// here are some mesh objects ...

	var cone, wall;
	var npc;
	var avatar;

	var startScene, startCamera;
	var endScene, endCamera, endText;

	var controls =
	     {fwd:false, bwd:false, left:false, right:false,
				speed:10, fly:false, reset:false,
		    camera:camera}

	var gameState =
	     {score:0, health:10, scene:'start', camera:'none' }


	// Here is the main game control
  init(); //
	initControls();
	animate();  // start the animation loop!


	/**
	  To initialize the scene, we initialize each of its components
	*/
	function init(){
      initPhysijs();
			scene = initScene();
			createStartScene();
			// createLoseScene();
			// createEndScene();
			initRenderer();
			createMainScene();
	}

	function createStartScene() {
		startScene = initScene();
		initTextMesh();

		var light = createPointLight();
		light.position.set(0,20,20);
		startScene.add(light);

		startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
		startCamera.position.set(0,0,10);
		startCamera.lookAt(0,0,0);
	}

	function initTextMesh(){
		var loader = new THREE.FontLoader();
		loader.load( '/fonts/helvetiker_regular.typeface.json',
								 createTextMesh);
		console.log("preparing to load the font");
	}

		/*
		  once the font has been loaded, this uses it to create a textGeometry
			object, and then uses that to make the textMesh which it can add to
			the scene.
		*/
		function createTextMesh(font) {
			var textGeometry =
				new THREE.TextGeometry( 'Press P to begin',
						{
							font: font,
							size: 1,
							height: 0.2,
							curveSegments: 12,
							bevelEnabled: true,
							bevelThickness: 0.01,
							bevelSize: 0.08,
							bevelSegments: 5
						}
					);

			var textMaterial =
				new THREE.MeshLambertMaterial( { color: 0xaaaaff } );

			textMesh =
				new THREE.Mesh( textGeometry, textMaterial );

			// center the text mesh
			textMesh.translateX(-4);

			startScene.add(textMesh);

			console.log("added textMesh to scene");
		}

		function createLoseScene() {
			loseScene = initScene();
			initLoseTextMesh();

			var light = createPointLight();
			light.position.set(0,20,20);
			loseScene.add(light);

			loseCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			loseCamera.position.set(0,0,10);
			loseCamera.lookAt(0,0,0);
		}

		function initLoseTextMesh(){
			var loader = new THREE.FontLoader();
			loader.load( '/fonts/helvetiker_regular.typeface.json',
									 createLoseTextMesh);
			console.log("preparing to load the font");
		}

			/*
				once the font has been loaded, this uses it to create a textGeometry
				object, and then uses that to make the textMesh which it can add to
				the scene.
			*/
			function createLoseTextMesh(font) {
				var textGeometry =
					new THREE.TextGeometry( 'You lost - press r to restart',
							{
								font: font,
								size: 1,
								height: 0.2,
								curveSegments: 12,
								bevelEnabled: true,
								bevelThickness: 0.01,
								bevelSize: 0.08,
								bevelSegments: 5
							}
						);

				var textMaterial =
					new THREE.MeshLambertMaterial( { color: 0xaaaaff } );

				textMesh =
					new THREE.Mesh( textGeometry, textMaterial );

				// center the text mesh
				textMesh.translateX(-4);

				loseScene.add(textMesh);

				console.log("added textMesh to scene");
			}

		function createEndScene(){
			endScene = initScene();
			endText = createSkyBox('youwon.png',10);
			//endText.rotateX(Math.PI);
			endScene.add(endText);
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			endScene.add(light1);

			endCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			endCamera.position.set(0,50,1);
			endCamera.lookAt(0,0,0);

		}


	function createMainScene(){
      // setup lighting
			var light1 = createPointLight();
			light1.position.set(0,200,20);
			scene.add(light1);
			var light0 = new THREE.AmbientLight( 0xffffff,0.25);
			scene.add(light0);

			// create main camera
			camera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
			camera.position.set(0,50,0);
			camera.lookAt(0,0,0);



			// create the ground and the skybox
			var ground = createGround('grass.png');
			scene.add(ground);
			var skybox = createSkyBox('sky.jpg',1);
			scene.add(skybox);

			// create the avatar
			avatarCam = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 0.1, 1000 );
			createMonkeyAvatar();
			gameState.camera = avatarCam;

      edgeCam = new THREE.PerspectiveCamera( 120, window.innerWidth / window.innerHeight, 0.1, 1000 );
      edgeCam.position.set(20,20,10);


			addBalls();

			cone = createConeMesh(4,6);
			cone.position.set(10,3,7);
			scene.add(cone);

			npc = createBoxMesh2(0x0000ff,1,2,4);
			npc.position.set(randN(20)+15,30,randN(20)+15);
      npc.addEventListener('collision',function(other_object){
        if (other_object==avatar){
          gameState.health--;
					if(gameState.score == 0) {
						gameState.scene='youlose';
					}
					npc.__dirtyPosition = true;
					npc.position.set(randN(50),10,randN(50));
        }
      })
			scene.add(npc);

      wall = createWall(0xffaa00,20,3,1);
      wall.position.set(10,0,10);
      scene.add(wall);
	}


	function randN(n){
		return Math.random()*n;
	}




	function addBalls(){
		var numBalls = 20;


		for(i=0;i<numBalls;i++){
			var ball = createBall();
			ball.position.set(randN(20)+15,30,randN(20)+15);
			scene.add(ball);

			ball.addEventListener( 'collision',
				function( other_object, relative_velocity, relative_rotation, contact_normal ) {
					if (other_object==avatar){
						console.log("ball hit the avatar");
						soundEffect('good.wav');
						gameState.score += 1;  // add one to the score
						if (gameState.score==numBalls) {
							gameState.scene='youwon';
						}
						if(gameState.score <= 0) {
							gameState.scene='youlose';
						}
						// make the ball drop below the scene ..
						// threejs doesn't let us remove it from the schene...
						this.position.y = this.position.y - 100;
						this.__dirtyPosition = true;
					}
          else if (other_object == cone){
            gameState.health ++;
          }
				}
			)
		}
	}



	function playGameMusic(){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/loop.mp3', function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( true );
			sound.setVolume( 0.05 );
			sound.play();
		});
	}

	function soundEffect(file){
		// create an AudioListener and add it to the camera
		var listener = new THREE.AudioListener();
		camera.add( listener );

		// create a global audio source
		var sound = new THREE.Audio( listener );

		// load a sound and set it as the Audio object's buffer
		var audioLoader = new THREE.AudioLoader();
		audioLoader.load( '/sounds/'+file, function( buffer ) {
			sound.setBuffer( buffer );
			sound.setLoop( false );
			sound.setVolume( 0.5 );
			sound.play();
		});
	}

	/* We don't do much here, but we could do more!
	*/
	function initScene(){
		//scene = new THREE.Scene();
    var scene = new Physijs.Scene();
		return scene;
	}

  function initPhysijs(){
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
  }
	/*
		The renderer needs a size and the actual canvas we draw on
		needs to be added to the body of the webpage. We also specify
		that the renderer will be computing soft shadows
	*/
	function initRenderer(){
		renderer = new THREE.WebGLRenderer();
		renderer.setSize( window.innerWidth, window.innerHeight-50 );
		document.body.appendChild( renderer.domElement );
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	}


	function createPointLight(){
		var light;
		light = new THREE.PointLight( 0xffffff);
		light.castShadow = true;
		//Set up shadow properties for the light
		light.shadow.mapSize.width = 2048;  // default
		light.shadow.mapSize.height = 2048; // default
		light.shadow.camera.near = 0.5;       // default
		light.shadow.camera.far = 500      // default
		return light;
	}



	function createBoxMesh(color){
		var geometry = new THREE.BoxGeometry( 1, 1, 1);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

	function createBoxMesh2(color,w,h,d){
		var geometry = new THREE.BoxGeometry( w, h, d);
		var material = new THREE.MeshLambertMaterial( { color: color} );
		mesh = new Physijs.BoxMesh( geometry, material );
		//mesh = new Physijs.BoxMesh( geometry, material,0 );
		mesh.castShadow = true;
		return mesh;
	}

  function createWall(color,w,h,d){
    var geometry = new THREE.BoxGeometry( w, h, d);
    var material = new THREE.MeshLambertMaterial( { color: color} );
    mesh = new Physijs.BoxMesh( geometry, material, 0 );
    //mesh = new Physijs.BoxMesh( geometry, material,0 );
    mesh.castShadow = true;
    return mesh;
  }



	function createGround(image){
		// creating a textured plane which receives shadows
		var geometry = new THREE.PlaneGeometry( 180, 180, 128 );
		var texture = new THREE.TextureLoader().load( '/images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 15, 15 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.05);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new Physijs.BoxMesh( geometry, pmaterial, 0 );

		mesh.receiveShadow = true;

		mesh.rotateX(Math.PI/2);
		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical
	}



	function createSkyBox(image,k){
		// creating a textured plane which receives shadows
		var geometry = new THREE.SphereGeometry( 80, 80, 80 );
		var texture = new THREE.TextureLoader().load( '/images/'+image );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( k, k );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		//var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		//var mesh = new THREE.Mesh( geometry, material );
		var mesh = new THREE.Mesh( geometry, material, 0 );

		mesh.receiveShadow = false;


		return mesh
		// we need to rotate the mesh 90 degrees to make it horizontal not vertical


	}

	function createMonkeyAvatar() {
		var loader = new THREE.JSONLoader();
		loader.load("/models/suzanne.json",
			function(geometry, materials) {
				console.log("loading monkey");
				var material = new THREE.MeshLambertMaterial( {color: 0x0000ff });
				var pmaterial = new Physijs.createMaterial(material, 0.9, 0.05);
				avatar = new Physijs.BoxMesh(geometry, pmaterial);
				console.log("created monkeyAvatar mesh");
				avatar.setDamping(0.1,0.1);
				avatar.castShadow = true;

				avatarCam.position.set(0,4,0);
				avatarCam.lookAt(0,4,10);
				avatar.add(avatarCam);

				avatar.translateY(20);
				avatarCam.translateY(-4);
				avatarCam.translateZ(3);
				avatar.scale.x = 2;
				avatar.scale.y = 2;
			  avatar.scale.z = 2;

				scene.add(avatar);
			},
			function(xhr){
				console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},
			function(err){console.log("error in loading: "+err);}
		)
	}

	function createConeMesh(r,h){
		var geometry = new THREE.ConeGeometry( r, h, 32);
		var texture = new THREE.TextureLoader().load( '/images/tile.jpg' );
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set( 1, 1 );
		var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
		var mesh = new Physijs.ConeMesh( geometry, pmaterial, 0 );
		mesh.castShadow = true;
		return mesh;
	}


	function createBall(){
		//var geometry = new THREE.SphereGeometry( 4, 20, 20);
		var geometry = new THREE.SphereGeometry( 1, 16, 16);
		var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
		var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
		mesh.setDamping(0.1,0.1);
		mesh.castShadow = true;
		return mesh;
	}





	var clock;

	function initControls(){
		// here is where we create the eventListeners to respond to operations

		  //create a clock for the time-based animation ...
			clock = new THREE.Clock();
			clock.start();

			window.addEventListener( 'keydown', keydown);
			window.addEventListener( 'keyup',   keyup );
  }

	function keydown(event){
		console.log("Keydown: '"+event.key+"'");

		// First, we handle the "play" key in the "start" scene
		if (gameState.scene == 'start' && event.key  == 'p') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}

		// We handle the "play again" key in the "youwon" scene
		if (gameState.scene == 'youwon' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}

		if (gameState.scene == 'youlose' && event.key=='r') {
			gameState.scene = 'main';
			gameState.score = 0;
			addBalls();
			return;
		}

		// this is the regular scene
		switch (event.key){
			// change the way the avatar is moving
			case "w": controls.fwd = true;  break;
			case "s": controls.bwd = true; break;
			case "a": controls.left = true; break;
			case "d": controls.right = true; break;
			case "r": controls.up = true; break;
			case "f": controls.down = true; break;
			case "m": controls.speed = 30; break;
      case " ": controls.fly = true;
          console.log("space!!");
          break;
      case "h": controls.reset = true; break;


			// switch cameras
			case "1": gameState.camera = camera; break;
			case "2": gameState.camera = avatarCam; break;
      case "3": gameState.camera = edgeCam; break;

			// move the camera around, relative to the avatar
			case "ArrowLeft": avatarCam.translateY(1);break;
			case "ArrowRight": avatarCam.translateY(-1);break;
			case "ArrowUp": avatarCam.translateZ(-1);break;
			case "ArrowDown": avatarCam.translateZ(1);break;
			case "q": avatarCam.rotateY(0.05);break;
			case "e": avatarCam.rotateY(-0.05);break;
		}

	}

	function keyup(event){
		switch (event.key){
			case "w": controls.fwd   = false;  break;
			case "s": controls.bwd   = false; break;
			case "a": controls.left  = false; break;
			case "d": controls.right = false; break;
			case "r": controls.up    = false; break;
			case "f": controls.down  = false; break;
			case "m": controls.speed = 10; break;
      case " ": controls.fly = false; break;
      case "h": controls.reset = false; break;
		}
	}

	function updateNPC(){
		npc.lookAt(avatar.position);
	  //npc.__dirtyPosition = true;
		npcPosition = new THREE.Vector3(npc.position.x, npc.position.y, npc.position.z)
		if(npcPosition.distanceTo(new THREE.Vector3(avatar.position.x, avatar.position.y, avatar.position.z)) < 20) {
			npc.setLinearVelocity(npc.getWorldDirection().multiplyScalar(2));
		}
	}

  function updateAvatar(){
		"change the avatar's linear or angular velocity based on controls state (set by WSAD key presses)"

		var forward = avatar.getWorldDirection();

		if (controls.fwd){
			avatar.setLinearVelocity(forward.multiplyScalar(controls.speed));
		} else if (controls.bwd){
			avatar.setLinearVelocity(forward.multiplyScalar(-controls.speed));
		} else {
			var velocity = avatar.getLinearVelocity();
			velocity.x=velocity.z=0;
			avatar.setLinearVelocity(velocity); //stop the xz motion
		}

    if (controls.fly){
      avatar.setLinearVelocity(new THREE.Vector3(0,controls.speed,0));
    }

		if (controls.left){
			avatar.setAngularVelocity(new THREE.Vector3(0,controls.speed*0.1,0));
		} else if (controls.right){
			avatar.setAngularVelocity(new THREE.Vector3(0,-controls.speed*0.1,0));
		}

    if (controls.reset){
      avatar.__dirtyPosition = true;
      avatar.position.set(40,10,40);
    }

	}



	function animate() {

		requestAnimationFrame( animate );

		switch(gameState.scene) {
			case "start":
				renderer.render(startScene, startCamera);
				break;

			case 'youlose':
				renderer.render(loseScene, loseCamera);
				break;

			case "youwon":
				endText.rotateY(0.005);
				renderer.render( endScene, endCamera );
				break;

			case "main":
				var currentTime = (new Date()).getTime();
				var angle = currentTime*0.001;

				updateAvatar();
				updateNPC();

				wall.position.x = 10*Math.sin(angle);

        edgeCam.lookAt(avatar.position);
	    	scene.simulate();
				if(gameState.camera == 'none') {
					gameState.camera = avatarCam;
				}
				if (gameState.camera!= 'none'){
					renderer.render( scene, gameState.camera );
				}
				break;

			default:
			  console.log("don't know the scene "+gameState.scene);

		}

		//draw heads up display ..
	  var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: '
    + gameState.score
    + " health="+gameState.health
    + '</div>';

	}
