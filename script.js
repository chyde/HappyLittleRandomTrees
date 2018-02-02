function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makeSection(botWidth, topWidth, height, translateY, shiftX, shiftY){
  var geom = new THREE.Geometry(); 
  

  for(var xx=-1; xx <= 1; xx+=2){
      var v1 = new THREE.Vector3(xx*botWidth/2         , 0      + translateY, -botWidth/2);
      var v2 = new THREE.Vector3(xx*topWidth/2 + shiftX, height + translateY, -topWidth/2  + shiftY);
      var v3 = new THREE.Vector3(xx*topWidth/2 + shiftX, height + translateY,  topWidth/2  + shiftY);
      var v4 = new THREE.Vector3(xx*botWidth/2         , 0      + translateY,  botWidth/2);

      geom.vertices.push(v1);
      geom.vertices.push(v2);
      geom.vertices.push(v3);
      geom.vertices.push(v4);
  }
  geom.faces.push( new THREE.Face3( 1, 0, 2 ) );
  geom.faces.push( new THREE.Face3( 2, 0, 3 ) );
  
  geom.faces.push( new THREE.Face3( 4, 5, 6 ) );
  geom.faces.push( new THREE.Face3( 4, 6, 7 ) );
  
  geom.faces.push( new THREE.Face3( 3, 7, 6 ) );
  geom.faces.push( new THREE.Face3( 2, 3, 6 ) );
  
  geom.faces.push( new THREE.Face3( 1, 4, 0 ) );
  geom.faces.push( new THREE.Face3( 1, 5, 4 ) );

  geom.myData = "fdnsjkfdnjsk";
  
  geom.computeFaceNormals();
  return geom;
}

function generateRandomIntSet(lower, upper, count){
  var items = [];
  for(var hi = 0; hi < count; hi++){
    items.push(getRandomIntInclusive(lower,upper));
  }
  items.sort(compareNumbers);
  //items.reverse();

  return (items);
}
function compareNumbers(a, b){  return a - b; }

function createGoldenSet(start, count){
  var GR = 1.618;
  var grSet = [start];
  var currentValue = start;
  for(var index = 0; index < count; index++){
      // some variance on the Golden ration
      currentValue *= (GR + Math.random()/2-0.25);  
      grSet.push(currentValue);
  }
  return grSet; 
}

function makeTree(scene){

  var scale = 150;
  
  //Build utility variables
  var isTrunk = true; // initially make a trunk then make the rest of the tree 
  var lastHeight = 0;
  var sections = getRandomIntInclusive(2,7);
  var heights = generateRandomIntSet(50, 75, sections);
  var currentHeight = 0;//-heights[0] / 2;
  var widths = createGoldenSet(25, sections- 1).reverse().concat(0); //generateRandomIntSet(25, 110, sections).concat(0);

  //console.log(heights);
  
  for(var trunkIndex = 0; trunkIndex < sections; trunkIndex ++){
    var height = heights[trunkIndex]; 
    var botWidth = widths[trunkIndex];
    var topWidth = widths[trunkIndex + 1] / 2;
    
    var cubeMaterial = new THREE.MeshLambertMaterial({
      color: 0x1B5E20
    });
    
    //cube.position.y += currentHeight; 
    currentHeight += height * 0.75;
    
    
     var geom;
    if(isTrunk){
      geom = makeSection(topWidth / 3, topWidth / 5, height,currentHeight , 0, 0);
      cubeMaterial = new THREE.MeshLambertMaterial({
        color: 0x4E342E
      });
      
      
      isTrunk = false;
    }
    else{
      geom = makeSection(botWidth, topWidth, height,currentHeight, 0, 0);
    }
    
    var cube = new THREE.Mesh(geom, cubeMaterial);

    //Main rotation (original before spin)
    //cube.rotation.y = Math.PI * (Math.random() * 90) / 180;
    //console.log(currentHeight);
    for(var idx in cube.vertices){
      cube.vertices[idx].position.y += currentHeight;
    }
    
    //add shadows
    cube.castShadow = true;
    cube.receiveShadow = false;
    
    
    //Add the cube to the scene
    scene.add(cube);
  }
  //scene.position.y = - currentHeight/2;
  
}

//Using main window height and width
//for fullscreen effect
var width = window.innerWidth;
var height = window.innerHeight;

//Renderer animates mainly
var renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.shadowMapEnabled = true;
//Setting width and height
renderer.setSize(width, height);
//adding canvas without HTML5
document.body.appendChild(renderer.domElement);
//New THREE.js SCENE
var scene = new THREE.Scene();
  
var treeGroup =  new THREE.Group();
makeTree(treeGroup);

//Add the cube to the scene
scene.add(treeGroup);

var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);

camera.position.y = 50;
camera.position.z = 600;

scene.add(camera);

//Point the camera at the cube
camera.lookAt(treeGroup.position); 
camera.position.y += 200;

//camera (sky like the sun and //reflective greenhouse effect)
var skyboxGeometry = new THREE.CubeGeometry(10000, 10000, 10000);
var skyboxMaterial = new THREE.MeshBasicMaterial({
  color: 0x121212,
  side: THREE.BackSide
});
var skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);

//Add the skybox (lights)
scene.add(skybox);

//Main light
var pointLightA = new THREE.PointLight(0xffffff);
pointLightA.position.set(0, 300, 200);

//Add the main light to the scene
scene.add(pointLightA);

//Second Light
var pointLightB = new THREE.PointLight(0xffffff);
pointLightB.position.set(400, 300, 200);

//Add the main light to the scene
scene.add(pointLightB);


// Debugging some export shit just for funsies
var objExporter = new THREE.OBJExporter();


//console.log(objExporter.parse(treeGroup));

//CLOCK
var clock = new THREE.Clock();
//END CLOCK
function refreshTree(){
  scene.remove(treeGroup);
  var rotY = treeGroup.rotation.y;
  treeGroup = new THREE.Group();
  makeTree(treeGroup);
  treeGroup.rotation.y = rotY;
  scene.add(treeGroup);
  setTimeout(refreshTree, 300);
}
/* MAIN ANIMATION FUNCTION FOR GOOD PRECISION. Using jQuery, You could make a lambada function */
function render() {
  renderer.render(scene, camera);
  treeGroup.rotation.y -= clock.getDelta() * 0.5;
  requestAnimationFrame(render);
}

refreshTree();

render();