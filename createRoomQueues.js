// Every constant definied in separate file
const C = require('constants');
const { ROLE_RESERVER, STORAGE_ENERGY_BOTTOM } = require('./constants');




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




    if (this.memory.spawnId != undefined) {
        var sp1 = Game.getObjectById(this.memory.spawnId)
    }
    if (this.memory.spawn2Id != undefined) {
        var sp2 = Game.getObjectById(this.memory.spawn2Id)
    }
    if (this.memory.spawn3Id != undefined) {
        var sp3 = Game.getObjectById(this.memory.spawn3Id)
    }

    var minSpawnTime = 99999

    if (sp1 != null && sp1.Spawning != null) {
        if (sp1.Spawning.needTime - sp1.Spawning.remainingTime < minSpawnTime) {
            minSpawnTime = sp1.Spawning.needTime - sp1.Spawning.remainingTime
        }
    }
    if (sp2 != null && sp2.Spawning != null) {
        if (sp2.Spawning.needTime - sp2.Spawning.remainingTime < minSpawnTime) {
            minSpawnTime = sp2.Spawning.needTime - sp2.Spawning.remainingTime
        }
    }
    if (sp3 != null && sp3.Spawning != null) {
        if (sp3.Spawning.needTime - sp3.Spawning.remainingTime < minSpawnTime) {
            minSpawnTime = sp3.Spawning.needTime - sp3.Spawning.remainingTime
        }
    }





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

    if (minSpawnTime < 2) {
        return;
    }


    // Scout
    if (this.memory.roomsToScan == undefined) {
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_SCOUT) == undefined) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
            return
        }

    }
    else if (this.memory.roomsToScan != undefined) {
        if (this.memory.roomsToScan.length > 0) {
            if (global.heap.rooms[this.name].haveScout == false) {
                if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_SCOUT) == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_SCOUT))
                }
            }
        }
    }

    if (this.storage != undefined && this.controller.level >= 4) {

        if (global.heap.rooms[this.name].haulersParts < C.HAULER_REQ_CARRY_PARTS && Game.time % 2 == 0) {
            this.memory._haulersParts = global.heap.rooms[this.name].haulersParts
            this.memory._needHaulersParts = C.HAULER_REQ_CARRY_PARTS
            this.memory._haulersPartsTime = Game.time
            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_HAULER) == undefined) {
                global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_HAULER))
            }

        }

        if (this.storage.store[RESOURCE_ENERGY] > C.STORAGE_BALANCER_START * 4
            && global.heap.rooms[this.name].controllerHauler == undefined
            && this.memory.upgradersContainerId != undefined && Game.getObjectById(this.memory.upgradersContainerId) != null
        ) {

            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CONTROLLER_HAULER) == undefined) {
                global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_CONTROLLER_HAULER))
            }
        }
    }


    // Fillers
    if (this.controller.level > 1 && global.heap.rooms[this.name].fillers.length < 4
        && ((global.heap.rooms[this.name].myExtensions != undefined && global.heap.rooms[this.name].myExtensions.length > 0)
            || (this.memory.fillerContainers != undefined && this.memory.fillerContainers.length > 0))
    ) {
        if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_FILLER) == undefined) {
            global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_FILLER))
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







        //Carriers and Harvesters for sure won't be mixed on queue
        if (this.storage != undefined) {

            //skipping sources in mainRooms with sourcesLinks
            var haveSourcesLinks = (harvestingSource.roomName == this.name && this.memory.sourcesLinksId != undefined && this.memory.sourcesLinksId.length > 1)
            if (haveSourcesLinks) {
                harvestingSource.carryPower = 9999999
            }
            if (harvestingSource.carryPower < harvestingSource.harvestingPower && haveSourcesLinks != true
            ) {
                //testing
                for (hr of this.memory.harvestingRooms) {
                    if (global.heap.rooms[hr.name].carryPower < global.heap.rooms[hr.name].harvestingPower
                        && global.heap.rooms[hr.name].carryPower < hr.sourcesAmount * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)
                        && global.heap.rooms[this.name].carriers < C.CARRIERS_LIMIT
                    ) {
                        //Carriers
                        if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CARRIER) == undefined) {
                                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                            }
                        }
                        areCarriersSatisfied = false
                        break;
                    }
                }
                //



            }//Harvesters
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters
                && global.heap.rooms[this.name].harvestingSources[harvestingSource.id].harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)) {


                if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_HARVESTER) == undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestFarmer(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                }
                areHarvestersSatisfied = false
                break;


            }
        }
        else //if (this.memory.energyBalance <= 1.5 || true)
        {

            var haveSourcesLinks = (harvestingSource.roomName == this.name && this.memory.sourcesLinksId != undefined && this.memory.sourcesLinksId.length > 1)
            if (haveSourcesLinks) {
                harvestingSource.carryPower = 9999999
            }
            if (harvestingSource.carryPower < harvestingSource.harvestingPower && haveSourcesLinks != true
            ) {
                //testing
                for (hr of this.memory.harvestingRooms) {
                    if (global.heap.rooms[hr.name].carryPower < global.heap.rooms[hr.name].harvestingPower
                        && global.heap.rooms[hr.name].carryPower < hr.sourcesAmount * (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)
                        && global.heap.rooms[this.name].carriers < C.CARRIERS_LIMIT
                    ) {
                        //Carriers
                        if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                            if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CARRIER) == undefined) {
                                global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                            }
                        }
                        areCarriersSatisfied = false
                        break;
                    }
                }
                //



            }
            /*
            if (harvestingSource.carryPower < harvestingSource.harvestingPower) {
                //Carriers
                if (harvestingSource.id != undefined && harvestingSource.roomName != undefined) {
                    if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_CARRIER) == undefined) {
                        global.heap.rooms[this.name].harvestingQueue.push(new harvestingSourceRequestCarrier(harvestingSource.id, harvestingSource.roomName, harvestingSource.distance))
                    }
                    areCarriersSatisfied = false
                    break;

                }

            }*///Harvesters
            else if (harvestingSource.harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME) && harvestingSource.harvesters < harvestingSource.maxHarvesters
                && global.heap.rooms[this.name].harvestingSources[harvestingSource.id].harvestingPower < (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)) {

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
            if (harvestingRoom.repairerId == undefined && this.memory.roomsToScan != undefined && this.memory.roomsToScan.length == 0) {
                if (harvestingRoom.name == this.name) {
                    if (this.storage == undefined) {
                        if (this.memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START && global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_REPAIRER) == undefined) {
                            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name, C.ROLE_REPAIRER))
                        }
                    }
                    else if (this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM || true) {
                        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_REPAIRER) == undefined) {
                            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name, C.ROLE_REPAIRER))
                        }
                    }

                }
                else if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_REPAIRER) == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(harvestingRoom.name, C.ROLE_REPAIRER))
                }

                break;
            }
        }
    }





    // Workers below RCL4 - wthout storage
    if (this.storage == undefined || this.controller.level < 4) {

        global.heap.rooms[this.name].needWorkersParts = 1
        if (global.heap.rooms[this.name].workersPopulation < C.MAX_WORKERS_POPULATION) {
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

    }
    else {//Workers above and on RCL4
        global.heap.rooms[this.name].needWorkersParts = 1


        if ((this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.LINEAR_WORKERS_AMOUNT_ENERGY_EDGE && this.controller.level < 8)
            || (global.heap.rooms[this.name].construction.length > 0 && this.controller.level == 8)
        ) {
            //global.heap.rooms[this.name].needWorkersParts = this.storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR_1
            global.heap.rooms[this.name].needWorkersParts = Math.pow((this.storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR_1), 2) / C.UPGRADE_FACTOR_2

        }
        /*
        else if ( (this.storage!=undefined && this.storage.store[RESOURCE_ENERGY]< C.UPGRADE_FACTOR_1) || (this.controller.ticksToDowngrade!=undefined && this.controller.ticksToDowngrade>CONTROLLER_DOWNGRADE[this.controller.level]))
        {
            global.heap.rooms[this.name].needWorkersParts=0;
        }
            */

        if (global.heap.rooms[this.name].workersParts < global.heap.rooms[this.name].needWorkersParts) {


            if (this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_TOP) {//storage is overfloved with energy
                //and there aren't any fillers in a queue
                if (global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined
                    && global.heap.rooms[this.name].harvestingQueue.find(({ role }) => role === C.ROLE_FILLER) == undefined) {
                    global.heap.rooms[this.name].harvestingQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

                }
            }
            else {
                if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_WORKER) == undefined) {
                    global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_WORKER))

                }
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
                if (global.heap.rooms[rc.name].myColonizeSoldiers.length == 0) {
                    if (global.heap.rooms[this.name].offensiveQueue.find(({ role }) => role === C.ROLE_SOLDIER) == undefined) {
                        global.heap.rooms[this.name].offensiveQueue.push(new generalRoomRequest(rc.name, C.ROLE_SOLDIER))
                        break;
                    }
                }
                else if (global.heap.rooms[rc.name].colonizers.length < global.heap.rooms[rc.name].maxColonizers) {
                    if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_COLONIZER) == undefined) {
                        global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(rc.name, C.ROLE_COLONIZER))
                        break;
                    }
                }
                else {
                    if (global.heap.rooms[rc.name].myColonizeSoldiers.length == global.heap.rooms[rc.name].maxSoldiers) {
                        if (global.heap.rooms[this.name].offensiveQueue.find(({ role }) => role === C.ROLE_SOLDIER) == undefined) {
                            global.heap.rooms[this.name].offensiveQueue.push(new generalRoomRequest(rc.name, C.ROLE_SOLDIER))
                            break;
                        }
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
    if (this.controller.level >= 6) {
        if (Game.getObjectById(this.memory.mineralId) != null && Game.getObjectById(this.memory.mineralId).mineralAmount > 0 && global.heap.rooms[this.name].mineralCarryPower < global.heap.rooms[this.name].mineralMiningPower
            // && this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM
        ) {//Add to civilian queue
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

        //doctor
        if (global.heap.rooms[this.name].outLabsId.length > 0 && global.heap.rooms[this.name].doctorId == undefined
            //&& global.heap.rooms[this.name].reaction != undefined
        ) {
            if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_DOCTOR) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_DOCTOR))
            }

        }

    }






    //Rampart Repairers - civilian queue
    if (global.heap.rooms[this.name].requiredRampartsRepairersPower > global.heap.rooms[this.name].rampartRepairersPower
        && global.heap.rooms[this.name].myRamparts.length > 0
    ) {
        if (global.heap.rooms[this.name].state.includes(C.STATE_UNDER_ATTACK)) {//Add to defensive queue
            if (global.heap.rooms[this.name].defensiveQueue.find(({ role }) => role === C.ROLE_RAMPART_REPAIRER) == undefined) {
                global.heap.rooms[this.name].defensiveQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
            }


        }
        else {//Add to civilian queue

            var energyStartCondition = false;
            if (this.storage != undefined && this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM) {
                energyStartCondition = true
            }
            else if (this.memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START) {
                energyStartCondition = true
            }
            if (energyStartCondition == true
                && global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_RAMPART_REPAIRER) == undefined) {
                global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RAMPART_REPAIRER))
            }

        }

    }

    if (this.storage != undefined && global.heap.rooms[this.name].resourceManagerId == undefined && Game.time % 3 == 0
        && this.controller.level >= 4
    ) {
        if (global.heap.rooms[this.name].civilianQueue.find(({ role }) => role === C.ROLE_RESOURCE_MANAGER) == undefined) {
            global.heap.rooms[this.name].civilianQueue.push(new generalRoomRequest(this.name, C.ROLE_RESOURCE_MANAGER))
        }
    }

    //Soldiers
    if (this.memory.harvestingRooms != undefined) {
        for (r of this.memory.harvestingRooms) {
            if (global.heap.rooms[r.name] != undefined &&
                ((global.heap.rooms[r.name].hostiles != undefined && global.heap.rooms[r.name].hostiles.length > 0) || (global.heap.rooms[r.name].hostileStructures != undefined && global.heap.rooms[r.name].hostileStructures.length > 0))) {

                var ifNeedMelee = false;
                if (global.heap.rooms[r.name].hostiles.length == 0 && global.heap.rooms[r.name].hostileStructures.length > 0) {
                    ifNeedMelee = true
                }

                if (global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower <= global.heap.rooms[r.name].hostileHealPower
                    || global.heap.rooms[r.name].myAttackPower + global.heap.rooms[r.name].myRangedAttackPower < C.STRUCTURE_ONLY_ATTACK_POWER
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