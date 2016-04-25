

//var subs = VR.camera.text({
//  text: 'Hola',
//  font: '20px sans-serif'
//});
//subs.moveZ(-1).moveY(-0.5);

// Constants
var __MODULE__ = "Editor";

var Editor = (function(){
'use strict';

// Aux function for generating incremental unique ids
var getId = (function getId () {
  var id = 0
  return function() { return ++id }
})()

return class Editor {
  constructor () {
    this.checkpoints = []

    this.createEditorBar()
    this.getData()
    this.bindEditorEvents()
    this.renderCheckpoints()
  }

  // Create the editor sidebar and append to body
  createEditorBar () {
    const $container = document.createElement('div')
    $container.className = 'editor-bar'
    const content = `
      <div class="editor-checkpoints">
        <h3>Checkpoints</h3>
        <ul class="editor-checkpoint-list"></ul>
        <button id="save">Save</button>
        <h3>Share</h3>
        <p><textarea id="share"></textarea></p>
      </div>
    `
    $container.innerHTML = content
    document.body.appendChild($container)
  }

  // Get editor data from share textfield or localstorage
  getData () {
    try {
      const data = document.querySelector('#share').value
      if (data.trim().length) {
        this.checkpoints = JSON.parse(data).checkpoints
      } else {
        const obj = JSON.parse(localStorage.getItem('modelado-editor'))
        this.checkpoints = (obj && obj.checkpoints) || []
        checkpoints.forEach(c => c.id = getId())
      }
    } catch (e) {}
  }

  // Bind events for save and keyboard
  bindEditorEvents () {
    document.querySelector('#save').addEventListener('click', this.saveData.bind(this))
    document.addEventListener('keydown', event => {
      switch (event.keyCode || event.which) {
        case 38:
          this.moveBody(1)
          break
        case 40:
          this.moveBody(-1)
          break
        case 32:
          this.createCheckpoint()
          break
        case 72:
          this.toggleBar()
          break
      }
    })
  }

  // get checkpoint by id
  getCheckpoint (index) {
    for (var i = 0; i < this.checkpoints.length; i++) {
      if (this.checkpoints[i].id === index) {
        return this.checkpoints[i]
      }
    }
  }

  // delete checkpoint by id
  deleteCheckpoint (index, event) {
    event.stopPropagation()
    const cp = this.getCheckpoint(index)
    this.checkpoints.splice(this.checkpoints.indexOf(cp), 1)
    this.syncCheckpoints()
    this.renderCheckpoints()
    return false
  }

  // move body forward or backwards (1 or -1)
  moveBody (sign) {
    const dir = VR.camera.object.getWorldDirection()
    VR.body.position.add(dir.multiplyScalar(sign * .2))
  }

  // Show/hide sidebar
  toggleBar () {
    document.querySelector('.editor-bar').classList.toggle('hide')
  }

  // Create new checkpoint
  createCheckpoint () {
    // Sync before add new dataa
    this.syncCheckpoints()
    const coord = VR.body.position
    this.checkpoints.push({
      position: [coord.x, coord.y, coord.z],
      name: '',
      audio: '',
      delay: 0,
      duration: 0,
      id: getId()
    })
    this.renderCheckpoints()
  }

  renderCheckpoints () {
    const $list = document.querySelector('.editor-checkpoint-list')
    $list.innerHTML = this.checkpoints.reduce((prev, curr) => `
        ${prev}
        <li id="cp-${curr.id}">
          <button class="delete-cp">X</button>
          <label>name: </label><input type="text" class="cp-name" value="${curr.name}" />
          <label>audio: </label><input type="text" class="cp-audio" value="${curr.audio || ''}" />
          <label>delay: </label><input type="text" class="cp-delay" value="${curr.delay || '0'}" />
          <label>duration: </label><input type="text" class="cp-delay" value="${curr.duration || '0'}" />
          
          <p>position: (${curr.position.map(function(e){ return e.toFixed(2) }).join(', ')})</p>
        </li>`, '')
    this.checkpoints.forEach(c => {
      document.querySelector(`#cp-${c.id} .delete-cp`).addEventListener('click', this.deleteCheckpoint.bind(this, c.id))
      document.querySelector(`#cp-${c.id}`).addEventListener('click', this.goToCheckpoint.bind(this, c.id))
    })
  }

  goToCheckpoint (index) {
    const cp = this.getCheckpoint(index)
    VR.body.moveTo.apply(VR.body, cp.position)
  }


  saveData () {
    this.syncCheckpoints()
    const data = JSON.stringify({ checkpoints: this.checkpoints })
    localStorage.setItem('modelado-editor', data)
    document.querySelector('#share').value = data
  }

  syncCheckpoints () {
    this.checkpoints.forEach(cp => {
      cp.name = document.querySelector(`#cp-${cp.id} input.cp-name`).value
      cp.audio = document.querySelector(`#cp-${cp.id} input.cp-audio`).value
      cp.delay = document.querySelector(`#cp-${cp.id} input.cp-delay`).value
    })
  }

}


})()
