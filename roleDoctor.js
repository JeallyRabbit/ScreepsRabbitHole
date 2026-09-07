const C = require('constants')

Creep.prototype.roleDoctor = function roleDoctor() {

    this.say(global.heap.rooms[this.room.name].doctorTask, true)
    var storage = this.room.storage
    var terminal = this.room.terminal
    var inputLab1 = Game.getObjectById(Game.rooms[this.room.name].memory.inLab1Id)
    var inputLab2 = Game.getObjectById(Game.rooms[this.room.name].memory.inLab2Id)
    var outputLabs = []
    if (global.heap.rooms[this.room.name].outLabsId != undefined) {
        for (outputId of global.heap.rooms[this.room.name].outLabsId) {
            var outputLab = Game.getObjectById(outputId)
            if (outputLab != null) {
                outputLabs.push(outputLab)
            }
        }
    }


    var boostingLab = Game.getObjectById(Game.rooms[this.room.name].memory.boostingLabId)

    if (this.ticksToLive < C.DOCTOR_MIN_REMAINING_TIME) {
        this.taskClearCreep()
        return;
    }

    /*
    console.log("stofage: ",storage)
    console.log("terminal: ",terminal)
    console.log("inputLab1: ",inputLab1)
    console.log("inputLab2: ",inputLab2)
    console.log("outputLabs: ",outputLabs.length)
    console.log("boostingLab: ",boostingLab)
    */
    if (storage == null || terminal == null || inputLab1 == null || inputLab2 == null || outputLabs.length == 0
        || boostingLab == null
    ) {
        this.say("error")
        this.awayFromSpawn()
        return
    }

    //raw taking from terminal
    //storing everything in storage

    //storage
    // terminal
    // inputLab1
    // inputLab2
    // boostingLab
    // outputLabs

    // filling input labs energy
    //filling input labs minerals-- when they are empty/(close to empty and match reaction)
    // clearing input labs -- one of them empty 
    // taking stuff from output labs -- 
    if (global.heap.rooms[this.room.name].doctorTask == undefined) {

        var res1 = undefined
        var res2 = undefined
        if (global.heap.rooms[this.room.name].reaction != undefined) {
            res1 = (global.heap.rooms[this.room.name].reaction[0] != undefined) ? global.heap.rooms[this.room.name].reaction[0] : undefined;
            res2 = (global.heap.rooms[this.room.name].reaction[0] != undefined) ? global.heap.rooms[this.room.name].reaction[1] : undefined;
        }
        
        if (this.store.getCapacity() != this.store.getFreeCapacity(RESOURCE_ENERGY)
            && (res1 != undefined && this.store[res1] == 0 && res2 != undefined && this.store[res2] == 0
        &&  global.heap.rooms[this.room.name].doctorTask != C.TASK_BOOST_CREEP) // this line might be wrong
        ) {
            this.say("1")
            global.heap.rooms[this.room.name].doctorTask = C.TASK_CLEAR_CREEP
        }
        //
        else if (anyLabNeedEnergy(this.room.name) != false) {
            this.say("2")
            global.heap.rooms[this.room.name].doctorTask = C.TASK_FILL_LAB_ENERGY
            global.heap.rooms[this.room.name].labNeedEnergyId = anyLabNeedEnergy(this.room.name)
        }
        else if (global.heap.rooms[this.room.name].boostingRequests.length > 0) {
            this.say("3")
            global.heap.rooms[this.room.name].doctorTask = C.TASK_BOOST_CREEP
        }
        else if (this.room.ifBothInputMineralEmpty(inputLab1, inputLab2) == true) {
            this.say(C.TASK_FILL_INPUT_LABS_MINERAL)
            global.heap.rooms[this.room.name].doctorTask = C.TASK_FILL_INPUT_LABS_MINERAL
        }
        else if (this.room.oneInputMineralEmpty(inputLab1, inputLab2) != false
    || this.room.inputLabsMatchReaction(inputLab1,inputLab2)==false//,add checking if input labs have wrong ingredients
    ) {
            this.say("5")
            global.heap.rooms[this.room.name].doctorTask = C.TASK_CLEAR_INPUT_LABS
        }
        else {
            this.say("6")
            global.heap.rooms[this.room.name].doctorTask = C.TASK_CLEAR_OUTPUT_LABS
        }

    }


    if (global.heap.rooms[this.room.name].doctorTask != undefined) {
        if (global.heap.rooms[this.room.name].doctorTask == C.TASK_CLEAR_CREEP) {
            this.taskClearCreep()
        }
        else if (global.heap.rooms[this.room.name].doctorTask == C.TASK_FILL_LAB_ENERGY) {
            this.taskFillLabEnergy(global.heap.rooms[this.room.name].labNeedEnergyId)
        }
        else if(global.heap.rooms[this.room.name].doctorTask == C.TASK_BOOST_CREEP)
        {
            this.processBoostRequest()
        }
        else if (global.heap.rooms[this.room.name].doctorTask == C.TASK_FILL_INPUT_LABS_MINERAL) {
            
            if (global.heap.rooms[this.room.name].boostingRequests.length > 0) {
                this.say("3")
                global.heap.rooms[this.room.name].doctorTask = C.TASK_BOOST_CREEP
                
            }
            else
            {
                this.say("fill in")
                this.taskFillInputLabsMineral(inputLab1, inputLab2)
            }
            
        }
        else if (global.heap.rooms[this.room.name].doctorTask == C.TASK_CLEAR_INPUT_LABS) {
            this.taskClearInputLabs(inputLab1, inputLab2)
        }
        else if (global.heap.rooms[this.room.name].doctorTask == C.TASK_CLEAR_OUTPUT_LABS) {
            this.taskClearOutputLabs(inputLab1, inputLab2)
        }
        
    }
}

