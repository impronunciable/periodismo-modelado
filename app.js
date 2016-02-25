

VR.body.moveTo(-19.83, 2.77, 24.52)
VR.body.rotation.y = - Math.PI / 3

var sky = VR.sky().hide();


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
  var loader = document.getElementById('loader')
  loader.parentNode.removeChild(loader)

  // cargar placas
  loadPlates(init, result.scene);
});

function loadPlates(fn, model) {
  var plates = [
    {
      text: 'Periodismo Modelado 2015 - Buenos Aires, Argentina',
      delay: 5
    },
    {
      image: 'memoria-abierta.png',
      delay: 5
    },
    {
      text: 'Conecta tus auriculares',
      image: 'Headphones-Play-Music-icon.png',
      delay: 10
    },
    {
      text: '¿Vas a usar esta experiencia en Google Cardboard?',
      image: 'cardboard.png',
      delay: 10
    },
    {
      text: 'Coloca tu telefono dentro del Google Cardboard',
      image: 'cardboard.png',
      delay: 10
    },
    {
      text: 'Durante todo momento podras mover tu cabeza para observar el lugar',
      image: 'arrowfnish.png',
      delay: 5
    },
    {
      text: '"Episodio 1 - Mansión Seré Buenos Aires, Argentina - 1977"',
      delay: 6
    },
    {
      text: 'Entre 1976 y 1983 Argentina vivió la última y más terrible dictadura cívico-militar de su historia. Durante esos años, sucesivos gobiernos de facto orquestaron el secuestro, tortura y desaparición de 30 mil personas. Estos crímenes de lesa-humanidad eran perpetrados en Centros Clandestinos de Detención (CCD) como la Mansión Seré, ubicada en Morón, provincia de Buenos Aires. La siguiente experiencia intenta recrear este espacio siniestro, con las voces y testimonios de algunos de sus sobrevivientes.',
      delay: 12
    }
  ]

  //plates = [{delay: 0}]
  var txt = VR.body.text({
    text: '',
    font: '50px sans-serif',
    wrap: 1,
    resolution: 1024
  });
  txt.moveZ(-1);

  var img;

  function loadPlate() {
    var plate = plates.shift();
    if(plate.text) {
      txt.text = plate.text;
      txt.show();
    } else {
      txt.hide();
    }

    if(img) {
      img.hide()
      VR.scene.remove(img.object)
    }
    if(plate.image) {
      img = VR.body.image('/images/' + plate.image).moveZ(-1)
      if(plate.text) {
        img.setScale(.25, .25, .25).moveY(.25)
      }
    }

    if(plates.length) {
      setTimeout(loadPlate, plate.delay * 1000);
    } else {
      setTimeout(function(){
        txt.hide();
        txt && VR.scene.remove(txt.object)
        img && VR.scene.remove(img.object)
        VR.scene.add(model)
        init()
      }, plate.delay * 1000);
    }
  }

  loadPlate()
}


function goTo(x, y, z, audio, delay) {
  var to = new THREE.Vector3(x, y, z)
  var m1 = new THREE.Matrix4();
  var c = VR.body.position.clone()
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

      middleware.next();
    }
  }
}

function wait(seconds) {
  setTimeout(middleware.next.bind(middleware), seconds * 1000)
}

function init() {
  sky.show();

  try{
    if(__MODULE__ === "Editor") {
      new Editor()
    }
    else if(__MODULE__ === "Player") {
      var player = new Player()
      player.checkpoints.forEach(function(cp) {
        middleware.fn.push(function(){ return goTo.apply(null, cp.position.concat(cp.audio))})
        middleware.fn.push(function() { return wait(cp.delay)})
      })
      middleware.init()
    } else {
      middleware.init()
    }
  }
  catch(e){
    middleware.init();
  }
}
