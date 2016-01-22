VR.floor().setMaterial('grass');
VR.sky();

VR.body.moveTo(20.4, 1.5, -24.5)
VR.body.rotation.y = Math.PI * 14/12
var middleware = {
  fn: [],
  cb: null
}

var currAudio = null;

middleware.next = function() {
  VR.end(this.cb)

  var fn = this.fn.shift()
  if(!fn) return

  this.cb = fn()
  VR.animate(this.cb)
}

middleware.init = middleware.next

var loader = new THREE.ColladaLoader();

loader.load('Sere2016.dae', function (result) {
  result.scene.rotation.x = -Math.PI/2
  result.scene.rotation.z = -Math.PI/2
  result.scene.position.y = 1
  VR.scene.add(result.scene)
  init();
});


function goTo(x, y, z, audio) {
  var to = new THREE.Vector3(x, y, z)
  var m1 = new THREE.Matrix4();
  var c = VR.body.position.clone()
  m1.lookAt( VR.body.position, to, 0 );
  VR.body.object.quaternion.setFromRotationMatrix( m1 );
  c.sub(to)
  c.normalize()

  return function(delta) {
    VR.body.position.sub(c.clone().multiplyScalar(delta))
    if(VR.body.position.distanceTo(to) < 1) {
      if (audio) {
        if (currAudio) {
          currAudio.volume(0, 2)
        }

        currAudio = VR.sound([
          'audios/mp3/' + audio + '.mp3',
          'audios/ogg/' + audio + '.ogg'
        ]);
        currAudio.volume(1);
        currAudio.start();
      }

      middleware.next()
    }
  }
}

function wait(seconds) {
  setTimeout(middleware.next.bind(middleware), seconds * 1000)
}

function init() {
  var loader = document.getElementById('loader')
  loader.parentNode.removeChild(loader)
  try{
    if(__MODULE__ === "Editor") {
      new Editor()
    }
    else if(__MODULE__ === "Player") {
      var player = new Player()
      middleware.fn = player.checkpoints.map(cp => () => goTo.apply(null, cp.position.concat(cp.audio)))
      middleware.init()
    } else {
      middleware.init()
    }
  }
  catch(e){
    middleware.init();
  }
}
