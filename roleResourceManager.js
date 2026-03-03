

const C = require('./constants');
const { rest } = require('lodash');



Creep.prototype.roleResourceManager = function roleResourceManager() {//transfer energy grom containers to storage



    var terminal = this.room.terminal;
    var storage = this.room.storage;
    var managerLink = undefined



    //global.heap.rooms[this.room.name].managerTask = undefined;
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

        if (storage != undefined) {

            if (global.heap.rooms[this.room.name].managerTask == undefined) {

                if (this.store.getCapacity(RESOURCE_ENERGY) > this.store.getFreeCapacity(RESOURCE_ENERGY)) {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_CLEAR_CREEP
                }
                else if (managerLink != undefined && managerLink.store.getFreeCapacity(RESOURCE_ENERGY) > C.LINK_FREE_SPACE) {

                    global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_LINK
                }
                else if (managerLink != undefined && managerLink.store[RESOURCE_ENERGY] > C.LINK_TOP_ENERGY
                    && this.room.controller.level == 8
                ) {

                    global.heap.rooms[this.room.name].managerTask = C.TASK_TAKE_FROM_LINK;
                }
                else if (terminal != undefined) {
                    if (terminal != undefined && terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && (storage.store[RESOURCE_ENERGY] < C.STORAGE_ENERGY_BOTTOM || (Memory.fastRclUpgrade != undefined && Memory.fastRclUpgrade == this.room.name))) {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[RESOURCE_ENERGY]
                    }
                    else if (terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY && storage.store[RESOURCE_ENERGY] > C.STORAGE_TOP_ENERGY) {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[RESOURCE_ENERGY]
                    }
                    else if (isT3BoostInStore(storage.store) != false)//T3 boosts should be only in terminal
                    {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[isT3BoostInStore(terminal.store)]
                    }
                    else if (isRawResInStore(storage.store) != false)//Raw Resources should be in terminal
                    {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[isRawResInStore(storage.store)]
                    }
                    else if (isT1orT2InStore(terminal.store) != false)//T1/T2 should be only in storage
                    {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[isT1orT2InStore(terminal.store)]
                    }
                    else if (terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && storage.store[RESOURCE_ENERGY] < C.STORAGE_TOP_ENERGY) {

                        global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[RESOURCE_ENERGY]
                    }
                    else if (Game.getObjectById(global.heap.rooms[this.room.name].myNuker) != null) {
                        var nuker = Game.getObjectById(global.heap.rooms[this.room.name].myNuker)
                        if ((nuker.store[RESOURCE_GHODIUM] < NUKER_GHODIUM_CAPACITY && (storage.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT || terminal.store[RESOURCE_GHODIUM] > C.MIN_NUKER_RES_AMOUNT))
                        ) {
                            global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_NUKER_GHODIUM
                        }
                        else if ((nuker.store[RESOURCE_ENERGY] < NUKER_ENERGY_CAPACITY) && (storage.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT || terminal.store[RESOURCE_ENERGY] > C.MIN_NUKER_RES_AMOUNT)) {
                            global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_NUKER_ENERGY
                        }

                    }
                }


            }



            if (global.heap.rooms[this.room.name].managerTask == C.TASK_CLEAR_CREEP) {
                if (this.store.getCapacity() == this.store.getFreeCapacity()) {
                    global.heap.rooms[this.room.name].managerTask = undefined;
                    return;
                }
                this.taskClearCreep()
            }
            if (global.heap.rooms[this.room.name].managerTask == C.TASK_FILL_LINK) {


                //var amount = Math.min((C.LINK_BOTTOM_ENERGY - managerLink.store[RESOURCE_ENERGY]) + 1,this.store.getFreeCapacity(RESOURCE_ENERGY))

                var amount = managerLink.store.getFreeCapacity(RESOURCE_ENERGY)
                if (this.store[RESOURCE_ENERGY] == 0) {


                    this.withdraw(storage, RESOURCE_ENERGY, Math.min(this.store.getFreeCapacity(RESOURCE_ENERGY), amount))

                    if (this.room.terminal != undefined /*&& this.room.terminal.store[RESOURCE_ENERGY] > C.TERMINAL_BOTTOM_ENERGY */) {
                        this.withdraw(terminal, RESOURCE_ENERGY, amount)
                    }
                }
                else {
                    var result = this.transfer(managerLink, RESOURCE_ENERGY)
                    if (result == OK) {
                        global.heap.rooms[this.room.name].managerTask = undefined
                    }
                }



            }

            if (global.heap.rooms[this.room.name].managerTask == C.TASK_TAKE_FROM_LINK) {
                if (managerLink.store[RESOURCE_ENERGY] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
                this.withdraw(managerLink, RESOURCE_ENERGY)
                if (terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY) {//change that to firstly put into terminal
                    this.transfer(terminal, RESOURCE_ENERGY)
                }
                else {
                    this.transfer(storage, RESOURCE_ENERGY)
                }

            }
            if (global.heap.rooms[this.room.name].managerTask != undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_storage")) {
                var resToTransfer = global.heap.rooms[this.room.name].managerTask.replace("transfer_to_storage_", "")

                //exit condition for resourceManager transfering from terminal to storage
                if (resToTransfer == RESOURCE_ENERGY) {
                    if (!(terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && storage.store[RESOURCE_ENERGY] < C.STORAGE_TOP_ENERGY) && Memory.fastRclUpgrade != this.room.name) {
                        global.heap.rooms[this.room.name].managerTask = undefined
                    }
                    if (storage.store.getFreeCapacity(RESOURCE_ENERGY) == 0) {
                        this.transfer(managerLink, RESOURCE_ENERGY)
                        global.heap.rooms[this.room.name].managerTask = undefined
                    }
                }
                else if (Memory.fastRclUpgrade == this.room.name && terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }

                if (terminal.store[resToTransfer] == 0) { global.heap.rooms[this.room.name].managerTask = undefined }
                else {
                    this.withdraw(terminal, resToTransfer)
                    this.transfer(storage, resToTransfer, this.store.getCapacity(resToTransfer))
                }
                if (terminal.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            else if (global.heap.rooms[this.room.name].managerTask != undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_terminal_")) {
                var resToTransfer = global.heap.rooms[this.room.name].managerTask.replace("transfer_to_terminal_", "");

                if (resToTransfer == RESOURCE_ENERGY && terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                    return
                }
                if (storage.store[resToTransfer] == 0 && this.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined

                    return
                }
                else {
                    this.withdraw(storage, resToTransfer)
                    if (this.transfer(terminal, resToTransfer, this.store.getCapacity(resToTransfer)) != OK) {
                        this.transfer(terminal, resToTransfer, this.store[resToTransfer])
                    }
                }
                if (storage.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            else if (global.heap.rooms[this.room.name].managerTask == C.TASK_FILL_NUKER_ENERGY) {
                this.taskFillNukerEnergy()
            }
            else if (global.heap.rooms[this.room.name].managerTask == C.TASK_FILL_NUKER_GHODIUM) {
                this.taskFillNukerGhodium();
            }


        }
    };
}

function isT3BoostInStore(store) {


    for (res in store) {
        if (res == RESOURCE_ENERGY) { continue; }

        //console.log(res, " ",C.REVERSED_RESOURCE[res], store[res])
        if (C.REVERSED_RESOURCE[res].replace("RESOURCE_", "").startsWith("CATALYZED")) {
            return res
        }
    }
    return false
}

function isT1orT2InStore(store) {


    for (res in store) {
        if (res == RESOURCE_ENERGY) { continue; }
        if ((C.REVERSED_RESOURCE[res].endsWith("OXIDE") || C.REVERSED_RESOURCE[res].endsWith("HYDRIDE") || C.REVERSED_RESOURCE[res].endsWith("ACID") || C.REVERSED_RESOURCE[res].endsWith("ALKALIDE"))
            && !((C.REVERSED_RESOURCE[res].replace("RESOURCE_", "")).startsWith("CATALYZED"))) {

            return res
        }
    }
    return false
}

function isRawResInStore(store) {
    var rawResources = ["H", "O", "U", "L", "K", "Z", "X"]
    for (res in store) {
        if (res == RESOURCE_ENERGY) { continue; }
        if (rawResources.includes(res)) {
            return res
        }
    }
    return false
}

Creep.prototype.clearCreepStore = function clearCreepStore(storage, res) {
    for (r in this.store) {
        if (r != res && this.transfer(storage, r) == OK) {
            return;
        }
    }
}
