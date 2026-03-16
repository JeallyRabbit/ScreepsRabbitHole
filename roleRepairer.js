var roleWorker = require('roleWorker');
const Movement = require('screeps-movement');
const C = require('constants')
//const getMaxEnergyDeposit = require("getMaxEnergyDeposit");


Creep.prototype.roleRepairer = function roleRepairer() {


    if (Game.rooms[this.memory.homeRoom].memory.harvestingRooms != undefined) {
        for (harvestingRoom of Game.rooms[this.memory.homeRoom].memory.harvestingRooms) {
            if (harvestingRoom.name == this.memory.targetRoom) {
                harvestingRoom.repairerId = this.id
                break;
            }
        }
    }


    if (this.room.name == this.memory.targetRoom) {

        global.heap.rooms[this.room.name].repairerId = this.id

        if (this.pos.x == 0 || this.pos.x == 49 || this.pos.y == 0 || this.pos.y == 49) {
            this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom))
            return;
        }
        if (this.store[RESOURCE_ENERGY] == 0) {
            //this.say("collect")
            this.taskCollect()
            return
        }
        else {
            if(global.heap.creeps[this.name].toBuild!=undefined && Game.getObjectById(global.heap.creeps[this.name].toBuild.id)==null)
            {
                global.heap.creeps[this.name].toBuild=undefined 
            }
            if(global.heap.creeps[this.name].toBuild==undefined)
            {
                global.heap.creeps[this.name].toBuild = this.taskBuild();
            }
            if(global.heap.creeps[this.name].toBuild!=undefined)
            {
                if(this.build(global.heap.creeps[this.name].toBuild)==ERR_NOT_IN_RANGE)
                {
                    this.travelTo(global.heap.creeps[this.name].toBuild)
                    return
                }
            }
            else if (global.heap.rooms[this.memory.targetRoom].damagedStructuresId != undefined && global.heap.rooms[this.memory.targetRoom].damagedStructuresId.length > 0)
            {
                var toBuild= global.heap.creeps[this.name].toBuild
                if (global.heap.creeps[this.name].targetStructureId != undefined && Game.getObjectById(global.heap.creeps[this.name].targetStructureId) == null) {
                    global.heap.creeps[this.name].targetStructureId = undefined
                }

                if (global.heap.creeps[this.name].targetStructureId != undefined && Game.getObjectById(global.heap.creeps[this.name].targetStructureId) != null
                    && (Game.getObjectById(global.heap.creeps[this.name].targetStructureId).hits == Game.getObjectById(global.heap.creeps[this.name].targetStructureId).hitsMax
                        || Game.getObjectById(global.heap.creeps[this.name].targetStructureId).room.name != this.memory.targetRoom)) {
                    global.heap.creeps[this.name].targetStructureId = undefined
                }

                if (global.heap.creeps[this.name].targetStructureId == undefined) {
                    var aux = [];
                    for (id of global.heap.rooms[this.memory.targetRoom].damagedStructuresId) {
                        if (Game.getObjectById(id) != null && Game.getObjectById(id).room.name == this.memory.targetRoom
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
                    if (targetStructure != null && toBuild != null) {


                        if (this.pos.findClosestByPath([targetStructure, toBuild])!=null && this.pos.findClosestByPath([targetStructure, toBuild]).id == targetStructure.id) {
                            //repairing
                            if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                                this.travelTo(targetStructure, { maxRooms: 1 });
                                return
                            }
                        }
                        else {
                            //building
                            if (this.build(toBuild) == ERR_NOT_IN_RANGE) {
                                this.travelTo(toBuild, { maxRooms: 1 });
                                return
                            }

                        }
                    }
                    else if (targetStructure != null) {
                        //repairing
                        this.say("rep2")
                        if (this.repair(targetStructure) == ERR_NOT_IN_RANGE) {
                            this.travelTo(targetStructure, {maxRooms: 1 });
                            return
                        }
                    }
                    else if (toBuild != null) {
                        //building
                        if (this.build(toBuild) == ERR_NOT_IN_RANGE) {
                            this.travelTo(toBuild, {maxRooms: 1 });
                            return
                        }
                    }
                    else {
                        global.heap.creeps[this.name].targetStructureId = undefined;

                    }
                }



            }
            else {
                if (this.pos.x == 49 || this.pos.y == 49 || this.pos.x == 1 || this.pos.y == 1) {
                    this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom))
                }
            }
        }

    }
    else {
        this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom))
        if (this.memory.targetRoom != undefined) {
            //this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom));
        }

    }




};

