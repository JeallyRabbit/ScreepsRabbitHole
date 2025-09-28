var roleWorker = require('roleWorker');
const Movement = require('screeps-movement');
const C = require('constants')
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");


Creep.prototype.roleRepairer = function roleRepairer() {


    this.say("Rep")
    if (Game.rooms[this.memory.homeRoom].memory.harvestingRooms != undefined) {
        for (harvestingRoom of Game.rooms[this.memory.homeRoom].memory.harvestingRooms) {
            if (harvestingRoom.name == this.memory.targetRoom) {
                harvestingRoom.repairerId = this.id
                break;
            }
        }
    }


    if (this.room.name == this.memory.targetRoom && this.pos.x>0 && this.pos.x<49 && this.pos.y>0 && this.pos.y<49) {

        if (this.store[RESOURCE_ENERGY] == 0) {
            this.taskCollect()
        }
        else if (((global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length < 1) || global.heap.rooms[this.memory.targetRoom].damagedStructuresId == undefined)) {
            this.taskBuild()
        }
        else {

            
            if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length > 0) {

               
                if (global.heap.creeps[this.name].targetStructureId != undefined && Game.getObjectById(global.heap.creeps[this.name].targetStructureId) == null) {
                    global.heap.creeps[this.name].targetStructureId = undefined
                }

                if (global.heap.creeps[this.name].targetStructureId != undefined && Game.getObjectById(global.heap.creeps[this.name].targetStructureId) != null
                    && (Game.getObjectById(global.heap.creeps[this.name].targetStructureId).hits == Game.getObjectById(global.heap.creeps[this.name].targetStructureId).hitsMax
                || Game.getObjectById(global.heap.creeps[this.name].targetStructureId).room.name!=this.memory.targetRoom)) {
                    global.heap.creeps[this.name].targetStructureId = undefined
                }

                if (global.heap.creeps[this.name].targetStructureId == undefined) {
                    var aux = [];
                    for (id of global.heap.rooms[this.memory.targetRoom].damagedStructuresId) {
                        if (Game.getObjectById(id) != null && Game.getObjectById(id).room.name==this.memory.targetRoom
                            && Game.getObjectById(id).hits < Game.getObjectById(id).hitsMax) {
                            aux.push(Game.getObjectById(id))
                        }
                    }
                    var target = this.pos.findClosestByPath(aux)
                    if (target != null) {
                        global.heap.creeps[this.name].targetStructureId = target.id
                    }
                }

                if (global.heap.creeps[this.name].targetStructureId != undefined) {
                    var targetStructure = Game.getObjectById(global.heap.creeps[this.name].targetStructureId)
                    if (targetStructure != null) {
                        if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                            this.travelTo(targetStructure, {  reusePath: 17, maxRooms: 1 });
                            //move_avoid_hostile(this, closest_target.pos, 2, false);
                        }
                    }
                    else {
                        global.heap.creeps[this.name].targetStructureId = undefined;

                    }
                }



            }
        }

    }
    else {
        this.travelTo(new RoomPosition(25,25,this.memory.targetRoom))
        if (this.memory.targetRoom != undefined) {
            //this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 17 });
        }

    }




};

