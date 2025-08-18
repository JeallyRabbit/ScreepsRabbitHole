

const C = require('constants');
const { rest } = require('lodash');

localHeap = {}

Creep.prototype.roleResourceManager = function roleResourceManager() {//transfer energy grom containers to storage


    //Needs:
    // global.heap.rooms[this.memory.homeRoom].managerLinkId

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

            if (global.heap.rooms[this.room.name].managerTask == undefined) {
                if (managerLink != undefined && managerLink.store[RESOURCE_ENERGY] < C.LINK_BOTTOM_ENERGY) {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_FILL_LINK
                }
                else if (terminal.store[RESOURCE_ENERGY] > C.TERMINAL_TOP_ENERGY && storage.store[RESOURCE_ENERGY] < C.STORAGE_ENERGY_BOTTOM) {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[RESOURCE_ENERGY]
                }
                else if (terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY && storage.store[RESOURCE_ENERGY] > C.STORAGE_TOP_ENERGY) {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[RESOURCE_ENERGY]
                }
                else if (isT3BoostInStore(terminal.store) != false)//T3 boosts should be only in storage
                {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[isT3BoostInStore(terminal.store)]
                }
                else if (isRawResInStore(storage.store) != false)//Raw Resources in terminal
                {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_TERMINAL[isRawResInStore(storage.store)]
                }
                else if (isT1orT2InStore(terminal.store) != false)//T1/T2 should be only in storage
                {
                    global.heap.rooms[this.room.name].managerTask = C.TASK_TRANSFER_TO_STORAGE[isT1orT2InStore(terminal.store)]
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
            if (global.heap.rooms[this.room.name].managerTask!=undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_storage")) {
                var resToTransfer = str => str.split("transfer_to_storage_")[1];
                if (terminal.store[resToTransfer] == 0) { global.heap.rooms[this.room.name].managerTask = undefined }
                else {
                    this.withdraw(terminal, resToTransfer)
                    this.transfer(storage, resToTransfer)
                }
                if (terminal.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }
            else if (global.heap.rooms[this.room.name].managerTask!=undefined && global.heap.rooms[this.room.name].managerTask.startsWith("transfer_to_terminal_")) {
                var resToTransfer = str => str.split("transfer_to_terminal")[1];
                if (terminal.store[resToTransfer] == 0) { global.heap.rooms[this.room.name].managerTask = undefined }
                else {
                    this.withdraw(storage, resToTransfer)
                    this.transfer(terminal, resToTransfer)
                }
                if (storage.store[resToTransfer] == 0) {
                    global.heap.rooms[this.room.name].managerTask = undefined
                }
            }


        }
    };
}

function isT3BoostInStore(store) {
    for (res in store) {
        if (res.startsWith("X")) {
            return res
        }
    }
    return false
}

function isT1orT2InStore(store) {
    for (res in store) {
        if ((res.endsWith("oxide") || res.endsWith("hydride") || res.endsWith("acid") || res.endsWith("alkaide"))
            && !res.startsWith("catalyzed")) {
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
