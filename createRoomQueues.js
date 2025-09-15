// Every constant definied in separate file
const C = require('constants');
const { ROLE_RESERVER, STORAGE_ENERGY_BOTTOM } = require('./constants');
//defining local heap
const localHeap = {}



class harvestingSourceRequestFarmer {
    constructor(sourceId, sourceRoom) {
        this.sourceId = sourceId;
        this.sourceRoom = sourceRoom
        this.role = C.ROLE_HARVESTER;
    }
}

class harvestingSourceRequestCarrier {
    constructor(sourceId, roomName, distance) {
        this.sourceId = sourceId;
        this.sourceRoom = roomName
        this.srcDistance = distance
        this.role = C.ROLE_CARRIER;
    }
}

class generalRoomRequest {
    constructor(roomName, role, type2 = undefined) {
        this.roomName = roomName
        this.role = role;
        this.type2 = type2
    }
}

class quadMemberRequest {
    constructor(quadId, role, bodyType, isFirstMember = false) {
        this.quadId = quadId
        this.role = role
        this.bodyType = bodyType
        this.isFirstMember = isFirstMember
    }
}



class soldierRequest {
    constructor(roomName, role, isMelee) {
        this.roomName = roomName
        this.role = role
        this.isMelee = isMelee
    }
}


Room.prototype.createRoomQueues = function createRoomQueues() {

    if (global.heap.rooms[this.name].offensiveQueue == undefined) {
        global.heap.rooms[this.name].offensiveQueue = []
    }
    if (global.heap.rooms[this.name].defensiveQueue == undefined) {
        global.heap.rooms[this.name].defensiveQueue = []
    }
    if (global.heap.rooms[this.name].harvestingQueue == undefined) {
        global.heap.rooms[this.name].harvestingQueue = []
    }

    if (global.heap.rooms[this.name].civilianQueue == undefined) {
        global.heap.rooms[this.name].civilianQueue = []
    }


    // Scout
    if (this.memory.roomsToScan == undefined) {
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_SCOUT) == undefined) {
            console.log("adding socut because of roomsToScan=undefined")
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
        }

    }
    else if (this.memory.roomsToScan != undefined) {
        if (this.memory.roomsToScan.length > 0) {
            if (global.heap.rooms[this.name].haveScout == false) {
                if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_SCOUT) == undefined) {
                    console.log("adding socut")
                    console.log(global.heap.rooms[this.name].civilianQueue.find((role) => role === C.ROLE_SCOUT))
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
                }
            }
        }
    }

    if (this.storage != undefined) {

        if (global.heap.rooms[this.name].haulersParts < C.HAULER_REQ_CARRY_PARTS && Game.time % 2 == 0) {
            this.memory._haulersParts = global.heap.rooms[this.name].haulersParts
            this.memory._needHaulersParts = C.HAULER_REQ_CARRY_PARTS
            this.memory._haulersPartsTime = Game.time
            console.log("Adding hauler: ", global.heap.rooms[this.name].haulersParts, " < ", C.HAULER_REQ_CARRY_PARTS)
            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_HAULER) == undefined) {
                global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_HAULER))
            }

        }
    }


    //  Carriers / Harvesters
    var areCarriersSatisfied = true
    var areHarvestersSatisfied = true
    for (harvestingSource of this.memory.harvestingSources) {

        //Skipping reserved by not "me"
        if (Game.rooms[harvestingSource.roomName] != undefined && Game.rooms[harvestingSource.roomName].controller.reservation != undefined
            && Game.rooms[harvestingSource.roomName].controller.reservation.username != global.heap.userName) {
            continue;
        }
        //Skippig rooms containing hostileCreeps
        if (global.heap.rooms[harvestingSource.roomName] != undefined && global.heap.rooms[harvestingSource.roomName].hostiles.length > 0 && harvestingSource.roomName != this.name) {

            continue;
        }

        // Fillers
        if (this.controller.level > 1 && global.heap.rooms[this.name].fillers < 4) {
            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_FILLER) == undefined) {
                global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_FILLER))
            }
        }


        //Carriers and Harvesters for sure won't be mixed on queue
        if (this.storage != undefined) {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                    if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CARRIER) == undefined) {
                        global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                    }
                }
                areCarriersSatisfied = false
                break;

            }//Harvesters
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_HARVESTER) == undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                }
                areHarvestersSatisfied = false
                break;
            }
        }
        else //if (this.memory.energyBalance <= 1.5 || true)
        {
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                    if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CARRIER) == undefined) {
                        global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                    }
                    areCarriersSatisfied = false
                    break;

                }

            }//Harvesters
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters) {
                if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_HARVESTER) == undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                }
                areHarvestersSatisfied = false
                break;
            }
        }


    }
    if (this.memory.harvestingRooms != undefined) {
        for (harvestingRoom of this.memory.harvestingRooms) {
            if (harvestingRoom.repairerId == undefined && this.memory.roomsToScan.length == 0) {
                if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_REPAIRER) == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name, C.ROLE_REPAIRER))
                }

                break;
            }
        }
    }





    // Workers below RCL4 - wthout storage
    if (this.storage == undefined || this.controller.level < 4) {

        global.heap.rooms[this.name].needWorkersParts = 1

        if (this.memory.energyBalance > C.ENERGY_BALANCER_WORKER_SPAWN && Game.time % 2 == 0) {
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

            }

        }
        else if (global.heap.rooms[this.name].workersParts == 0 && this.energyAvailable <= SPAWN_ENERGY_CAPACITY && areHarvestersSatisfied && areCarriersSatisfied) {
            //this moght be not fully correct but it should assure that on rcl 1 we start spawning workers
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
            }
        }
        if (this.controller.level == 4 && this.storage == undefined) {//RCL 4 but no storage
            if (global.heap.rooms[this.name].workersParts < 1) {
                global.heap.rooms[this.name].needWorkersParts = 1
                if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))
                }
            }
        }
    }
    else {//Workers above and on RCL4
        global.heap.rooms[this.name].needWorkersParts = 1


        if ((this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.UPGRADE_FACTOR && this.controller.level < 8)
            || (global.heap.rooms[this.name].construction.length > 0 && this.controller.level == 8)
        ) {
            global.heap.rooms[this.name].needWorkersParts = this.storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR
        }
        /*
        else if ( (this.storage!=undefined && this.storage.store[RESOURCE_ENERGY]< C.UPGRADE_FACTOR) || (this.controller.ticksToDowngrade!=undefined && this.controller.ticksToDowngrade>CONTROLLER_DOWNGRADE[this.controller.level]))
        {
            global.heap.rooms[this.name].needWorkersParts=0;
        }
            */

        if (global.heap.rooms[this.name].workersParts < global.heap.rooms[this.name].needWorkersParts) {
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

            }
        }
    }



    global.heap.rooms[this.name].areHarvestingNeedsSatisfied = areHarvestersSatisfied && areCarriersSatisfied

    //Claimer and colonizers
    if (global.heap.rooms[this.name].areHarvestingNeedsSatisfied) {
        for (rc of Memory.roomsToColonize) {
            if (rc.colonizer == this.name && rc.name != this.name) {

                if (global.heap.rooms[rc.name].claimer == undefined) {
                    if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_CLAIMER) == undefined) {
                        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(rc.name, C.ROLE_CLAIMER))
                        break;
                    }
                }
                else if (global.heap.rooms[rc.name].colonizers.length < global.heap.rooms[rc.name].maxColonizers) {
                    if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_COLONIZER) == undefined) {
                        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(rc.name, C.ROLE_COLONIZER))
                        break;
                    }
                }


            }

        }
    }



    // Reservers
    if (this.controller.level >= 3) {
        if (this.memory.harvestingRooms != undefined) {
            for (room of this.memory.harvestingRooms) {
                if (room.reserverId == undefined && room.name != this.name) {
                    if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_RESERVER) == undefined) {
                        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(room.name, C.ROLE_RESERVER))
                    }
                }
            }
        }

    }


    //Mineral Carriers
    if (Game.getObjectById(this.memory.mineralId) != null && Game.getObjectById(this.memory.mineralId).mineralAmount > 0 && global.heap.rooms[this.name].mineralCarryPower < global.heap.rooms[this.name].mineralMiningPower
        && this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM) {//Add to civilian queue
        //console.log("Adding mineralCarrier")
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_MINERAL_CARRIER) == undefined) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_MINERAL_CARRIER))
        }
    }
    else {
        //Miners

        if (Game.getObjectById(this.memory.mineralId) != null && Game.getObjectById(this.memory.mineralId).mineralAmount > 0 && global.heap.rooms[this.name].miners.length < this.memory.mineralOpenPositions.length
            && this.memory.extractorId != undefined) {//Add to civilian queue
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_MINER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_MINER))
            }
        }
    }


    if (global.heap.rooms[this.name].outLabsId.length > 0 && global.heap.rooms[this.name].doctorId == undefined
        && global.heap.rooms[this.name].reaction != undefined
    ) {
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_DOCTOR) == undefined) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_DOCTOR))
        }

    }

    // console.log("global.heap.rooms[this.name].mineralMiningPower: ", global.heap.rooms[this.name].mineralMiningPower, " / global.heap.rooms[this.name].mineralCarryPower: ", global.heap.rooms[this.name].mineralCarryPower)

    //Rampart Repairers - civilian queue
    if (global.heap.rooms[this.name].requiredRampartsRepairersPower > global.heap.rooms[this.name].rampartRepairersPower
        && global.heap.rooms[this.name].myRamparts.length>0
    ) {
        if (global.heap.rooms[this.name].state.includes(C.STATE_UNDER_ATTACK)) {//Add to defensive queue
            if (global.heap.rooms[this.name].defensiveQueue.find(({ role }) => role === C.ROLE_RAMPART_REPAIRER) == undefined) {
                global.heap.rooms[this.name].defensiveQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
            }

            //Debugging
            this.memory._repairersAddingTick=Game.time
            this.memory._global_heap_rooms_this_name_myRamparts_length=global.heap.rooms[this.name].myRamparts.length
            this.memory._global_heap_rooms_this_name_requiredRampartsRepairersPower=global.heap.rooms[this.name].requiredRampartsRepairersPower
            this.memory._global_heap_rooms_this_name_rampartRepairersPower=global.heap.rooms[this.name].rampartRepairersPower
            ////
        }
        else {//Add to civilian queue
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_RAMPART_REPAIRER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
            }
            //Debugging
            this.memory._repairersAddingTick=Game.time
            this.memory._global_heap_rooms_this_name_myRamparts_length=global.heap.rooms[this.name].myRamparts.length
            this.memory._global_heap_rooms_this_name_requiredRampartsRepairersPower=global.heap.rooms[this.name].requiredRampartsRepairersPower
            this.memory._global_heap_rooms_this_name_rampartRepairersPower=global.heap.rooms[this.name].rampartRepairersPower
            ////
        }

    }


    if (this.storage != undefined && this.memory.resourceManagerId == undefined) {
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_RESOURCE_MANAGER) == undefined) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RESOURCE_MANAGER))
        }
    }

    //Soldiers
    if (this.memory.harvestingRooms != undefined) {
        for (r of this.memory.harvestingRooms) {
            if (global.heap.rooms[r.name] != undefined && (global.heap.rooms[r.name].hostiles.length > 0 || global.heap.rooms[r.name].hostileStructures.length > 0)) {

                var ifNeedMelee = false;
                if (global.heap.rooms[r.name].hostiles.length == 0 && global.heap.rooms[r.name].hostileStructures.length > 0) {
                    ifNeedMelee = true
                }
                if (global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower <= global.heap.rooms[r.name].hostileHealPower
                    || global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower == 0
                ) {
                    if (global.heap.rooms[this.name].defensiveQueue.find(({ role }) => role === C.ROLE_SOLDIER) == undefined) {
                        global.heap.rooms[this.name].defensiveQueue.push(new soldierRequest(r.name, C.ROLE_SOLDIER, ifNeedMelee))
                    }



                }
            }
        }
    }

    var soldierIndex = global.heap.rooms[this.name].defensiveQueue.findIndex(({ role }) => role === C.ROLE_SOLDIER)
    if (soldierIndex != -1 && global.heap.rooms[global.heap.rooms[this.name].defensiveQueue[soldierIndex].roomName].hostiles.length == 0
        && global.heap.rooms[global.heap.rooms[this.name].defensiveQueue[soldierIndex].roomName].hostileStructures.length == 0
    ) {
        global.heap.rooms[this.name].defensiveQueue.shift(soldierIndex)
    }




    ifLog = false
    if (ifLog) {
        console.log("defensiveQueue:")
        for (a of global.heap.rooms[this.name].defensiveQueue) {
            console.log(a.role)
        }

        console.log("civilian queue:")
        for (a of global.heap.rooms[this.name].civilianQueue) {
            console.log(a.role)
        }

        console.log("harvestingQueue:")
        for (a of global.heap.rooms[this.name].harvestingQueue) {
            console.log(a.role)
        }

        console.log("offensiveQueue:")
        for (a of global.heap.rooms[this.name].offensiveQueue) {
            console.log(a.role)
        }
    }




}