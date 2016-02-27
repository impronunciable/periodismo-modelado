

// Constants
var __MODULE__ = "Player";

var Player = (function(){
'use strict';

// Aux function for generating incremental unique ids
var getId = (function getId () {
  var id = 0
  return function() { return ++id }
})()

return class Player {
  constructor () {
    this.checkpoints = []

    this.getData()
  }



  // Get editor data from share textfield or localstorage
  getData () {
    try {
      var share = document.querySelector('#share') || {value: ''}

      var data = share.value

      if (data.trim().length) {
        this.checkpoints = JSON.parse(data).checkpoints
      } else {
        var obj = JSON.parse(localStorage.getItem('modelado-editor'))
        this.checkpoints = (obj && obj.checkpoints) || []
        this.checkpoints.forEach(function(c) {return c.id = getId()})
      }
    } catch (e) {}

  }




  // get checkpoint by id
  getCheckpoint (index) {
    for (var i = 0; i < this.checkpoints.length; i++) {
      if (this.checkpoints[i].id === index) {
        return this.checkpoints[i]
      }
    }
  }

  // move body forward or backwards (1 or -1)
  moveBody (sign) {
    var dir = VR.camera.object.getWorldDirection()
    VR.body.position.add(dir.multiplyScalar(sign * .2))
  }



  goToCheckpoint (index) {
    var cp = this.getCheckpoint(index)
    VR.body.moveTo.apply(VR.body, cp.position)
  }


}


})()
