

VR.body.moveTo(-19.83, 2.77, 24.52)
VR.body.rotation.y = - Math.PI / 3

var sky = VR.sky().hide();
var model;

var middleware = {
  fn: [],
  cb: null
}

var currAudio = null;
var voiceRef = VR.camera.text({
  text: '',
  font: '50px sans-serif',
  wrap: 1,
  resolution: 1024
})
voiceRef.moveZ(-1).moveY(-0.5).moveX(-0.7).hide();

middleware.next = function() {
  VR.end(this.cb)

  if (this.fn.length) {
    var fn = this.fn.shift()
    if(!fn) return

    this.cb = fn()
    VR.animate(this.cb)
  } else {
    ending()
  }
}

middleware.init = middleware.next


var loader = new THREE.ColladaLoader();


loader.load('Sere2016.dae', function (result) {
  result.scene.rotation.x = -Math.PI/2
  result.scene.rotation.z = -Math.PI/2
  result.scene.position.y = 1
  model = result.scene
});

function loadPlates(isInit, plates) {

  var txt = VR.camera.text({
    text: '',
    font: '50px sans-serif',
    wrap: 1,
    resolution: 1024
  });
  txt.moveZ(-1);
  txt.material.opacity = 0.0

  var img;

  // cargar placas
  //plates = [{delay: 0}]
  if(__MODULE__ === 'Editor') {
    plates = [{delay: 0}]
  }

  function loadPlate() {
    var plate = plates.shift();
    if(plate.text) {
      console.log(txt.text, plate.text)
      txt.text = plate.text;
    }

    if(img) {
      img.hide()
      VR.scene.remove(img.object)
    }

    if(plate.image) {
      img = VR.camera.image('/images/' + plate.image).moveZ(-1)
      if(plate.text) {
        img.setScale(.25, .25, .25).moveY(.25)
      }
      img.material.opacity = 0.0
    }
    var startInter = setInterval(function(){
      if(img) img.material.opacity += 0.02;
      if(plate.text) txt.material.opacity += 0.02;
      if(img && img.material.opacity >= 1.0) img.material.opacity = 1.0;
      if(plate.text && txt.material.opacity >= 1.0) txt.material.opacity = 1.0;
      if(((plate.text && txt.material.opacity == 1.0) || !plate.text) && ((img && img.material.opacity == 1.0) || !img)) clearInterval(startInter);
    }, 25)


    if(plates.length) {
      setTimeout(function(){
        var endInter = setInterval(function(){
          if(img) img.material.opacity -= 0.02;
          if(plate.text) txt.material.opacity -= 0.02;
          if(img && img.material.opacity <= 0.0) img.material.opacity = 0.0;
          if(plate.text && txt.material.opacity <= 0.0) txt.material.opacity = 0.0;
          if(((plate.text && txt.material.opacity == 0.0) || !plate.text) && ((img && img.material.opacity == 0.0) || !img)) {
            clearInterval(endInter)
            setTimeout(loadPlate, 1000)
          }
        }, 25)
      }, plate.delay * 1000);
    } else {
      if(!isInit) return;
      setTimeout(function(){
        var loader = document.getElementById('loader')
        loader.style.display = 'block;'
        txt.hide();
        txt && VR.scene.remove(txt.object)
        img && VR.scene.remove(img.object)
        var initInter = setInterval(function(){
          if(model) {
            VR.scene.add(model)
            loader.parentNode.removeChild(loader)
            clearInterval(initInter)
            init()
          }
        }, 50)
      }, plate.delay * 1000);
    }
  }

  loadPlate()
}


function goTo(cp) {
  var p = cp.position
  var to = new THREE.Vector3(p[0], p[1], p[2])
  var m1 = new THREE.Matrix4();
  var c = VR.body.position.clone()
  VR.body.object.quaternion.setFromRotationMatrix( m1 );
  c.sub(to)
  c.normalize()

  return function(delta) {
    VR.body.position.sub(c.clone().multiplyScalar(delta))
    if(VR.body.position.distanceTo(to) < 1) {
      if (cp.audio) {
        if (currAudio) {
          currAudio.volume(0, 2)
        }

        currAudio = VR.sound([
          'audios/mp3/' + cp.audio + '.mp3',
          'audios/ogg/' + cp.audio + '.ogg'
        ]);
        currAudio.volume(1);
        currAudio.start();
        voiceRef.text = cp.name
        voiceRef.show()
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
        middleware.fn.push(function(){ return goTo(cp)})
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

function ending () {
  voiceRef.hide()
  sky.hide()
  VR.scene.remove(model)
  loadPlates(false, endingPlates)
}

var initialPlates = [
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

var endingPlates = [
  {
    text: 'El 24 de marzo de 1978, en el segundo aniversario del golpe, 4 detenidos lograron escapar de la Mansión.\nPosteriormente la casa fue dinamitada para borrar toda evidencia del horror y los crímenes allí cometidos.',
    delay: 12
  },
  {
    text: '"Ya en democracia, sus restos fueron demolidos para construir un polideportivo y un edificio para las reuniones privadas del intendente local.\nEn el 2000 se creó allí la Casa de la Memoria y la Vida, el primer espacio para la Memoria emplazado en un ex-CCD de toda Latinoamérica."',
    delay: 12
  },
  {
    text: 'Periodismo Modelado 2015 - Buenos Aires, Argentina',
    delay: 5
  },
  {
    delay: 5,
    image: 'memoria-abierta.png'
  },
]

// preload images
initialPlates.forEach(function(p){
  if(p.image) {
    var img = new Image()
    img.src = 'images/' + p.image
  }
})

// Init plates
loadPlates(true, initialPlates);
