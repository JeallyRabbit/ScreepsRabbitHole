const C = require('constants');


//TODO:
//Add avopiding hostile areas during STATE_UNDER_ATTACK


class boostRequest {
    constructor(creepId, res, amount, bodyType, ttl) {
        this.creepId = creepId;
        this.resource = res
        this.amount = amount; // amount of resource required to boost
        this.bodyType = bodyType;
        this.ttl = ttl
    }
}

Creep.prototype.processBoostRequest = function processBoostRequest() {

    this.say("DBS")
    if (global.heap.rooms[this.room.name].boostingRequests.length > 0) {
        this.say("DBS1")
        global.heap.rooms[this.room.name].doctorTask = C.TASK_BOOST_CREEP
        for (r of global.heap.rooms[this.room.name].boostingRequests) {

            this.say("DBS1")
            var boostingLab = Game.getObjectById(global.heap.rooms[this.memory.homeRoom].boostingLabId)
            if (boostingLab == null) { 
                this.say("DBS1.1")    
                return
             }

             //this.say(boostingLab.store.getFreeCapacity(r.resource) + boostingLab.store[r.resource] < r.amount)
            if (boostingLab.store.getFreeCapacity(r.resource) + boostingLab.store[r.resource] < r.amount) {
                this.taskClearBoostingLab(boostingLab, [r.resource, RESOURCE_ENERGY])
                this.say("DBS2")
                return
            }

            if (this.store[r.resource] < r.amount && this.room.terminal.store[r.resource] > 0) {
                this.say("DB"+r.amount)
                if (this.withdraw(this.room.terminal,r.resource,r.amount) == ERR_NOT_IN_RANGE) {
                    this.travelTo(this.room.terminal)
                    this.say("DB3")
                }
                else if(this.withdraw(this.room.terminal,r.resource,r.amount) == OK)
                {
                    global.heap.rooms[this.room.name].doctorTask = C.TASK_BOOST_CREEP
                }
            }
            else {
                if (this.transfer(boostingLab, r.resource) == ERR_NOT_IN_RANGE) {
                    this.say("DBS4")
                    this.travelTo(boostingLab)
                }
            }
            break
        }
    }
    else{
        global.heap.rooms[this.room.name].doctorTask = undefined
    }
}

Creep.prototype.taskGetBoosted = function taskGetBoosted() {

    
    var boostedBodyTypes=0

    //check if creep is fully boosted
    for (b of global.heap.creeps[this.name].boosters) 
    {
        var requiredParts=_.filter(this.body, { type: b.bodyType})
        var unboostedParts=_.filter(requiredParts, obj => !('boost' in obj)).length
        //this.say(requiredParts.length+" "+unboostedParts+" ")
        if(unboostedParts==0)
        {
            boostedBodyTypes++;
            
        }

        if(Memory.fastRclUpgrade!=undefined && Memory.fastRclUpgrade!=this.memory.homeRoom && b.res=="XGH2O")
        {//skipping upgrade boost if focusing on upgrading other room
            

            var index=global.heap.rooms[this.memory.homeRoom].boostingRequests.find(obj => { return obj.creepId == this.id && obj.resource==b.res})
            if(index != undefined)
            {
                global.heap.rooms[this.memory.homeRoom].boostingRequests.splice(index, 1)
            }
        }

    }
    
    if(global.heap.creeps[this.name].boosters.length==boostedBodyTypes)
    {
        this.memory.isBoosted=true
        global.heap.creeps[this.name].isBoosted=true

        
        return -4
    }
    
    /// end of check

    

    global.heap.creeps[this.name].isBoosted=false

    for (b of global.heap.creeps[this.name].boosters) {
        var reqBoost = b.res
        var reqBoostAmount = b.amount
        var bodyType = b.bodyType

        if (global.heap.rooms[this.memory.homeRoom].availableT3Boosts.length == 0
            || global.heap.rooms[this.memory.homeRoom].doctorId==undefined
        ) {
            return -1;
        }
        
        


        for (ab of global.heap.rooms[this.memory.homeRoom].availableT3Boosts) {
            
            
            this.say("BG2")
            if (ab.resourceType == reqBoost) {
                this.say("BG3")
                if (ab.amount > b.amount) {

                    this.say("BG4")
                    if (global.heap.rooms[this.room.name].boostingRequests == undefined)
                    {
                        global.heap.rooms[this.room.name].boostingRequests=[]
                    }
                    //debugging
                    if (global.heap.rooms[this.room.name].boostingRequests != undefined) {

                       
                        var crRequest = new boostRequest(this.id, reqBoost, reqBoostAmount, bodyType, Game.time + (CREEP_LIFE_TIME - C.MIN_BOOSTING_TTL))
                        var auxCreepId=this.id
                        if (this.ticksToLive > C.MIN_BOOSTING_TTL &&
                            global.heap.rooms[this.room.name].boostingRequests.find(({ creepId }) => creepId === auxCreepId) == undefined)
                        {
                            global.heap.rooms[this.room.name].boostingRequests.push(crRequest)
                            this.say("RB")
                        }
                    }

                }
                break
            }
        }
        
    }
    
    //this.say(boostedBodyTypes)
    //this.say("db0")
    if (this.ticksToLive > C.MIN_BOOSTING_TTL && global.heap.rooms[this.memory.homeRoom].boostingRequests.find(obj => { return obj.creepId == this.id }) != undefined) {

        this.say("GB")
        //check if  first request is this creep request
        var isFirstOne = false
        //this.say("db1")
        for (r of global.heap.rooms[this.memory.homeRoom].boostingRequests) {
            if (r.creepId == this.id) { isFirstOne = true }
            break;
        }
        if (isFirstOne) {

            this.say("GB2")
            if (global.heap.rooms[this.memory.homeRoom].boostingLabId != undefined && Game.getObjectById(global.heap.rooms[this.memory.homeRoom].boostingLabId)!=null) {
                var boostingLab = Game.getObjectById(global.heap.rooms[this.memory.homeRoom].boostingLabId)
                this.travelTo(boostingLab)
                return 0
            }
        }
    }
    return -3;

}

