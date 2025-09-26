
// Every constant definied in separate file
const C = require('constants');
const Movement = require('screeps-movement');
const sleep = require('creepSleep')
var Traveler = require('Traveler');
const { fill } = require('lodash');


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

const localHeap = {}

Creep.prototype.roleCarrier = function roleCarrier() {

    if(this.memory.homeRoom==this.memory.targetRoom)
    {
        this.say("home")
    }

    if (this.memory.boostingList == undefined) {
        //this.memory.boostingList = ["KH", "KH2O", "XKH2O"];//boost types that creep accepts
        this.memory.boostingList = []
    }
    if (true /*boosting_driver(this, spawn, this.memory.boostingList, CARRY) == -1 */) {




        for (src of Game.rooms[this.memory.homeRoom].memory.harvestingSources) {
            if (src.id == this.memory.sourceId) {

                src.carryPower += this.store.getCapacity() / (src.distance * 2);
                break;
            }
        }


        var spawn = null;
        if (Game.rooms[this.memory.homeRoom].memory.spawnId != undefined && Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.spawnId) != null) {
            spawn = Game.getObjectById(Game.rooms[this.memory.homeRoom].memory.spawnId)
        }




       

        if (this.store.getFreeCapacity() == 0 || this.ticksToLive < this.memory.sourceDistance * 1.1) {
            this.memory.collecting = false;
        }

        if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0 || this.memory.collecting == undefined) {
            this.memory.collecting = true;
            this.memory.closestHomeContainer = undefined;
        }

         if (localHeap.targetRoomContainers != undefined && localHeap.targetRoomContainers.length > 0) {
            for (let i = 0; i < localHeap.targetRoomContainers.length; i++) {
                if (Game.getObjectById(localHeap.targetRoomContainers[i]) == null) {
                    localHeap.targetRoomContainers = undefined;
                    break;
                }
            }
        }

        // define containers from which creep should withdraw resources
        if (localHeap.targetRoomContainers == undefined ||
            (localHeap.targetRoomContainers != undefined && localHeap.targetRoomContainers.length == 0)) {

            if (this.memory.targetRoom == this.memory.homeRoom) {
                //if creep.target_room is creep.home_room
                var spawnPos = Game.rooms[this.memory.homeRoom].memory.spawnPos

                if (this.memory._findHomeContainers != undefined) { this.memory._findHomeContainers++ }
                else { this.memory._findHomeContainers = 1 }
                if (spawnPos != undefined) {
                    localHeap.targetRoomContainers = this.room.find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER
                                && ((structure.pos.x != spawnPos.x - 2 || structure.pos.y != spawnPos.y - 2) &&
                                    (structure.pos.x != spawnPos.x + 2 || structure.pos.y != spawnPos.y - 2))
                                && (structure.pos.inRangeTo(Game.rooms[this.memory.homeRoom].controller.pos, 4) == false);
                        }
                    });
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

                    localHeap.targetRoomContainers = Game.rooms[this.memory.targetRoom].find(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return structure.structureType === STRUCTURE_CONTAINER;
                        }
                    });
                }

            }

        }


        if (this.memory.collecting) {// if creep have free space


            if ((Game.rooms[this.memory.targetRoom] == undefined || this.pos.inRangeTo(spawn, 4))
                && global.heap.rooms[this.memory.homeRoom].defensiveQueue != undefined &&
                !global.heap.rooms[this.memory.homeRoom].defensiveQueue.some(obj => obj.role === C.ROLE_SOLDIER)
                //&& localHeap.maxContainer != undefined  // this condition might be wrong
            ) {
                const destination = new RoomPosition(25, 25, this.memory.targetRoom);
                this.say("TR")
                this.travelTo(destination, { stuckValue: 2 })
            }
            if (localHeap.targetRoomContainers != undefined && localHeap.targetRoomContainers.length > 0) {// find max_container and take resources from it or go sleep

                //finding max_container
                if (localHeap.maxContainer == undefined) {
                    //setting biggestResource to 0 by default will result in not chosing containers with RESOURCE_ENERGY=0
                    var biggestResource = 0;

                    for (var con of localHeap.targetRoomContainers) {
                        if (con.store.getUsedCapacity() > biggestResource) {
                            localHeap.maxContainer = con
                            biggestResource = con.store.getUsedCapacity();
                        }
                    }
                }
                else if (localHeap.maxContainer != null) {
                    if (localHeap.maxContainer.store.getUsedCapacity() == 0) {
                        //turned of for debuggin - creep will go to container even if container is empty
                        //localHeap.maxContainer = undefined;
                    }
                }
                else {
                    localHeap.maxContainer = undefined;
                }


                if (localHeap.maxContainer != undefined && localHeap.maxContainer != null) {
                    // take all resources from container

                    //if (localHeap.maxContainer.store.getUsedCapacity(RESOURCE_ENERGY) == 0 && this.isNearTo(localHeap.maxContainer.pos.x,localHeap.maxContainer.pos.y)) {
                   //     this.fleeFrom(localHeap.maxContainer, { maxRooms: 1, range: 2 })
                   // }
                   // else {
                        for (let resource in localHeap.maxContainer.store) {
                            if (this.withdraw(localHeap.maxContainer, resource) == ERR_NOT_IN_RANGE
                                || this.pos.inRangeTo(spawn, 4)) {
                                    this.say("mC")
                                    this.say(localHeap.maxContainer.room.name)
                                this.travelTo(localHeap.maxContainer.pos, { stuckValue: 2 })
                                break;
                            }
                        }
                    //}



                    /*
                    if (localHeap.maxContainer.store.getUsedCapacity() < (this.store.getCapacity() - this.store.getUsedCapacity()) * 0.8 && localHeap.maxContainer.store.getUsedCapacity() < 2000) {
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

                            if (avoid.length == 0 && this.pos.inRangeTo(localHeap.maxContainer.pos.x, localHeap.maxContainer.pos.y, 3)) {
                                this.sleep(((this.store.getCapacity() - this.store.getUsedCapacity()) - localHeap.maxContainer.store.getUsedCapacity()) / 25);

                            }

                        }
                    }
                    */


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
                        localHeap.maxContainer = undefined;
                        if (this.pickup(Game.getObjectById(this.memory.resourceToCollect)) == ERR_NOT_IN_RANGE
                            || this.pos.inRangeTo(spawn, 4)) {
                                this.say("rC")
                            this.travelTo(Game.getObjectById(this.memory.resourceToCollect), { stuckValue: 2, range: 1 })
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
            }

        }
        else {//creep is full - go home_room_container


            //Passing energy to fillers containers
            if (Game.rooms[this.memory.homeRoom].memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START || Game.time % 2 == 0) {

                if(localHeap.fillerContainers!=undefined)
                {
                    for(fc of localHeap.fillerContainers)
                    {
                        if(fc==undefined){
                            localHeap.fillerContainers=undefined;
                             break
                            }
                    }
                }

                if(localHeap.fillerContainers== undefined && Game.rooms[this.memory.homeRoom].memory.fillerContainers!=undefined)
                {
                    localHeap.fillerContainers=[]
                    for(id of Game.rooms[this.memory.homeRoom].memory.fillerContainers)
                    {
                        var aux=Game.getObjectById(id)
                        if(aux!=null)
                        {
                            localHeap.fillerContainers.push(aux)
                        }
                    }
                }

                if(localHeap.fillerContainers!=undefined)
                {
                    for(fc of localHeap.fillerContainers)
                    {
                        
                        if(this.pos.isNearTo(fc.pos))
                        {
                            var result=this.transfer(fc,RESOURCE_ENERGY)
                            this.say(result)
                            if(result==OK)
                            {
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
                        this.say(a)
                        this.move(a)//Random number in range <1:8>

                    }
                }
                else {
                    this.say("hR")
                    this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom), { stuckValue: 2 })
                }

                //}
            }
            if (this.memory.homeContainer != undefined && Game.getObjectById(this.memory.homeContainer) != null) {



                if (Game.getObjectById(this.memory.homeContainer).structureType == STRUCTURE_STORAGE) {
                    for (let res in this.store) {
                        var transferResut = this.transfer(Game.getObjectById(this.memory.homeContainer), res);
                        if (transferResut == ERR_NOT_IN_RANGE) {
                            this.say("hC")
                            this.travelTo(Game.getObjectById(this.memory.homeContainer), { stuckValue: 2 })
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

                            this.travelTo(Game.getObjectById(this.memory.homeContainer), { avoidSk: true, range: 1, stuckValue: 2 })

                            break;
                        }
                        else if (transferResut == ERR_FULL) {

                            this.increaseBalancer()
                            localHeap.maxContainer = undefined;

                            break;

                            //this.drop(RESOURCE_ENERGY)

                        }
                        else if (transferResut == OK) {

                            this.increaseBalancer()
                            localHeap.maxContainer = undefined;
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