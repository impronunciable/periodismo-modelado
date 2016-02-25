

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
      var share = document.querySelector('#share') || {value: ''}

      var data = share.value

      data = '{"checkpoints":[{"position":[-12.831073158988247,2.7103907620877115,17.7075779880464],"name":"","audio":"Tamburrini_1","id":1,"delay":"0"},{"position":[-11.798090776562876,2.6884285482512595,16.762933116004152],"name":"","audio":"","id":2,"delay":"0"},{"position":[-11.74750198374517,2.513669752063875,12.453571089540823],"name":"","audio":"","id":3,"delay":"5"},{"position":[-11.769072751504925,3.654815904014141,7.888338541302905],"name":"","audio":"","id":4,"delay":"0"},{"position":[-7.494692487179392,4.974976630471207,7.854032070131728],"name":"","audio":"","id":5,"delay":"0"},{"position":[-7.166336376914645,5.045556118149364,6.085642731613839],"name":"","audio":"","id":6,"delay":"0"},{"position":[-6.840909226188327,5.045556118149363,5.853054749946941],"name":"","audio":"","id":7,"delay":"0"},{"position":[-6.548849224905158,5.984604339207577,4.47628857963563],"name":"","audio":"","id":8,"delay":"0"},{"position":[-6.824049135256345,4.914856188076956,5.796235111099179],"name":"","audio":"","id":9,"delay":"0"},{"position":[-6.6052218036225785,4.999674106249964,6.946372618764813],"name":"","audio":"","id":10,"delay":"0"},{"position":[-6.59096837275907,5.126483095972132,13.327494780017298],"name":"","audio":"","id":11,"delay":"0"},{"position":[-7.581866028933105,5.01103847422832,13.39673637255982],"name":"","audio":"","id":12,"delay":"0"},{"position":[-10.548967316017116,5.501143550842937,14.919465633692806],"name":"","audio":"","id":13,"delay":"0"}]}'
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