Creep.prototype.taskFillLabEnergy = function taskFillLabEnergy(id) {
    var lab = Game.getObjectById(id)

    if (lab == null || (lab != null && lab.store[RESOURCE_ENERGY] > LAB_ENERGY_CAPACITY / 2)) {
        global.heap.rooms[this.room.name].doctorTask = undefined
        global.heap.rooms[this.room.name].labNeedEnergyId = undefined
        return
    }

    if (this.store[RESOURCE_ENERGY] == 0) {
        if (this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(this.room.storage)
        }
    }
    else {
        if (this.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(lab)
        }
    }

}

Creep.prototype.taskClearInputLabs = function taskClearInputLabs(in1, in2) {
    if (this.room.ifBothInputMineralEmpty(in1, in2)) {
        if (this.store.getCapacity(RESOURCE_ENERGY) == this.store.getFreeCapacity(RESOURCE_ENERGY)) {
            global.heap.rooms[this.room.name].doctorTask = undefined
            this.say("IN_EMPT", true)
            return
        }

    }
    global.heap.creeps[this.name].inEmpty = true

    if (this.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
        //if (in1.store.getFreeCapacity(RESOURCE_OXYGEN) < LAB_MINERAL_CAPACITY) {

        for (res in in1.store) {
            if (res != RESOURCE_ENERGY) {
                var withdrawResult = this.withdraw(in1, res)
                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    this.travelTo(in1)

                }
                break
                global.heap.creeps[this.name].inEmpty = false;
            }
        }
        //}
        // else if (in2.store.getFreeCapacity(RESOURCE_OXYGEN) < LAB_MINERAL_CAPACITY) {

        for (res in in2.store) {
            if (res != RESOURCE_ENERGY) {
                var withdrawResult = this.withdraw(in2, res)
                if (withdrawResult == ERR_NOT_IN_RANGE) {
                    this.travelTo(in2)

                }
                break;
                global.heap.creeps[this.name].inEmpty = false;
            }
        }
        //}
    }
    else {
        // transfer to storage
        for (res in this.store) {
            var transferResult = this.transfer(this.room.storage, res)
            if (transferResult == ERR_NOT_IN_RANGE) {
                this.travelTo(this.room.storage)
            }
            break;
        }
    }
    if (global.heap.creeps[this.name].inEmpty == true) {
        // transfer to storage
        for (res in this.store) {
            var transferResult = this.transfer(this.room.storage, res)
            if (transferResult == ERR_NOT_IN_RANGE) {
                this.travelTo(this.room.storage)
            }
            break;
        }
    }

}


Creep.prototype.taskClearBoostingLab = function taskClearBoostingLab(boostingLab, notTake) {
    var creepFull = false
    var tookFromLab = false;
    for (res in boostingLab.store) {
        if (notTake.includes(res)) { continue }
        var withdrawResult = this.withdraw(boostingLab, res)
        if (withdrawResult == ERR_NOT_IN_RANGE) {
            this.travelTo(boostingLab)
        }
        else if (withdrawResult == ERR_FULL) {
            creepFull = true
        }
        else if (withdrawResult == OK) {
            tookFromLab = true
        }
    }

    if (creepFull) { this.taskClearCreep() }
    else if (!creepFull && !tookFromLab) { this.taskClearCreep() }
}

