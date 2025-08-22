

const C = require('./constants');
const { rest } = require('lodash');


localHeap = {}

Creep.prototype.roleResourceManager = function roleResourceManager() {//transfer energy grom containers to storage


    //TODO:
    // Add clearing creep store

    var terminal = this.room.terminal;
    var storage = this.room.storage;
    var managerLink = undefined
    global.heap.rooms[this.room.name].managerTask = undefined;
    if (global.heap.rooms[this.memory.homeRoom].managerLinkId != undefined) {
        managerLink = Game.getObjectById(global.heap.rooms[this.memory.homeRoom].managerLinkId);
        if (managerLink == null) {
            this.global.heap.rooms[this.memory.homeRoom].managerLinkId = undefined
        }
    }
    if (storage != undefined && (this.pos.x != storage.pos.x - 1 || this.pos.y != storage.pos.y + 1)) {
        this.travelTo(new RoomPosition(storage.pos.x - 1, storage.pos.y + 1, this.room.name));
        return;
    }
    else {

        if (terminal != undefined && storage != undefined) {


            console.log("T1/T2 boost in storage: ", this.room.name, " ", isT1orT2InStore(storage.store))
            console.log(C.REVERSED_RESOURCE['UH2O'])
            if (global.heap.rooms[this.room.name].managerTask == undefined) {
                this.say("0")
                if (managerLink != undefined && managerLink.store[RESOURCE_ENERGY] < C.LINK_BOTTOM_ENERGY) {
                    this.say("1")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_LINK
                }
                else if (terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && storage.store[RESOURCE_ENERGY] < C.STORAGE_ENERGY_BOTTOM) {
                    this.say("2")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[RESOURCE_ENERGY]
                }
                else if (terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY && storage.store[RESOURCE_ENERGY] > C.STORAGE_TOP_ENERGY) {
                    this.say("3")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[RESOURCE_ENERGY]
                    this.say(C.TASK_TRANSFER_TO_TERMINAL[RESOURCE_ENERGY])
                }
                else if (isT3BoostInStore(terminal.store) != false)//T3 boosts should be only in storage
                {
                    this.say("4")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[isT3BoostInStore(terminal.store)]
                }
                else if (isRawResInStore(storage.store) != false)//Raw Resources should be in terminal
                {
                    this.say("5")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[isRawResInStore(storage.store)]
                }
                else if (isT1orT2InStore(storage.store) != false)//T1/T2 should be only in storage
                {
                    this.say("6")
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[isT1orT2InStore(terminal.store)]
                }
                else {
                    var nuker = Game.getObjectById(global.heap.rooms[this.room.name].myNuker)
                    if ((nuker != null && nuker.store[RESOURCE_GHODIUM] < NUKER_GHODIUM_CAPACITY && (storage.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT || terminal.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT))
                        )
                    {
                        global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_NUKER_GHODIUM
                    }
                    else if((nuker.store[RESOURCE_ENERGY] < NUKER_ENERGY_CAPACITY) && (storage.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT || terminal.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT))
                    {
                        global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_NUKER_ENERGY
                    }



                }

            }



            if (global.heap.rooms[this.room.name].managerTask == C.TASK_FILL_LINK) {
                this.withdraw(storage, RESOURCE_ENERGY)
                this.withdraw(terminal, RESOURCE_ENERGY)
                this.transfer(managerLink, RESOURCE_ENERGY)
                if (managerLink.store[RESOURCE_ENERGY] > C.LINK_BOTTOM_ENERGY) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            if (global.heap.rooms[this.room.name].managerTask != undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_storage")) {
                var resToTransfer = global.heap.rooms[this.room.name].managerTask.replace("transfer_to_storage_", "")
                if (terminal.store[resToTransfer] == 0) { global.heap.rooms[this.room.name].managerTask = undefined }
                else {
                    this.withdraw(terminal, resToTransfer)
                    this.transfer(storage, resToTransfer)
                }
                if (terminal.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            else if (global.heap.rooms[this.room.name].managerTask != undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_terminal_")) {
                var resToTransfer = global.heap.rooms[this.room.name].managerTask.replace("transfer_to_terminal_", "");
                this.say("7")
                if (storage.store[resToTransfer] == 0) { global.heap.rooms[this.room.name].managerTask = undefined }
                else {
                    this.withdraw(storage, resToTransfer)
                    this.transfer(terminal, resToTransfer)
                }
                if (storage.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            else if(global.heap.rooms[this.room.name].managerTask == C.TASK_FILL_NUKER_ENERGY)
            {
                this.taskFillNukerEnergy()
            }
            else if(global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_NUKER_GHODIUM)
            {
                this.taskFillNukerGhodium();
            }


        }
    };
}

function isT3BoostInStore(store) {

    for (res in store) {
        if (C.REVERSED_RESOURCE[res].startsWith("CATALYZED")) {
            return res
        }
    }
    return false
}

function isT1orT2InStore(store) {

    for (res in store) {
        //Base compounds are included here
        if ((C.REVERSED_RESOURCE[res].endsWith("OXIDE") || C.REVERSED_RESOURCE[res].endsWith("HYDRITE") || C.REVERSED_RESOURCE[res].endsWith("ACID") || C.REVERSED_RESOURCE[res].endsWith("ALKAIDE"))
            && !C.REVERSED_RESOURCE[res].replace("RESOURCE__", "").startsWith("CATALYZED")) {

            return res
        }
    }
    return false
}

function isRawResInStore(store) {
    var rawResources = ["H", "O", "U", "L", "K", "Z", "X"]
    for (res in store) {
        if (rawResources.includes(res)) {
            return res
        }
    }
    return false
}

Creep.prototype.clearCreepStore = function clearCreepStore(storage, res) {
    //this.say("clearing")
    for (r in this.store) {
        if (r != res && this.transfer(storage, r) == OK) {
            return;
        }
    }
}
