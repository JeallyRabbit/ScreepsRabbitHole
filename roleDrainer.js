const C = require('constants')

Creep.prototype.roleDrainer = function roleDrainer() {
    this.say("D")

    this.heal(this)
    if (this.room.name != this.memory.targetRoom && this.hits == this.hitsMax) {
        if (this.memory.targetRoom != undefined) {
            this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom))
        }


    }
    else {
        if (this.hits < this.hitsMax) {
            this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom))
        }
    }

    if(this.room.name==this.memory.targetRoom && this.hits==this.hitsMax
        && Game.time%3==0
    )
    {
        this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom))
    }

    //getting healed in homeRoom
    if (this.room.name == this.memory.homeRoom && this.hits<this.hitsMax) {

        if (this.memory.healingTowerId != undefined && Game.getObjectById(this.memory.healingTowerId) == null) {
            this.memory.healingTowerId = undefined
        }

        if (this.memory.healingTowerId == undefined) {


            if (global.heap.rooms[this.room.name].myTowersId.length > 0) {
                var towers = [];
                for (t of global.heap.rooms[this.room.name].myTowersId) {
                    var aux = Game.getObjectById(t)
                    if (aux != null) {
                        towers.push(t)
                    }
                }
                if (towers.length > 0) {
                    this.memory.healingTowerId = this.pos.findClosestByPath(towers).id
                }


            }
        }

        if (this.memory.healingTowerId != undefined
            && Game.getObjectById(this.memory.healingTowerId) != null
        ) {
            this.travelTo(Game.getObjectById(this.memory.healingTowerId))
        }
    }
}