Creep.prototype.taskClearOutputLabs = function taskClearOutputLabs(in1, in2) {


    var outputLabs = []
    for (id of global.heap.rooms[this.room.name].outLabsId) {
        var outLab = Game.getObjectById(id)
        if (outLab != null) {
            outputLabs.push(outLab)
        }
        else {
            global.heap.rooms[this.room.name].outLabsId = undefined;
            global.heap.rooms[this.room.name].doctorTask = undefined;
            this.say("clOutExit1", true)
            return
        }
    }
    if (outputLabs.length == 0) {
        return
    }

    var areOutputsMineralEmpty = true
    for (out of outputLabs) {
        for (res in out.store) {
            if (res != RESOURCE_ENERGY) {
                areOutputsMineralEmpty = false;
                break
            }
        }
    }

    if (areOutputsMineralEmpty == true) {


        this.say("clOutExit2", true)
        global.heap.rooms[this.room.name].doctorTask = C.TASK_CLEAR_INPUT_LABS
        return
    }

    if (this.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && this.ticksToLive > 30) {
        var maxLab = undefined
        var auxAmount = LAB_MINERAL_CAPACITY
        for (l of outputLabs) {
            if (l.store.getFreeCapacity(RESOURCE_OXYGEN) < auxAmount) {
                auxAmount = l.store.getFreeCapacity(RESOURCE_OXYGEN)
                maxLab = l
            }
        }
        if (maxLab != undefined) {
            for (res in maxLab.store) {

                if (res != RESOURCE_ENERGY) {
                    var withdrawResult = this.withdraw(maxLab, res)
                    if (withdrawResult == ERR_NOT_IN_RANGE) {
                        this.travelTo(maxLab)
                    }
                    else if (withdrawResult == OK) {
                        break;
                    }
                }
            }
        }
        else if (maxLab == undefined && this.room.oneInputMineralEmpty(in1, in2)) {
            global.heap.rooms[this.room.name].doctorTask = undefined
            return
        }
    }
    else {
        if (this.pos.isNearTo(this.room.storage.pos.x, this.room.storage.pos.y)) {
            for (res in this.store) {
                if (this.transfer(this.room.store, res) == OK) {
                    break;
                }
            }
        }
        else {
            this.travelTo(this.room.storage)
        }
    }
}


Creep.prototype.taskFillInputLabsMineral = function taskFillInputLabsMineral(in1, in2) {


    // just error controll
    if (in1 == undefined || in2 == undefined) {
        this.say("FilLInError", true)
        global.heap.rooms[this.room.name].doctorTask = undefined
        return
    }


    this.say("Test1")

    if (global.heap.rooms[this.room.name].reaction != undefined && global.heap.rooms[this.room.name].reaction.length > 0) {
        this.say("Test2")
        var res1 = global.heap.rooms[this.room.name].reaction[0]
        var res2 = global.heap.rooms[this.room.name].reaction[1]

        // Minerals are already in labs
        if (in1.store[res1] > LAB_REACTION_AMOUNT && in2.store[res2] > LAB_REACTION_AMOUNT) {
            this.say("FIlINExit", true)
            global.heap.rooms[this.room.name].doctorTask = undefined
            global.heap.rooms[this.room.name].reactionAmount = undefined
            return
        }

        global.heap.rooms[this.room.name].reactionAmount = Math.min()



        
        //this.say((this.store[res1] > 0 && this.transfer(in1, res1) == ERR_NOT_IN_RANGE) || (this.store[res2] > 0 && this.transfer(in2, res2) == ERR_NOT_IN_RANGE))
        if (this.transfer(in1, res1) == ERR_INVALID_TARGET || this.transfer(in2, res2) == ERR_INVALID_TARGET) {
            global.heap.rooms[this.room.name].doctorTask = undefined
            return;
        }
        if (this.store[res1] > 0 && this.transfer(in1, res1) == ERR_NOT_IN_RANGE) {
            this.travelTo(in1)
        }
        else if (this.store[res2] > 0 && this.transfer(in2, res2) == ERR_NOT_IN_RANGE) {
            this.travelTo(in2)
        }
        else {

            var res = res1
            if (in1.store[res1] > 0 && in2.store[res2] == 0) {
                res = res2
            }

            if (this.store[res] == 0) {
                var storage = this.room.storage
                if (storage.store[res] == 0) {
                    storage = this.room.terminal
                }
                /*
                var rawResources = ["H", "O", "U", "L", "K", "Z", "X"]
                if (rawResources.includes(res)) {
                    store = this.room.terminal
                }*/
                var result = this.withdraw(storage, res, Math.min(this.store.getCapacity(res), storage.store[res]))
                if (result == ERR_NOT_IN_RANGE) {
                    this.travelTo(storage)
                }
            }
        }
    }
    else {
        global.heap.rooms[this.room.name].doctorTask = undefined
        return
    }

}

