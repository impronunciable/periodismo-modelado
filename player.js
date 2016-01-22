

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
    console.log('asdsa')

    this.getData()
  }



  // Get editor data from share textfield or localstorage
  getData () {
    try {
      const share = document.querySelector('#share') || {value: ''}
      const data = share.value
      if (data.trim().length) {
        this.checkpoints = JSON.parse(data).checkpoints
      } else {
        const obj = JSON.parse(localStorage.getItem('modelado-editor'))
        this.checkpoints = (obj && obj.checkpoints) || []
        this.checkpoints.forEach(c => c.id = getId())
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
    const dir = VR.camera.object.getWorldDirection()
    VR.body.position.add(dir.multiplyScalar(sign * .2))
  }



  goToCheckpoint (index) {
    const cp = this.getCheckpoint(index)
    VR.body.moveTo.apply(VR.body, cp.position)
  }


}


})()
