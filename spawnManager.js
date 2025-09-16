// Every constant definied in separate file
const C = require('constants');

const harvesterBody = require('harvesterBody')
const carrierBody = require('carrierBody')
const workerBody = require('workerBody')
const repairerBody = require('repairerBody');
const soldierBody = require('soldierBody')
const minerBody = require('minerBody')
const quadHealerBody = require('quadHealerBody')
const quadRangedBody = require('quadRangedBody')
const drainerBody = require('drainerBody');

//defining local heap
const localHeap = {}

function getBodyCost(body) {
    var cost = 0;
    for (b of body) {
        cost += BODYPART_COST[b]
    }
    return cost
}

Room.prototype.removeWrongStructures = function removeWrongStructures() {
    var counter = 0;
    if (this.memory.finalBuildingList != undefined && this.memory.finalBuildingList.length > 0) {
        var structures = this.find(FIND_STRUCTURES, {
            filter: function (str) {
                return str.structureType != STRUCTURE_SPAWN && str.structureType != STRUCTURE_STORAGE
                    && str.structureType != STRUCTURE_TERMINAL && str.structureType != STRUCTURE_RAMPART
            }
        })
        for (s of structures) {
            if (counter > 5) {
                break;
            }
            if (!this.memory.finalBuildingList.some(structure => structure.structureType == s.structureType && structure.x == s.pos.x && structure.y == s.pos.y)) {
                counter++
                console.log("removing: ", s.structureType, " (", s.pos.x, ":", s.pos.y, ") with result: ", s.destroy())
                //s.destroy();
            }
        }
    }
    return counter
}

