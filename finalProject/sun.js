
    // once everything is loaded, we run our Three.js stuff.
    // Declare all major objects
    var scene, camera, renderer;
    var sunMesh, starfield;

    init();   // initialize the variables
  	animate();  // start the animation loop

    function init(){
  			initScene();
  			initRenderer();

        initStarfield();
        initSunMesh();
        initGlow();

        initLight1();

  			initCamera();
  	}

    // Simple - start the scene
    function initScene(){
        scene = new THREE.Scene();//1
        var light = new THREE.AmbientLight( 0x404040 ); // soft white light
        scene.add( light );
    }

    // Create the render and ensure that it handles shadows
    function initRenderer(){
      renderer = new THREE.WebGLRenderer();
      renderer.setSize( window.innerWidth, window.innerHeight );
      document.body.appendChild( renderer.domElement );
    }

    // Create the camera
    function initCamera(){
  		camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
      camera.position.x = -10;
      camera.position.y = 5;
      camera.position.z = 10;

      camera.lookAt(new THREE.Vector3(0, 0, 0));
  	}

    function initSunMesh(){
      var geometry = new THREE.SphereGeometry(5,32,32);                      // Sphere with radius of 1.5
      var material = new THREE.MeshPhongMaterial();
      material.map = THREE.ImageUtils.loadTexture('textures/sun.jpg');
      // material.bumpMap    = THREE.ImageUtils.loadTexture('textures/earthbump1k.jpg')
      // material.bumpScale = 0.05
      sunMesh = new THREE.Mesh( geometry, material );
      scene.add(sunMesh);
    }

    function initGlow() {
      var spriteMaterial = new THREE.SpriteMaterial( {
        map: new THREE.ImageUtils.loadTexture('textures/glow.png'),
        useScreenCoordinates: false,
        color: 0xff8300,
        transparent: false,
        blending: THREE.AdditiveBlending
      })
      var sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(25,25,1);
      sunMesh.add(sprite);
    }

    function initStarfield () {
      var geometry = new THREE.SphereGeometry (100,32,32);
      var texture = THREE.ImageUtils.loadTexture('textures/starry-deep-outer-space-galaxy.jpg');
      var material = new THREE.MeshBasicMaterial( {
        map: texture,
        side: THREE.BackSide
      })
      starfield = new THREE.Mesh(geometry, material);
      scene.add(starfield);
    }

    function initLight1(){
      light1 = new THREE.PointLight( 0xffffff);
      light1.position.set( 0,40,0);               // Move the light "up" 40 units
      // light1.castShadow = true;                   // Ensure the spotlight casts a shadow
      scene.add( light1 );
    }

    function animate() {
      requestAnimationFrame( animate );
      sunMesh.rotation.y += 0.005;
      renderer.render( scene, camera );   // Render the scene!

    }
