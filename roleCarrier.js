
// Every constant definied in separate file
const C = require('constants');
const Movement = require('screeps-movement');
const sleep = require('creepSleep')
var Traveler = require('Traveler');
const { fill } = require('lodash');



class otherRoomPos {
    constructor(pos) {
        this.pos = pos
    }
}


Creep.prototype.increaseBalancer = function increaseBalancer() {
    var aux = 0
    if (Game.getObjectById(this.memory.homeContainer) != null) {
        Math.min(this.store[RESOURCE_ENERGY], Game.getObjectById(this.memory.homeContainer).store.getFreeCapacity(RESOURCE_ENERGY))
    }
    if (aux == 0) {
        aux = this.store[RESOURCE_ENERGY]
    }
    if (Game.rooms[this.memory.homeRoom].memory.delivered_energy == undefined) {
        Game.rooms[this.memory.homeRoom].memory.delivered_energy = aux
    }
    else if (Game.rooms[this.memory.homeRoom].memory.energyBalance != undefined) {
        Game.rooms[this.memory.homeRoom].memory.energyBalance += aux
    }
}


Creep.prototype.roleCarrier = function roleCarrier() {


    if (!this.spawning && this.room.name == this.memory.targetRoom && this.pos.x != 49 && this.pos.y != 49 && this.pos.x != 0 && this.pos.y != 0) {
        global.heap.creeps[this.name].inTargetRoom = true
    }
    else {
        global.heap.creeps[this.name].inTargetRoom = false
    }
    if (this.memory.boostingList == undefined) {
        //this.memory.boostingList = ["KH", "KH2O", "XKH2O"];//boost types that creep accepts
        this.memory.boostingList = []
    }
    if (true /*boosting_driver(this, spawn, this.memory.boostingList, CARRY) == -1 */) {




        for (src of Game.rooms[this.memory.homeRoom].memory.harvestingSources) {
            if (src.id == this.memory.sourceId) {

                if (this.ticksToLive > C.CREEP_TICKS_TO_LIVE_BUFFER || this.spawning) {
                    src.carryPower += this.store.getCapacity() / (src.distance * 2);
                    global.heap.rooms[this.memory.targetRoom].carryPower += this.store.getCapacity() / (src.distance * 2);
                }
                break;
            }
        }


        var spawn = null;
        if (Game.rooms[this.memory.homeRoom].memory.spawnId != undefined && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.spawnId) != null) {
            spawn = Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.spawnId)
        }






        if (this.store.getFreeCapacity() == 0 || this.ticksToLive < this.memory.sourceDistance * 1.1) {


            this.memory.collecting = false

        }

        if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0 || this.memory.collecting == undefined) {
            this.memory.collecting = true;
            global.heap.creeps[this.name]={}
            this.memory.closestHomeContainer = undefined;



        }

        if (global.heap.creeps[this.name].targetRoomContainers != undefined && global.heap.creeps[this.name].targetRoomContainers.length > 0) {
            for (let i = 0; i < global.heap.creeps[this.name].targetRoomContainers.length; i++) {
                if (Game.getObjectById(global.heap.creeps[this.name].targetRoomContainers[i]) == null) {
                    global.heap.creeps[this.name].targetRoomContainers = undefined;
                    break;
                }
            }
        }

        // define containers from which creep should withdraw resources
        if (global.heap.creeps[this.name].targetRoomContainers == undefined ||
            (global.heap.creeps[this.name].targetRoomContainers != undefined && global.heap.creeps[this.name].targetRoomContainers.length == 0)) {

            if (this.memory.targetRoom == this.memory.homeRoom) {
                //if creep.target_room is creep.home_room
                var spawnPos = Game.rooms[this.memory.homeRoom].memory.spawnPos

                if (this.memory._findHomeContainers != undefined) { this.memory._findHomeContainers++ }
                else { this.memory._findHomeContainers = 1 }
                var creepHomeRoom = this.memory.homeRoom
                if (spawnPos != undefined) {
                    global.heap.creeps[this.name].targetRoomContainers = this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER
                                && ((structure.pos.x != spawnPos.x - 2 || structure.pos.y != spawnPos.y - 2) &&
                                    (structure.pos.x != spawnPos.x + 2 || structure.pos.y != spawnPos.y - 2))
                                && Game.rooms[creepHomeRoom].memory.controllerContainerPos!=undefined &&
                                (structure.pos.x != Game.rooms[creepHomeRoom].memory.controllerContainerPos.x ||
                                    structure.pos.y != Game.rooms[creepHomeRoom].memory.controllerContainerPos.y ||
                                    structure.pos.roomName != creepHomeRoom);
                        }
                    });
                    this.memory._targetRoomContainers = global.heap.creeps[this.name].targetRoomContainers
                }
                else {
                    containers = []
                }


            }
            else {
                //get containers of target_room
                if (Game.rooms[this.memory.targetRoom] != undefined) {

                    if (this.memory._findTargetContainers != undefined) { this.memory._findTargetContainers++ }
                    else { this.memory._findTargetContainers = 1 }

                    global.heap.creeps[this.name].targetRoomContainers = Game.rooms[this.memory.targetRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });

                }

            }

        }


        if (this.memory.collecting) {// if creep have free space


            var fillersPos = []
            if (global.heap.rooms[this.memory.homeRoom].fillers != undefined) {
                fillersPos = global.heap.rooms[this.memory.homeRoom].fillers
            }





            if ((!global.heap.creeps[this.name].inTargetRoom || (this.room.name == this.memory.targetRoom && this.pos.inRangeTo(spawn, 4)))// && this.memory.homeRoom!=this.memory.targetRoom
                && (global.heap.rooms[this.memory.homeRoom].defensiveQueue != undefined && !global.heap.rooms[this.memory.homeRoom].defensiveQueue.some(obj => obj.role === C.ROLE_SOLDIER))
                //&& global.heap.creeps[this.name].maxContainer != undefined  // this condition might be wrong
            ) {
                
                const destination = new RoomPosition(25, 25, this.memory.targetRoom);
                this.say("tr1")
                this.travelTo(destination, { range: 22 })
                /*
                if(this.memory.resourceToCollect==undefined
                    || global.heap.creeps[this.name].maxContainer==undefined
                )
                {
                    return
                }
                */

            }
            if (global.heap.creeps[this.name].targetRoomContainers != undefined && global.heap.creeps[this.name].targetRoomContainers.length > 0) {// find max_container and take resources from it or go sleep

                //finding max_container
                if (global.heap.creeps[this.name].maxContainer == undefined) {
                    //setting biggestResource to 0 by default will result in not chosing containers with RESOURCE_ENERGY=0
                    var biggestResource = 0;

                    for (var con of global.heap.creeps[this.name].targetRoomContainers) {
                        if (con.store.getUsedCapacity() > biggestResource) {
                            global.heap.creeps[this.name].maxContainer = con
                            biggestResource = con.store.getUsedCapacity();
                        }
                    }
                }
                else if (global.heap.creeps[this.name].maxContainer != null) {
                    if (global.heap.creeps[this.name].maxContainer.store.getUsedCapacity() == 0
                && Game.time%6==0) {
                        global.heap.creeps[this.name].maxContainer = undefined;
                    }
                }
                else {
                    global.heap.creeps[this.name].maxContainer
                    global.heap.creeps[this.name].maxContainer = undefined;
                }


                if (global.heap.creeps[this.name].maxContainer != undefined && global.heap.creeps[this.name].maxContainer != null) {
                    // take all resources from container


                    for (let resource in global.heap.creeps[this.name].maxContainer.store) {
                        if(global.heap.creeps[this.name].maxContainer.id!=undefined && Game.getObjectById(global.heap.creeps[this.name].maxContainer.id)==null)
                        {
                            global.heap.creeps[this.name].maxContainer=undefined
                            global.heap.creeps[this.name].targetRoomContainers=undefined;
                            break;
                        }
                        if (this.withdraw(global.heap.creeps[this.name].maxContainer, resource) == ERR_NOT_IN_RANGE
                            || this.pos.inRangeTo(spawn, 4)) {
                                this.say("tr2")
                                //this.say(global.heap.creeps[this.name].maxContainer.pos)
                            this.travelTo(global.heap.creeps[this.name].maxContainer.pos,{ ignoreCreeps:false,obstacles: fillersPos  })
                            break;
                        }
                    }

                }
                else {
                    //here creep can wait at spawn blocking it
                }



            }
            else {// no containers - look for dropped resources, if no resource go sleep

                if (this.memory.resourceToCollect == undefined && this.memory.targetRoom != undefined && Game.rooms[this.memory.targetRoom] != undefined) {

                    var carrierCapacity = this.store.getCapacity()
                    var carrierUsedCapacity = this.store.getUsedCapacity()
                    var droppedResource = undefined

                    if (this.memory._findResources != undefined) { this.memory._findResources++ }
                    else { this.memory._findResources = 1 }

                    var droppedResource = Game.rooms[this.memory.targetRoom].find(FIND_DROPPED_RESOURCES, {
                        filter: function (resource) {
                            return resource.amount >= (carrierCapacity - carrierUsedCapacity) / 4
                        }
                    });


                    if (droppedResource != undefined && droppedResource != null && droppedResource.length > 0) {
                        var max_res_amount = 0;
                        var max_res_id = undefined;
                        for (let a of droppedResource) {
                            if (a.amount > max_res_amount) {
                                max_res_amount = a.amount;
                                max_res_id = a.id;
                            }
                        }
                        if (max_res_id != null) {
                            this.memory.resourceToCollect = max_res_id;
                        }

                    }
                    if (this.store[RESOURCE_ENERGY] == 0) {
                        var avoid = [];
                        if (this.pos.inRangeTo(spawn, 3)) {
                            avoid.push(spawn)
                        }
                        if (this.room.storage != undefined && this.pos.inRangeTo(this.room.storage, 3)) {
                            avoid.push(this.room.storage)
                        }
                        if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null &&
                            this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)) {
                            avoid.push(Game.getObjectById(this.memory.homeContainer));
                        }

                        if (avoid.length == 0) {
                            this.sleep(20);
                        }
                    }

                }


                if (this.memory.resourceToCollect != undefined) {
                    if (Game.getObjectById(this.memory.resourceToCollect) != null) {
                        global.heap.creeps[this.name].maxContainer = undefined;
                        if (this.pickup(Game.getObjectById(this.memory.resourceToCollect)) == ERR_NOT_IN_RANGE
                            || this.pos.inRangeTo(spawn, 4)) {
                                this.say("tr3")
                            this.travelTo(Game.getObjectById(this.memory.resourceToCollect),{ ignoreCreeps:false,obstacles: fillersPos  })
                        }
                        else if (Game.getObjectById(this.memory.resourceToCollect) == null) {
                            this.memory.resourceToCollect = undefined
                        }
                    }
                    else {
                        delete this.memory.resourceToCollect;
                    }
                    return;
                }
                else {
                    this.say("tr4")
                    this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom), { obstacles: fillersPos })
                }
            }

        }
        else {//creep is full - go home_room_container

            global.heap.creeps[this.name].maxContainer = undefined;
            //Passing energy to fillers containers
            if (Game.rooms[this.memory.homeRoom].memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START || Game.time % 2 == 0) {

                if (global.heap.creeps[this.name].fillerContainers != undefined) {
                    for (fc of global.heap.creeps[this.name].fillerContainers) {
                        if (fc == undefined) {
                            global.heap.creeps[this.name].fillerContainers = undefined;
                            break
                        }
                    }
                }

                if (global.heap.creeps[this.name].fillerContainers == undefined && Game.rooms[this.memory.homeRoom].memory.fillerContainers != undefined) {
                    global.heap.creeps[this.name].fillerContainers = []
                    for (id of Game.rooms[this.memory.homeRoom].memory.fillerContainers) {
                        var aux = Game.getObjectById(id)
                        if (aux != null) {
                            global.heap.creeps[this.name].fillerContainers.push(aux)
                        }
                    }
                }

                if (global.heap.creeps[this.name].fillerContainers != undefined) {
                    for (fc of global.heap.creeps[this.name].fillerContainers) {

                        if (this.pos.isNearTo(fc.pos)) {
                            var result = this.transfer(fc, RESOURCE_ENERGY)
                            if (result == OK) {
                                this.increaseBalancer()
                                return;
                            }
                        }
                    }
                }

                //passing energy to woekers
                for (w of global.heap.rooms[this.memory.homeRoom].myWorkers) {
                    var worker = Game.getObjectById(w)
                    if (worker == null) { continue; }
                    if (worker.pos.isNearTo(this.pos) && worker.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        var transferResut = this.transfer(worker, RESOURCE_ENERGY)
                        if (transferResut == OK && this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
                            this.memory.collecting = true;
                            this.decreaseBalancer();
                            return;
                        }
                    }
                }
            }


            if (Game.rooms[this.memory.homeRoom].storage != undefined && Game.rooms[this.memory.homeRoom].controller.level >= 4) {
                // if home_room have storage
                this.memory.homeContainer = Game.rooms[this.memory.homeRoom].storage.id;
            }
            else {
                //if(this.memory.targetRoom!=this.memory.homeRoom)
                //{
                if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) == null
                    || (this.memory.homeContainer != undefined &&
                        Game.getObjectById(this.memory.homeContainer).store.getCapacity() - Game.getObjectById(this.memory.homeContainer).store.getUsedCapacity() == 0)) {
                    this.memory.homeContainer = undefined
                }
                var spawnPos = Game.rooms[this.room.name].memory.spawnPos
                //find containers that are fillers containers or controller container
                if (spawnPos != undefined) {
                    if (this.memory._findByRange != undefined) { this.memory._findByRange++ }
                    else { this.memory._findByRange = 1 }
                    var container = this.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.store != undefined && structure.store.getCapacity() - structure.store.getUsedCapacity() > 0
                                && structure.structureType != STRUCTURE_TERMINAL &&
                                ((structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawnPos.x + 2 && structure.pos.y == spawnPos.y - 2)
                                    || (structure.structureType == STRUCTURE_CONTAINER && structure.pos.x == spawnPos.x - 2 && structure.pos.y == spawnPos.y - 2)
                                    || structure.structureType == STRUCTURE_CONTAINER && structure.pos.inRangeTo(Game.rooms[this.memory.homeRoom].controller, 4));
                        }
                    });
                    if (container != null) {
                        this.memory.homeContainer = container.id;
                    }
                    else if (spawn != undefined && spawn.store != undefined && spawn.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
                        //target room do not have containers - store in spawn
                        this.memory.homeContainer = spawn.id;
                    }
                    else if (global.heap.rooms[this.memory.homeRoom].myWorkers != undefined && global.heap.rooms[this.memory.homeRoom].myWorkers.length > 0) {

                        // no free space in any structure - put energy into random worker
                        this.increaseBalancer()
                        var workersAmount = global.heap.rooms[this.memory.homeRoom].myWorkers.length
                        this.memory.homeContainer = global.heap.rooms[this.memory.homeRoom].myWorkers[Math.random(workersAmount)]

                    }
                    else {
                        a = Math.floor(Math.random() * (8 - 1 + 1)) + 1
                        //this.increaseBalancer()
                        this.move(a)//Random number in range <1:8>

                    }
                }
                else {
                    this.say("tr5")
                    this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom))//,{ range: 5})
                }

                //}
            }
            if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null) {



                if (Game.getObjectById(this.memory.homeContainer).structureType == STRUCTURE_STORAGE) {
                    for (let res in this.store) {
                        var transferResut = this.transfer(Game.getObjectById(this.memory.homeContainer), res);
                        if (transferResut == ERR_NOT_IN_RANGE) {
                            this.say("tr6")
                            this.travelTo(Game.getObjectById(this.memory.homeContainer), { obstacles: fillersPos  })
                            break;
                        }
                        else if (transferResut == OK) {


                        }
                    }
                }
                else {
                    for (let res in this.store) {

                        var transferResut = this.transfer(Game.getObjectById(this.memory.homeContainer), res);
                        if (Game.getObjectById(this.memory.homeContainer) != null && Game.getObjectById(this.memory.homeContainer).store.getFreeCapacity(RESOURCE_ENERGY) == 0) {


                            this.fleeFrom([Game.getObjectById(this.memory.homeContainer)], 3)
                            this.memory.homeContainer = undefined
                            break;
                        }
                        if (transferResut == ERR_NOT_IN_RANGE) {

                            this.say("tr7")
                            this.travelTo(Game.getObjectById(this.memory.homeContainer), { obstacles: fillersPos })

                            break;
                        }
                        else if (transferResut == ERR_FULL) {

                            this.increaseBalancer()

                            break;

                            //this.drop(RESOURCE_ENERGY)

                        }
                        else if (transferResut == OK) {

                            this.increaseBalancer()

                        }
                        /*
                        if (this.pos.inRangeTo(Game.getObjectById(this.memory.homeContainer), 3)
                            && !this.pos.isNearTo(Game.getObjectById(this.memory.homeContainer))) {
                            var empty_carriers = this.pos.findInRange(FIND_MY_CREEPS, 1, {
                                filter:
                                    function (cr) {
                                        return cr.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                                    }
                            })
                            if (empty_carriers.length > 0) {

                                this.transfer(empty_carriers[0], RESOURCE_ENERGY)
                            }
                        }
                            */

                    }
                }
            }
        }



    }

};