Room.prototype.spawnManager = function spawnManager() {



    global.heap.rooms[this.name].spawn1Name = ""
    global.heap.rooms[this.name].spawn2Name = ""
    global.heap.rooms[this.name].spawn3Name = ""
    var myDirections = [BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT]

    var spawn = Game.spawns[this.name + '_1']
    if (spawn == undefined && Game.spawns['Spawn1'] != undefined && Game.spawns['Spawn1'].room.name == this.name) {
        spawn = Game.spawns['Spawn1']
    }

    if (spawn == undefined) {
        return -1;
    }

    if (spawn.spawning != undefined && spawn.spawning.remainingTime < spawn.spawning.needTime - 2) {

        global.heap.rooms[this.name].spawn1Name = spawn.spawning.name
        if (this.memory.spawn2Id != undefined) {
            myDirections = [BOTTOM, BOTTOM_LEFT, BOTTOM_RIGHT, RIGHT, TOP_RIGHT]
            spawn = Game.getObjectById(this.memory.spawn2Id)
        }
    }

    if (spawn.spawning != undefined && spawn.spawning.remainingTime < spawn.spawning.needTime - 2) {
        global.heap.rooms[this.name].spawn2Name = spawn.spawning.name
        if (this.memory.spawn3Id != undefined) {
            spawn = Game.getObjectById(this.memory.spawn3Id)
            myDirections = [TOP, TOP_LEFT, TOP_RIGHT]
            //for visualization
            if (spawn.spawning != undefined) {
                global.heap.rooms[this.name].spawn3Name = spawn.spawning.name
            }
        }
    }
    var energyCap = Game.rooms[this.name].energyAvailable


    //check if there is quad that has started spawning in offensiveQueue (members>0)
    // if yes then spawn it before the rest
    // else spawn after other queues
    if (global.heap.rooms[this.name].offensiveQueue.length) {

    }

    if (global.heap.rooms[this.name].offensiveQueue.length > 0 && global.heap.rooms[this.name].offensiveQueue[0].role == C.ROLE_QUAD_MEMBER &&
        global.heap.rooms[this.name].offensiveQueue[0].isFirstMember == false && global.heap.rooms[this.name].fillers >= 4
    ) {

        this.memory._lastTimeEnteredTriedSpawningAnotherSpawnMember = Game.time

        console.log("spawning not first quad member")
        var request = global.heap.rooms[this.name].offensiveQueue[0]

        var blockPos = new RoomPosition(38, 8, this.name)
        var blockPosWidth = 8
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("🗡️ Queue: " + C.ROLE_QUAD_MEMBER, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)



        var body = []
        var name = "RabbitEye"
        var minBodyCost = EXTENSION_ENERGY_CAPACITY[this.controller.level] * CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.controller.level]
        var minEnergyOnCreep = 0;



        if (request.bodyType == C.RANGED_BODY) {
            body = quadRangedBody(Math.max(energyCap, minBodyCost, minEnergyOnCreep))
        }
        else if (request.bodyType == C.HEALER_BODY) {
            name = "RabbitTail"
            body = quadHealerBody(Math.max(energyCap, minBodyCost, minEnergyOnCreep))
        }
        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_QUAD_MEMBER, quadId: request.quadId, directions: myDirections, homeRoom: this.name } })
        console.log("result of spawning not first spawn member: ", result)
        if (result == OK) {
            global.heap.rooms[this.name].spawnResult = result
            global.heap.rooms[this.name].spawnRole = C.ROLE_QUAD_MEMBER
            for (a of Memory.roomsToAttack) {
                for (q of a.quads) {
                    if (q.id == request.quadId) {
                        q.minEnergyOnCreep = Math.max(q.minEnergyOnCreep, getBodyCost(body))
                        break;

                    }
                }
            }

            global.heap.rooms[this.name].offensiveQueue.shift()

        }
        return;
    }


    if (global.heap.rooms[this.name].defensiveQueue.length > 0 && Game.rooms[this.name].energyAvailable > 300) {

        console.log("spawning from defensive queue")
        var request = global.heap.rooms[this.name].defensiveQueue[0]
        var role = request.role
        var energyCap = Game.rooms[this.name].energyAvailable

        var blockPos = new RoomPosition(38, 8, this.name)
        var blockPosWidth = 8
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("🛡️ Queue: " + role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        switch (role) {
            case C.ROLE_SOLDIER:
                {
                    var result = spawn.spawnCreep(soldierBody(energyCap, request.isMelee), 'SadisticRabbit' + '_' + this.name + Game.time, { memory: { role: C.ROLE_SOLDIER, directions: myDirections, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].defensiveQueue.shift()
                        break;
                    }

                }
            case C.ROLE_RAMPART_REPAIRER:
                {
                    //This condition should be unneccesary but it keeps still spawning rampartsRepairers so added it here
                    if (global.heap.rooms[this.name].rampartRepairersPower < global.heap.rooms[this.name].requiredRampartsRepairersPower) {
                        var result = spawn.spawnCreep(workerBody(energyCap), "RampartLovingRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_RAMPART_REPAIRER, directions: myDirections, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].defensiveQueue.shift()

                            //Debugging
                            this.memory._RepairersSpawningTick = Game.time
                            this.memory._inSpawnManager_global_heap_rooms_this_name_myRamparts_length = global.heap.rooms[this.name].myRamparts.length
                            this.memory._inSpawnManager_global_heap_rooms_this_name_requiredRampartsRepairersPower = global.heap.rooms[this.name].requiredRampartsRepairersPower
                            this.memory._inSpawnManager_global_heap_rooms_this_name_rampartRepairersPower = global.heap.rooms[this.name].rampartRepairersPower
                            //
                        }
                        break;
                    }
                    else {
                        global.heap.rooms[this.name].civilianQueue.shift()
                    }

                }
        }
    }
    else if (global.heap.rooms[this.name].harvestingQueue.length > 0) {

        console.log("spawning from harvestingQueue")
        var request = global.heap.rooms[this.name].harvestingQueue[0]
        var role = request.role
        var energyCap = Game.rooms[this.name].energyAvailable

        var blockPos = new RoomPosition(38, 8, this.name)
        var blockPosWidth = 8
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("⛏️ Queue: " + role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        switch (role) {
            case C.ROLE_HARVESTER:
                {
                    var result = spawn.spawnCreep(harvesterBody(energyCap), "HungryRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_HARVESTER, directions: myDirections, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), "SisypheanRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_CARRIER, directions: myDirections, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_FILLER:
                {
                    var body = [MOVE, CARRY]
                    if (spawn.room.controller.level == 7) {
                        body = [MOVE, CARRY, CARRY]
                    }
                    else if (spawn.room.controller.level == 8) {
                        body = [MOVE, CARRY, CARRY, CARRY, CARRY]
                    }
                    var result = spawn.spawnCreep(body, 'FillingRabbit' + '_' + this.name + Game.time, { memory: { role: C.ROLE_FILLER, directions: myDirections, homeRoom: this.name, spawnId: this.id } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_HAULER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), "HaulingRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_HAULER, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
        }

    }
    else if (global.heap.rooms[this.name].civilianQueue.length > 0) {


        console.log("spawning from civilianQueue")

        var request = global.heap.rooms[this.name].civilianQueue[0]
        var role = request.role
        var energyCap = Game.rooms[this.name].energyAvailable

        var blockPos = new RoomPosition(38, 8, this.name)
        var blockPosWidth = 8
        var blockPosHeight = 1
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("🏦 Queue: " + role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


        switch (role) {

            case C.ROLE_SCOUT:
                {
                    var targetRoom = undefined
                    if (request.targetRoom != undefined) { targetRoom = request.targetRoom }
                    var result = spawn.spawnCreep([MOVE], "WanderingRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_SCOUT, directions: myDirections, homeRoom: this.name, homeSpawnID: spawn.id, targetRoom: targetRoom } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_WORKER:
                {
                    var body = []
                    if (this.energyAvailable <= SPAWN_ENERGY_CAPACITY) { body = [WORK, CARRY, MOVE] }
                    else { body = workerBody(energyCap) }

                    if (this.controller.level == 8 && global.heap.rooms[this.name].needWorkersParts == 1) {
                        body = [MOVE, CARRY, WORK]
                    }

                    var result = spawn.spawnCreep(body, "SlaveRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_WORKER, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_REPAIRER:
                {
                    var result = spawn.spawnCreep(repairerBody(energyCap), "HandymanRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_REPAIRER, targetRoom: request.roomName, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RESERVER:
                {
                    var body = [MOVE, CLAIM]
                    if (energyCap >= 1300) {
                        body = [MOVE, MOVE, CLAIM, CLAIM]
                    }
                    var result = spawn.spawnCreep(body, "ReservingRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESERVER, directions: myDirections, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()
                        break;
                    }

                }
            case C.ROLE_RAMPART_REPAIRER:
                {
                    //This condition should be unneccesary but it keeps still spawning rampartsRepairers so added it here
                    if (global.heap.rooms[this.name].rampartRepairersPower < global.heap.rooms[this.name].requiredRampartsRepairersPower) {
                        var result = spawn.spawnCreep(workerBody(energyCap), "RampartLovingRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_RAMPART_REPAIRER, directions: myDirections, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].civilianQueue.shift()
                            //Debugging
                            this.memory._RepairersSpawningTick = Game.time
                            this.memory._inSpawnManager_global_heap_rooms_this_name_myRamparts_length = global.heap.rooms[this.name].myRamparts.length
                            this.memory._inSpawnManager_global_heap_rooms_this_name_requiredRampartsRepairersPower = global.heap.rooms[this.name].requiredRampartsRepairersPower
                            this.memory._inSpawnManager_global_heap_rooms_this_name_rampartRepairersPower = global.heap.rooms[this.name].rampartRepairersPower
                            //
                        }
                        break;
                    }
                    else {
                        global.heap.rooms[this.name].civilianQueue.shift()
                    }

                }
            case C.ROLE_RESOURCE_MANAGER:
                {
                    if (this.storage != undefined) {
                        var result = spawn.spawnCreep(carrierBody(energyCap), "GreedyRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESOURCE_MANAGER, directions: myDirections, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].civilianQueue.shift()

                        }
                        break;
                    }
                    else {
                        global.heap.rooms[this.name].civilianQueue.shift()
                    }

                }
            case C.ROLE_CLAIMER:
                {
                    var result = spawn.spawnCreep([MOVE, MOVE, CLAIM], C.ROLE_CLAIMER + '_' + this.name + Game.time, { memory: { role: C.ROLE_CLAIMER, directions: myDirections, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_COLONIZER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap, [MOVE, CARRY, WORK, MOVE]), "PioneerRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_COLONIZER, directions: myDirections, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINER:
                {
                    var result = spawn.spawnCreep(minerBody(energyCap), "AnotherSlaveRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINER, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINERAL_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), "OverseerRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINERAL_CARRIER, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_DOCTOR:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), "CrazyScientisRabbit" + '_' + this.name + Game.time, { memory: { role: C.ROLE_DOCTOR, directions: myDirections, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }


        }
    }
    else if (global.heap.rooms[this.name].offensiveQueue.length > 0
        && global.heap.rooms[this.name].haulersParts > 0
    ) {

        console.log("entering offensive queueeee")
        var request = global.heap.rooms[this.name].offensiveQueue[0]
        var role = request.role
        console.log("role: ", role)
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (role) {
            case C.ROLE_QUAD_MEMBER:
                {
                    if (this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM &&
                        (this.memory.resourceManagerId != undefined && Game.getObjectById(this.memory.resourceManagerId) != null
                            && Game.getObjectById(this.memory.resourceManagerId).ticksToLive > C.CREEP_TICKS_TO_LIVE_BUFFER)) {
                        console.log("entered spawning quad member")
                        console.log("request.quadId: ", request.quadId)
                        var name = "RabbitTail"
                        var body = []
                        if (request.bodyType == C.RANGED_BODY) {
                            name = "RabbitEye"
                            body = quadRangedBody(energyCap)
                        }
                        else if (request.bodyType == C.HEALER_BODY) {
                            body = quadHealerBody(energyCap)
                        }
                        if (body.length < C.MIN_QUAD_MEMBER_BODY_LENGTH
                            && this.controller.level >= 7
                        ) {
                            body = []
                        }
                        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_QUAD_MEMBER, quadId: request.quadId, directions: myDirections, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].offensiveQueue.shift()

                        }
                        break;
                    }
                    break;
                }
            case C.ROLE_ENERGY_DRAINER:
                {
                    if (this.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM) {
                        var name = "MasochisticRabbit"
                        var body = drainerBody(energyCap)
                        console.log(body)
                        console.log(body.length)
                        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_ENERGY_DRAINER, targetRoom: request.roomName, directions: myDirections, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].offensiveQueue.shift()

                        }
                        console.log("drainer spawning result: ", result)
                        break;


                    }
                }
        }
    }
}