Creep.prototype.taskFillInputLabEnergy = function taskFillInputLabEnergy(lab) {
    if (lab.store[RESOURCE_ENERGY] > LAB_ENERGY_CAPACITY / 2) {
        global.heap.rooms[this.room.name].doctorTask = undefined
        return
    }
    if (this.store[RESOURCE_ENERGY] > 0) {
        if (lab != undefined && this.transfer(lab, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(lab)
        }

    }
    else {
        if (this.room.storage != undefined && this.withdraw(this.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(this.room.storage)
        }
    }
}

Creep.prototype.taskClearCreep = function taskClearCreep() {


    //exit point of task
    if (this.store.getFreeCapacity(RESOURCE_ENERGY) == this.store.getCapacity(RESOURCE_ENERGY)) {
        global.heap.rooms[this.room.name].doctorTask = undefined
        return
    }
    var targetStorage = undefined
    if (this.room.storage != undefined && this.room.terminal != undefined && this.store[RESOURCE_ENERGY] > 0) {
        if (this.room.terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY) {

            targetStorage = this.room.terminal
        }
        else if (this.room.storage.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            targetStorage = this.room.storage
        }
        else if (this.room.terminal.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
            targetStorage = this.room.terminal
        }
    }
    if (targetStorage != undefined) {
        if (this.transfer(targetStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            this.travelTo(targetStorage)
        }
    }
    else {
        if (this.room.storage != undefined) {
            if (this.pos.isNearTo(this.room.storage.pos.x, this.room.storage.pos.y)) {
                for (res in this.store) {
                    if (this.transfer(this.room.storage, res) == OK) {
                        break;
                    }
                }
            }
            else {
                this.travelTo(this.room.storage)
            }
        }
        else {
            for (res in this.store) {
                this.drop(res)
            }
        }
    }

}

Creep.prototype.taskFillManagerLink = function taskFillManagerLink() {

    if (Game.getObjectById(this.room.memory.managerLinkId) != undefined && Game.getObjectById(this.room.memory.managerLinkId).store[RESOURCE_ENERGY] >= C.LINK_BOTTOM_ENERGY) {
        this.memory.task = undefined
        if (this.memory.role == C.ROLE_HAULER) {
            global.heap.rooms[this.room.name].haulerTask = undefined
        }
    }
    if (this.room.memory.managerLinkId != undefined && Game.getObjectById(this.room.memory.managerLinkId) != null) {
        if (this.store[RESOURCE_ENERGY] > 0) {
            if (this.transfer(Game.getObjectById(this.room.memory.managerLinkId), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(Game.getObjectById(this.room.memory.managerLinkId))
            }
        }
    }
    else {
        if (this.memory.role == C.ROLE_HAULER) {
            global.heap.rooms[this.room.name].haulerTask = undefined
        }
        this.memory.task = undefined
    }
}
Creep.prototype.taskFillTowers = function taskFillTowers() {
    if (this.memory.targetTower != undefined && Game.getObjectById(this.memory.targetTower) != null && Game.getObjectById(this.memory.targetTower).store[RESOURCE_ENERGY] > TOWER_CAPACITY * C.TOWER_UP_LIMIT) {
        this.memory.targetTower = undefined
    }

    if (this.memory.targetTower == undefined) {
        var towersBelowLimit = [];
        for (t of global.heap.rooms[this.memory.homeRoom].myTowersId) {
            if (Game.getObjectById(t) != null && Game.getObjectById(t).store[RESOURCE_ENERGY] < TOWER_CAPACITY * C.TOWER_BOTTOM_LIMIT) {
                towersBelowLimit.push(Game.getObjectById(t))
            }
        }
        var targetTower = this.pos.findClosestByRange(towersBelowLimit)
        if (targetTower != null) {
            this.memory.targetTower = targetTower.id
        }
    }

    if (this.memory.targetTower != undefined) {
        if (this.transfer(Game.getObjectById(this.memory.targetTower), RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

            this.travelTo(Game.getObjectById(this.memory.targetTower))
        }
    }

}

//TASK_REPAIR_RAMPARTS
Creep.prototype.taskRepairRamparts = function taskRepairRamparts() {
    if ((this.memory.minRampartId != undefined && Game.getObjectById(this.memory.minRampartId) == null)) {
        this.memory.minRampartId = undefined
    }

    if (this.memory.minRampartId == undefined) {
        var minRampartId = undefined
        var minRampartHits = Infinity
        var minimalRamparts = []// there can be more than one here
        for (r of global.heap.rooms[this.memory.homeRoom].myRamparts) {
            if (Game.getObjectById(r) != null && Game.getObjectById(r).hits < minRampartHits
                && Game.getObjectById(r).ticksToDecay > 30) {
                minRampartHits = Game.getObjectById(r).hits
                minRampartId = r
            }
        }

        //finding ramparts that are minimal
        for (r of global.heap.rooms[this.memory.homeRoom].myRamparts) {
            if (Game.getObjectById(r) != null && Game.getObjectById(r).hits == minRampartHits) {
                minimalRamparts.push(Game.getObjectById(r))
            }
        }
        if (this.pos.findClosestByRange(minimalRamparts) != null) {
            this.memory.minRampartId = this.pos.findClosestByRange(minimalRamparts).id
        }

    }
    if (this.memory.minRampartId != undefined) {

        if (Game.getObjectById(this.memory.minRampartId) != null) {
            if (this.repair(Game.getObjectById(this.memory.minRampartId)) == ERR_NOT_IN_RANGE) {
                this.travelTo(Game.getObjectById(this.memory.minRampartId))
            }
        }

    }
}

Creep.prototype.decreaseBalancer = function decreaseBalancer() {

    if ((this.memory.targetRoom != undefined && this.memory.targetRoom != this.memory.homeRoom)
        || (this.room.storage != undefined)) {
        return;
    }
    if (global.heap.creeps[this.name].deposit != null) {
        aux = Math.min(this.store.getFreeCapacity(RESOURCE_ENERGY), global.heap.creeps[this.name].deposit.store[RESOURCE_ENERGY])
    }
    else {
        aux = 0
    }

    if (aux == 0) {
        aux = this.store.getFreeCapacity(RESOURCE_ENERGY)
    }
    this.room.memory.energyBalance -= aux
}

//TASK_COLLECT
Creep.prototype.taskCollect = function taskCollect() {// go to deposits

    if (this.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
        global.heap.creeps[this.name].task = undefined
        this.memory.task = 'undefined_debugging_collect'
        return -1;
    }
    if (global.heap.creeps[this.name].deposit != undefined && global.heap.creeps[this.name].deposit != null && global.heap.creeps[this.name].deposit.store[RESOURCE_ENERGY] == 0) {

        global.heap.creeps[this.name].deposit = undefined
    }

    if ((global.heap.creeps[this.name].deposit != undefined && global.heap.creeps[this.name].deposit != null && global.heap.creeps[this.name].deposit.store[RESOURCE_ENERGY] == 0
            /* && global.heap.creeps[this.name].deposit.structureType != STRUCTURE_LINK*/))
    //|| (Game.getObjectById(this.room.memory.controllerLinkId) != null && this.room.memory.controllerLinkId != global.heap.creeps[this.name].deposit && Game.getObjectById(this.room.memory.controllerLinkId).store[RESOURCE_ENERGY] > 0)
    //|| (this.room.memory.controllerContainerId != undefined && Game.getObjectById(this.room.memory.controllerContainerId) != null && this.room.memory.controllerContainerId != global.heap.creeps[this.name].deposit.id && Game.getObjectById(this.room.memory.controllerContainerId).store[RESOURCE_ENERGY] > 0)) 
    {
        global.heap.creeps[this.name].deposit = undefined;

    }


    if (global.heap.creeps[this.name].deposit == undefined) {

        if (this.memory.role == C.ROLE_WORKER) {

            var auxDeposits = []
            if (this.room.storage != undefined
                && this.room.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_UPGRADE_LIMIT) {
                auxDeposits.push(this.room.storage)
            }

            if (this.room.memory.controllerLinkId != undefined && Game.getObjectById(this.room.memory.controllerLinkId) != null
                && Game.getObjectById(this.room.memory.controllerLinkId).store[RESOURCE_ENERGY] > 0) {
                auxDeposits.push(Game.getObjectById(this.room.memory.controllerLinkId))
            }

            if (this.room.memory.upgradersContainerId != undefined && Game.getObjectById(this.room.memory.upgradersContainerId) != null
                && Game.getObjectById(this.room.memory.upgradersContainerId).store[RESOURCE_ENERGY] > 0) {
                auxDeposits.push(Game.getObjectById(this.room.memory.upgradersContainerId))
            }
            this.memory._auxDeposits = auxDeposits
            aux = this.pos.findClosestByPath(auxDeposits)
            if (aux != null) {
                global.heap.creeps[this.name].deposit = aux
                this.memory._testDeposit = 4
                //debuging
                this.memory._deposit = deposit
                var debugging = this.memory._deposit
                //

                this.memory._deposit = aux
            }

        }
        else {


            if (this.room.memory.controllerLinkId != undefined && Game.getObjectById(this.room.memory.controllerLinkId) != null
                && Game.getObjectById(this.room.memory.controllerLinkId).store[RESOURCE_ENERGY] > 0) {
                global.heap.creeps[this.name].deposit = Game.getObjectById(this.room.memory.controllerLinkId)
                this.memory._testDeposit = 1
            }
            else {

                if (this.memory.targetRoom == this.memory.homeRoom && Game.rooms[this.memory.homeRoom].storage != undefined) {
                    global.heap.creeps[this.name].deposit = Game.rooms[this.memory.homeRoom].storage
                    this.memory._testDeposit = 2
                }
                else {
                    var deposits = global.heap.rooms[this.room.name].containersId


                    if (this.room.controller == undefined) { this.suicide() }
                    var auxDeposits = []
                    for (d of deposits) {
                        if (Game.getObjectById(d) != null && Game.getObjectById(d).store[RESOURCE_ENERGY] >= this.store.getCapacity(RESOURCE_ENERGY)) {
                            auxDeposits.push(Game.getObjectById(d))
                        }
                    }
                    var deposit = this.pos.findClosestByRange(auxDeposits);
                    if (deposit != null) {

                        global.heap.creeps[this.name].deposit = deposit;
                        this.memory.deposit = deposit
                        //debugging
                        this.memory._deposit = deposit

                        this.memory._testDeposit = 3
                        //
                    }
                }


            }


        }

    }

    if (global.heap.creeps[this.name].deposit != undefined) {

        if (this.memory.targetRoom == this.memory.homeRoom) {
            if ((this.room.controller != undefined && this.room.controller.level >= 4 && this.room.storage != undefined && this.room.storage.store[RESOURCE_ENERGY] > C.STORAGE_ENERGY_UPGRADE_LIMIT)
                || (this.room.memory.energyBalance != undefined && this.room.memory.energyBalance > C.ENERGY_BALANCER_UPGRADER_START)) {

                var targetDeposit = global.heap.creeps[this.name].deposit
                this.memory._targetDeposit = targetDeposit
                if (this.withdraw(targetDeposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    this.travelTo(targetDeposit, { maxRooms: 1  });
                    this.memory._targetDeposit = targetDeposit

                }
                else if (this.withdraw(global.heap.creeps[this.name].deposit, RESOURCE_ENERGY) == OK) {

                    //this.move((Math.random() * (8 - 1) + 1))
                    this.decreaseBalancer();
                }
            }
        }
        else {
            //this.fleeFrom(global.heap.creeps[this.name].deposit, { range: 5 })
            if (global.heap.creeps[this.name] != undefined &&
                global.heap.creeps[this.name].deposit != undefined
                && this.withdraw(global.heap.creeps[this.name].deposit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(global.heap.creeps[this.name].deposit, { maxRooms: 1  });
                this.memory._targetDeposit = global.heap.creeps[this.name].deposit

            }
            //this.decreaseBalancer()

        }
    }
    else { // collect dropped energy
        this.memory._targetDeposit = undefined

        if (global.heap.creeps[this.name].closestDroppedEnergy != undefined) {
            if (Game.getObjectById(global.heap.creeps[this.name].closestDroppedEnergy.id) == null) {
                global.heap.creeps[this.name].closestDroppedEnergy = undefined
            }
        }


        if (global.heap.creeps[this.name].closestDroppedEnergy == undefined) {
            const droppedEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
                filter: resource => resource.resourceType == RESOURCE_ENERGY
            })
            const closestDroppedEnergy = this.pos.findClosestByRange(droppedEnergy)
            if (closestDroppedEnergy != null) {
                global.heap.creeps[this.name].closestDroppedEnergy = closestDroppedEnergy
            }
        }

        if (global.heap.creeps[this.name].closestDroppedEnergy != undefined) {

            if (this.pickup(global.heap.creeps[this.name].closestDroppedEnergy) == ERR_NOT_IN_RANGE) {
                // Move to it
                this.travelTo(global.heap.creeps[this.name].closestDroppedEnergy, { maxRooms: 1  });
                //move_avoid_hostile(creep,closestDroppedEnergy.pos);
            }
            else if (this.pickup(global.heap.creeps[this.name].closestDroppedEnergy) == OK) {
                this.decreaseBalancer();
            }
        }
        else {//no container or dropped energy to collect from
            var awayFromSpawn = true
            if (global.heap.rooms[this.memory.homeRoom].spawns != undefined) {
                for (sp of global.heap.rooms[this.memory.homeRoom].spawns) {
                    if (this.pos.inRangeTo(sp.pos, 4)) {
                        if (this.room.memory.mineralId != undefined &&
                            Game.getObjectById(this.room.memory.mineralId) != null
                        ) {
                            this.travelTo(Game.getObjectById(this.room.memory.mineralId), { range: 1  })
                        }

                        awayFromSpawn = false
                    }

                }
            }
            if (awayFromSpawn) {
                this.sleep(10)
            }

        }
    }
}

//TASK UPGRADE CONTROLLER
Creep.prototype.taskUpgrade = function taskUpgrade() {


    if (global.heap.rooms[this.memory.homeRoom].building == true &&
        this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_TOP_LIMIT)
        
    ) {

        global.heap.creeps[this.name].task = C.TASK_BUILD
        //this.memory.task = C.TASK_BUILD
        
        if(global.heap.creeps[this.name].isBoosted && this.memory.role==C.ROLE_WORKER)
        {
             global.heap.creeps[this.name].task=C.TASK_UPGRADE
        }

    }

    if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0) {
        global.heap.creeps[this.name].task = undefined
        return -1;
    }
    var upgradeResult = this.upgradeController(this.room.controller);
    if (upgradeResult == ERR_NOT_IN_RANGE || true) {
        this.travelTo(this.room.controller, { maxRooms: 1  });
    }

    //Repairing ramparts on the road to controller
    if (global.heap.rooms[this.room.name].myRamparts != undefined) {
                for (r of global.heap.rooms[this.room.name].myRamparts) {
                    var ra = Game.getObjectById(r)
                    if (ra != null && ra.hits < C.RAMPART_MIN_WORKER_HITS
                        && this.pos.getRangeTo(ra.pos.x,ra.pos.y)<4
                    ) {
                        //aux.push(ra)
                        this.repair(ra)
                        break;
                    }
                }
            }

    //Sharing energy
    if (this.store[RESOURCE_ENERGY] > 0 && global.heap.rooms[this.memory.homeRoom].myWorkers != undefined && global.heap.rooms[this.memory.homeRoom].myWorkers.length > 0
        && Game.time % 3 == 0
    ) {
        for (a of global.heap.rooms[this.memory.homeRoom].myWorkers) {
            cr = Game.getObjectById(a)
            if (cr == null) { continue; }

            if (cr != null && cr.store[RESOURCE_ENERGY] < this.store[RESOURCE_ENERGY] &&
                (cr.pos.getMyRangeTo(this.room.controller.pos) < this.pos.getMyRangeTo(this.room.controller.pos)
                    || (global.heap.creeps[this.name].deposit != undefined && cr.pos.getMyRangeTo(global.heap.creeps[this.name].deposit.pos) > this.pos.getMyRangeTo(global.heap.creeps[this.name].deposit.pos))
                )
                && this.pos.getMyRangeTo(cr.pos) < 1.5) {

                this.upgradeController(this.room.controller);
                if (!this.pos.isNearTo(this.room.controller)) {
                    this.transfer(cr, RESOURCE_ENERGY)
                }


                break;
            }
        }
    }


}

//TASK BUILD
Creep.prototype.taskBuild = function taskBuild() {


    if (this.store[RESOURCE_ENERGY] == 0) {
        global.heap.creeps[this.name].task = undefined
    }

    if (global.heap.rooms[this.room.name].building != true) {

        global.heap.creeps[this.name].task = undefined
        this.memory.task = 'undefined_debugging_build'
        return null
    }
    else {
        var sites = []
        var toFocus = null
        if (this.memory.role == C.ROLE_REPAIRER) { // repairer should go to closest one 
            aux = []
            for (c of global.heap.rooms[this.room.name].construction) {
                if (Game.getObjectById(c) != null && Game.getObjectById(c).pos !== this.pos) {
                    aux.push(Game.getObjectById(c))
                    if (toFocus == null || (toFocus != null && toFocus.structureType == STRUCTURE_ROAD)) {

                        if (Game.getObjectById(c).structureType == STRUCTURE_SPAWN) {
                            toFocus = Game.getObjectById(c)
                            break;
                        }

                        if (Game.getObjectById(c).structureType == STRUCTURE_STORAGE) {
                            toFocus = Game.getObjectById(c)
                        }
                        else if (Game.getObjectById(c).structureType == STRUCTURE_CONTAINER) {
                            toFocus = Game.getObjectById(c)
                        }
                        else if (Game.getObjectById(c).structureType == STRUCTURE_ROAD) {


                            var aux = [];
                            if (toFocus != null) { aux.push(toFocus) }
                            if (Game.getObjectById(c) != null) { aux.push(Game.getObjectById(c)) }
                            var closest = this.pos.findClosestByPath(aux)
                            if (toFocus == null) {
                                toFocus = Game.getObjectById(c)
                            }
                            else if (closest != null && closest.id == Game.getObjectById(c).id) {
                                toFocus = Game.getObjectById(c)
                            }


                        }
                        else if (Game.getObjectById(c).structureType == STRUCTURE_EXTENSION) {
                            toFocus = Game.getObjectById(c)
                        }
                    }

                }
            }

            if (toFocus == null) {
                toFocus = this.pos.findClosestByRange(aux)
            }

        }
        else {
            var toFocus = null
            var aux = []
            for (c of global.heap.rooms[this.room.name].construction) {
                if (Game.getObjectById(c) != null && (Game.getObjectById(c).pos.x !== this.pos.x || Game.getObjectById(c).pos.y != this.pos.y)
                    && Game.getObjectById(c).pos.roomName == this.pos.roomName) {

                    if (Game.getObjectById(c) != null && Game.getObjectById(c).pos !== this.pos) {
                        aux.push(Game.getObjectById(c))
                        if (toFocus == null) {
                            if (Game.getObjectById(c).structureType == STRUCTURE_STORAGE) {
                                toFocus = Game.getObjectById(c)
                            }
                            else if (Game.getObjectById(c).structureType == STRUCTURE_CONTAINER) {
                                toFocus = Game.getObjectById(c)
                            }
                            else if (Game.getObjectById(c).structureType == STRUCTURE_ROAD) {
                                toFocus = Game.getObjectById(c)
                            }
                            else if (Game.getObjectById(c).structureType == STRUCTURE_EXTENSION) {
                                toFocus = Game.getObjectById(c)
                            }
                        }

                    }


                }
            }

            if (global.heap.rooms[this.room.name].myRamparts != undefined) {
                for (r of global.heap.rooms[this.room.name].myRamparts) {
                    var ra = Game.getObjectById(r)
                    if (ra != null && ra.hits < C.RAMPART_MIN_WORKER_HITS
                        && this.pos.getRangeTo(ra.pos.x,ra.pos.y)<4
                    ) {
                        //aux.push(ra)
                        this.repair(ra)
                        break;
                    }
                }
            }

            if (toFocus == null) {


                toFocus = this.pos.findClosestByRange(aux)
            }
        }

        if (toFocus != null) {
            if (this.build(toFocus) == ERR_NOT_IN_RANGE || this.repair(toFocus) == ERR_NOT_IN_RANGE) {
                this.travelTo(toFocus, { range: 1, maxRooms: 1  })
                return
            }
            else if (this.build(toFocus) == ERR_INVALID_TARGET) {
                //this.move(Math.floor(Math.random() * (8 - 1 + 1)) + 1)
                return null;
            }

            return toFocus;
        }
        else if (sites.length > 0) {

            var closest = this.pos.findClosestByRange(sites)
            if (closest != null) {


                if (this.build(closest) == ERR_NOT_IN_RANGE || this.repair(closest) == ERR_NOT_IN_RANGE) {
                    this.travelTo(closest, { range: 2, maxRooms: 1 })
                }
                return closest
            }

        }

    }


    return null

}

Creep.prototype.taskHarvest = function taskHarvest() {

    if (global.heap.creeps[this.name].targetSource != undefined && Game.getObjectById(global.heap.creeps[this.name].targetSource) == null) {
        global.heap.creeps[this.name].targetSource = undefined;
    }

    if (global.heap.creeps[this.name].targetSource == undefined) {

        if (global.heap.rooms[this.memory.targetRoom].colonizeSources != undefined) {
            for (s of global.heap.rooms[this.memory.targetRoom].colonizeSources) {
                if (s.harvesters.length < s.maxHarvesters) {
                    s.harvesters.push(this.id)
                    global.heap.creeps[this.name].targetSource = s.id
                    break;
                }
            }
        }


    }

    if (global.heap.creeps[this.name].targetSource != undefined) {
        if (Game.getObjectById(global.heap.creeps[this.name].targetSource) != null && this.harvest(Game.getObjectById(global.heap.creeps[this.name].targetSource)) == ERR_NOT_IN_RANGE) {
            this.travelTo(Game.getObjectById(global.heap.creeps[this.name].targetSource), {  maxRooms: 1 })
        }
    }

}

Creep.prototype.taskCollectMineral = function taskCollectMineral() {

    //var miners=[];
    var mostFullId = undefined;
    var mostFullAmount = Infinity;

    for (id of global.heap.rooms[this.memory.homeRoom].miners) {
        if (Game.getObjectById(id) != null && Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY) < mostFullAmount) {
            mostFullId = id
            mostFullAmount = Game.getObjectById(id).store.getFreeCapacity(RESOURCE_ENERGY)
            //miners.push(id)
        }
    }
    if (mostFullId != undefined) {
        if (!this.pos.isNearTo(Game.getObjectById(mostFullId))) {

            this.travelTo(Game.getObjectById(mostFullId))
        }


    }

}

Creep.prototype.taskStoreMineral = function taskStoreMineral() {

    var storage = this.room.storage

    if (this.room.terminal != undefined) {
        storage = this.room.terminal
    }

    if (storage != undefined) {
        if (this.pos.isNearTo(storage)) {
            for (res in this.store) {
                if (this.transfer(storage, res) == OK) {
                    break;
                }
            }
        }
        else {
            this.travelTo(storage)
        }
    }


}

Creep.prototype.taskFillNukerEnergy = function taskFillNukerEnergy() {
    var nuker = Game.getObjectById(global.heap.rooms[this.room.name].myNuker)
    var storage = this.room.storage;
    var terminal = this.room.terminal;

    if (nuker == null || storage == undefined || terminal == undefined) {
        return
    }
    var targetStore = undefined
    if (storage.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT) {
        this.withdraw(storage, RESOURCE_ENERGY, Math.min(nuker.store.getFreeCapacity(RESOURCE_ENERGY), this.store.getCapacity(RESOURCE_ENERGY)))
    }
    else if (terminal.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT) {
        this.withdraw(terminal, RESOURCE_ENERGY, Math.min(nuker.store.getFreeCapacity(RESOURCE_ENERGY), this.store.getCapacity(RESOURCE_ENERGY)))
    }

    this.transfer(nuker, RESOURCE_ENERGY)

}

Creep.prototype.taskFillNukerGhodium = function taskFillNukerGhodium() {
    var nuker = Game.getObjectById(global.heap.rooms[this.room.name].myNuker)
    var storage = this.room.storage;
    var terminal = this.room.terminal;

    if (nuker == null || storage == undefined || terminal == undefined) {
        
        return
    }
    if (storage.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT) {
        this.withdraw(storage, RESOURCE_GHODIUM)
    }
    else if (terminal.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT) {
        this.withdraw(terminal, RESOURCE_GHODIUM)
    }
    else {
        this.transfer(nuker, RESOURCE_GHODIUM)
        global.heap.rooms[this.room.name].managerTask = undefined
    }
    this.transfer(nuker, RESOURCE_GHODIUM)


}


