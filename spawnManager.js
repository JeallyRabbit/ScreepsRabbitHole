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
const drainerBody = require('drainerBody')

//defining local heap
const localHeap = {}

Room.prototype.spawnManager = function spawnManager() {



    var spawn = Game.spawns[this.name + '_1']
    if (spawn == undefined && Game.spawns['Spawn1'] != undefined && Game.spawns['Spawn1'].room.name == this.name) {
        spawn = Game.spawns['Spawn1']
    }

    if (spawn == undefined) {
        return -1;
    }

    if (spawn.spawning != undefined && spawn.spawning.remainingTime < spawn.spawning.needTime - 2) {
        if (this.memory.spawn2Id != undefined) {
            spawn = Game.getObjectById(this.memory.spawn2Id)
        }
    }

    if (spawn.spawning != undefined && spawn.spawning.remainingTime < spawn.spawning.needTime - 2) {
        if (this.memory.spawn3Id != undefined) {
            spawn = Game.getObjectById(this.memory.spawn3Id)
        }
    }
    var energyCap = Game.rooms[this.name].energyAvailable



    //check if there is quad that has started spawning in offensiveQueue (members>0)
    // if yes then spawn it before the rest
    // else spawn after other queues
    if (global.heap.rooms[this.name].offensiveQueue.length) {

    }

    if (global.heap.rooms[this.name].offensiveQueue.length > 0 && global.heap.rooms[this.name].offensiveQueue[0].role == C.ROLE_QUAD_MEMBER &&
        global.heap.rooms[this.name].offensiveQueue[0].isFirstMember == false
    ) {
        console.log("spawning not first quad member")
        var request = global.heap.rooms[this.name].offensiveQueue[0]
        var body = []
        var name = "RabbitEye"
        var minBodyCost = EXTENSION_ENERGY_CAPACITY[this.controller.level] * CONTROLLER_STRUCTURES[STRUCTURE_EXTENSION][this.controller.level]
        var minEnergyOnCreep = 0;
        for (a of Memory.roomsToAttack) {
            for (q of a.quads) {
                if (q.id == request.quadId) {
                    if (q.minEnergyOnCreep != undefined) {
                        minEnergyOnCreep = q.minEnergyOnCreep
                        break;
                    }
                }
            }
        }


        if (request.bodyType == C.RANGED_BODY) {
            body = quadRangedBody(Math.max(energyCap, minBodyCost, minEnergyOnCreep))
        }
        else if (request.bodyType == C.HEALER_BODY) {
            name = "RabbitTail"
            body = quadHealerBody(Math.max(energyCap, minBodyCost, minEnergyOnCreep))
        }
        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_QUAD_MEMBER, quadId: request.quadId, homeRoom: this.name } })
        if (result == OK) {
            global.heap.rooms[this.name].spawnResult = result
            global.heap.rooms[this.name].spawnRole = C.ROLE_QUAD_MEMBER
            for (a of Memory.roomsToAttack) {
                for (q of a.quads) {
                    if (q.id == request.quadId) {
                        if (minEnergyOnCreep > q.minEnergyOnCreep) {
                            q.minEnergyOnCreep = minEnergyOnCreep
                            break;
                        }
                    }
                }
            }

            global.heap.rooms[this.name].offensiveQueue.shift()

        }
        return;
    }


    if (global.heap.rooms[this.name].defensiveQueue.length > 0 && Game.rooms[this.name].energyAvailable>300) {

        console.log("spawning from defensive queue")
        var request = global.heap.rooms[this.name].defensiveQueue[0]
        var role = request.role
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (role) {
            case C.ROLE_SOLDIER:
                {
                    var result = spawn.spawnCreep(soldierBody(energyCap, request.isMelee), C.ROLE_SOLDIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_SOLDIER, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].defensiveQueue.shift()
                        break;
                    }
                    
                }
        }
    }
    else if (global.heap.rooms[this.name].harvestingQueue.length > 0) {

        console.log("spawning from harvestingQueue")
        var request = global.heap.rooms[this.name].harvestingQueue[0]
        var role = request.role
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (role) {
            case C.ROLE_HARVESTER:
                {
                    var result = spawn.spawnCreep(harvesterBody(energyCap), C.ROLE_HARVESTER + '_' + this.name + Game.time, { memory: { role: C.ROLE_HARVESTER, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_CARRIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_CARRIER, homeRoom: this.name, targetRoom: request.sourceRoom, sourceId: request.sourceId } })
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
                    var result = spawn.spawnCreep(body, C.ROLE_FILLER + '_' + this.name + Game.time, { memory: { role: C.ROLE_FILLER, homeRoom: this.name, spawnId: this.id } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].harvestingQueue.shift()

                    }
                    break;
                }
            case C.ROLE_HAULER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_HAULER + '_' + this.name + Game.time, { memory: { role: C.ROLE_HAULER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

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
        switch (role) {

            case C.ROLE_SCOUT:
                {
                    var targetRoom = undefined
                    if (request.targetRoom != undefined) { targetRoom = request.targetRoom }
                    var result = spawn.spawnCreep([MOVE], C.ROLE_SCOUT + '_' + this.name + Game.time, { memory: { role: C.ROLE_SCOUT, homeRoom: this.name, homeSpawnID: spawn.id, targetRoom: targetRoom } })
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
                    var result = spawn.spawnCreep(body, C.ROLE_WORKER + '_' + this.name + Game.time, { memory: { role: C.ROLE_WORKER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_REPAIRER:
                {
                    var result = spawn.spawnCreep(repairerBody(energyCap), C.ROLE_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_REPAIRER, targetRoom: request.roomName, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RESERVER:
                {
                    var result = spawn.spawnCreep([MOVE, CLAIM], C.ROLE_RESERVER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESERVER, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RAMPART_REPAIRER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap), C.ROLE_RAMPART_REPAIRER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RAMPART_REPAIRER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_RESOURCE_MANAGER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_RESOURCE_MANAGER + '_' + this.name + Game.time, { memory: { role: C.ROLE_RESOURCE_MANAGER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_CLAIMER:
                {
                    var result = spawn.spawnCreep([MOVE, MOVE, CLAIM], C.ROLE_CLAIMER + '_' + this.name + Game.time, { memory: { role: C.ROLE_CLAIMER, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_COLONIZER:
                {
                    var result = spawn.spawnCreep(workerBody(energyCap, [MOVE, CARRY, WORK, MOVE]), C.ROLE_COLONIZER + '_' + this.name + Game.time, { memory: { role: C.ROLE_COLONIZER, homeRoom: this.name, targetRoom: request.roomName } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINER:
                {
                    var result = spawn.spawnCreep(minerBody(energyCap), C.ROLE_MINER + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_MINERAL_CARRIER:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_MINERAL_CARRIER + '_' + this.name + Game.time, { memory: { role: C.ROLE_MINERAL_CARRIER, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }
            case C.ROLE_DOCTOR:
                {
                    var result = spawn.spawnCreep(carrierBody(energyCap), C.ROLE_DOCTOR + '_' + this.name + Game.time, { memory: { role: C.ROLE_DOCTOR, homeRoom: this.name } })
                    global.heap.rooms[this.name].spawnResult = result
                    global.heap.rooms[this.name].spawnRole = role
                    if (result == OK) {
                        global.heap.rooms[this.name].civilianQueue.shift()

                    }
                    break;
                }


        }
    }
    else if (global.heap.rooms[this.name].offensiveQueue.length > 0) {

        console.log("entering offensive queueeee")
        var request = global.heap.rooms[this.name].offensiveQueue[0]
        var role = request.role
        console.log("role: ", role)
        var energyCap = Game.rooms[this.name].energyAvailable

        switch (role) {
            case C.ROLE_QUAD_MEMBER:
                {
                    if (this.storage[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM) {
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
                        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_QUAD_MEMBER, quadId: request.quadId, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].offensiveQueue.shift()

                        }
                        break;
                    }

                }
            case C.ROLE_ENERGY_DRAINER:
                {
                    if (this.storage[RESOURCE_ENERGY] > C.STORAGE_ENERGY_BOTTOM) {
                        var name = "MasochisticRabbit"
                        var body = drainerBody(energyCap)
                        var result = spawn.spawnCreep(body, name + '_' + this.name + Game.time, { memory: { role: C.ROLE_ENERGY_DRAINER, targetRoom: request.roomName, homeRoom: this.name } })
                        global.heap.rooms[this.name].spawnResult = result
                        global.heap.rooms[this.name].spawnRole = role
                        if (result == OK) {
                            global.heap.rooms[this.name].offensiveQueue.shift()

                        }
                        break;


                    }
                }
        }
    }
}