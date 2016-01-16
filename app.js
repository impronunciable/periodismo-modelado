VR.floor().setMaterial('grass');
VR.sky();

VR.body.moveTo(20.4, 1.5, -24.5)
VR.body.rotation.y = Math.PI * 14/12
var middleware = {
  fn: [],
  cb: null
}

middleware.next = function() {
  VR.end(this.cb)
  var fn = this.fn.shift()
  if(!fn) return
  this.cb = fn()
  VR.animate(this.cb)
}

middleware.init = middleware.next

var loader = new THREE.ColladaLoader();
 
//TODO: Get from position! 
var tamburrini1_Sound = VR.sound([
          'audios/mp3/Tamburrini_1.mp3',
          'audios/ogg/Tamburrini_1.ogg',
]);
loader.load('Sere2016.dae', function (result) {
  result.scene.rotation.x = -Math.PI/2
  result.scene.rotation.z = -Math.PI/2
  result.scene.position.y = 1
  VR.scene.add(result.scene)
  init();
  
});

function activateAudio(){
  activeSound = tamburrini1_Sound;
                activeSound.volume(1);
                activeSound.start();
}
function goTo(x, y, z) {

  var to = new THREE.Vector3(x, y, z)
  var m1 = new THREE.Matrix4();
  var c = VR.body.position.clone()
  console.log(VR.scene, VR.camera)
  m1.lookAt( VR.body.position, to, 0 );
  VR.body.object.quaternion.setFromRotationMatrix( m1 );
  c.sub(to)
  c.normalize()
  
  return function(delta) {
    VR.body.position.sub(c.clone().multiplyScalar(delta))
    if(VR.body.position.distanceTo(to) < 1) middleware.next()
  }
  
}


function wait(seconds) {
  setTimeout(middleware.next.bind(middleware), seconds * 1000)
}

function t1() {
  activateAudio();
  return goTo(-1, 4, -7)
}

function t2() {
  return goTo(-5, 4, -7)
}

function t3() {
  return goTo(-5, 4, -10)
}

middleware.fn = [t1, t2, t3]

function init() {
  try{
    if(__MODULE__ === "Editor") {
      new Editor()
    }
    else if(__MODULE__ === "Player") {
      new Player()
    } else {
      middleware.init()
    }
  }
  catch(e){
    middleware.init();    
  }
}