Room.prototype.inputLabsMatchReaction = function inputLabsMatchReaction(in1,in2)
{
    if(global.heap.rooms[this.name].reaction==undefined)
    {
        return false
    }
    var res1=global.heap.rooms[this.name].reaction[0]
    var res2=global.heap.rooms[this.name].reaction[1]
    if(in1.store[res1]>=LAB_REACTION_AMOUNT || in2.store[res2]>=LAB_REACTION_AMOUNT)
        {
        return false
    }
    return true
}

Room.prototype.bothInputMineralNotEmpty = function bothInputMineralNotEmpty(in1, in2) {
    var in1Empty = true
    var in2Empty = true

    var res1 = 1
    var res2 = 0
    for (res in in1.store) {
        if (res != RESOURCE_ENERGY && in1.store[res] > 0
            // && res!=global.heap.rooms[this.name].reaction[0]
        ) {
            res1 = res
            in1Empty = false
            break
        }
    }
    for (res in in2.store) {
        if (res != RESOURCE_ENERGY && in2.store[res] > 0
            //&& res!=global.heap.rooms[this.name].reaction[1]
        ) {
            res2 = res
            in2Empty = false
            break
        }
    }

    if (in1Empty ==false && in2Empty==false) {
        return true;
    }
    return false

}

Room.prototype.oneInputMineralEmpty = function oneInputMineralEmpty(in1, in2) {
    var in1Empty = true
    var in2Empty = true

    var res1 = 1
    var res2 = 0
    for (res in in1.store) {
        if (res != RESOURCE_ENERGY && in1.store[res] > 0
            // && res!=global.heap.rooms[this.name].reaction[0]
        ) {
            res1 = res
            in1Empty = false
            break
        }
    }
    for (res in in2.store) {
        if (res != RESOURCE_ENERGY && in2.store[res] > 0
            //&& res!=global.heap.rooms[this.name].reaction[1]
        ) {
            res2 = res
            in2Empty = false
            break
        }
    }
    if (in1Empty != in2Empty || res1 == res2) {
        if (in1Empty == true) {
            return 1
        }
        else if (in2Empty == true) {
            return 2
        }
    }
    return false

}

Room.prototype.ifBothInputMineralEmpty = function ifBothInputMineralEmpty(in1, in2) {

    for (res in in1.store) {
        if (res != RESOURCE_ENERGY) {
            return false
        }
    }
    for (res in in2.store) {
        if (res != RESOURCE_ENERGY) {
            return false
        }
    }
    return true
}

function anyLabNeedEnergy(roomName) {
    for (id of global.heap.rooms[roomName].myLabs) {
        var lab = Game.getObjectById(id)
        if (lab.store[RESOURCE_ENERGY] < LAB_ENERGY_CAPACITY / 2) {
            return id
        }
    }
    return false
}
function inputsNeedEnergy(in1, in2) {
    if (in1.store.getUsedCapacity(RESOURCE_ENERGY) < LAB_ENERGY_CAPACITY / 2) {
        return 1
    }
    else if (in2.store.getUsedCapacity(RESOURCE_ENERGY) < LAB_ENERGY_CAPACITY / 2) {
        return 2
    }
    else {
        return false
    }
}