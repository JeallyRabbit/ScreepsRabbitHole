
const Movement = require('screeps-movement');
const C=require('constants');



//TODO
// add finding (in roomManager) myDamagedCreeps (and allied damaged creeps) and healing them



Creep.prototype.roleColonizer = function roleColonizer() { 

    
    if(this.room.name!=this.memory.targetRoom)
    {
         this.travelTo(new RoomPosition(25,25,this.memory.targetRoom), {avoidHostile: true, allowHostile: true,preferHighway: true})
    }
    else{
        this.colonizerGetTask()
        if(this.memory.task==C.TASK_HARVEST)
        {
            this.taskHarvest()
        }
        else if(this.memory.task==C.TASK_BUILD)
        {
            this.taskBuild()
        }
        else if(this.memory.task==C.TASK_UPGRADE)
        {
            this.taskUpgrade() 
        }

    }



};

Creep.prototype.colonizerGetTask=function colonizerGetTask() {
    if (this.store[RESOURCE_ENERGY] == 0) {
        this.memory.task = C.TASK_HARVEST;
    }
    if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        if (global.heap.rooms[this.memory.targetRoom].construction != undefined && global.heap.rooms[this.memory.targetRoom].construction.length > 0) {
            this.memory.task = C.TASK_BUILD;
            //this.say("BUILD")
        }
        else {
            this.memory.task = C.TASK_UPGRADE;
        }
    }
}
