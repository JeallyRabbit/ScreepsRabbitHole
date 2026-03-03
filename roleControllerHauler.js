


const C = require('constants')


Creep.prototype.roleControllerHauler = function roleControllerHauler(spawn) {//transfer energy grom containers (and storage) to extensions and spawn (if they are full equalize energy at containers)


    this.say("1")
    global.heap.creeps[this.name].task = C.TASK_FILL_UPGRADERS_CONTAIER

    var storage = this.room.storage
    //this.say(storage)
    var upgradersContainer = Game.getObjectById(this.room.memory.upgradersContainerId)
    this.say(upgradersContainer)
    if (storage == null || storage == undefined
        || upgradersContainer == null) {
        return;
    }
    var storageCondition = (this.room.controller.level >= 4 && storage != undefined
        && storage.store[RESOURCE_ENERGY] > C.STORAGE_BALANCER_START * 2)

        this.say("2")
    if (global.heap.creeps[this.name].task == C.TASK_FILL_UPGRADERS_CONTAIER
        && storageCondition
    ) {

        this.say("3")
        if (this.store[RESOURCE_ENERGY] == 0) {
            if (this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(storage)
            }
        }
        else {
            //Sharing energy
        if (this.store[RESOURCE_ENERGY] > 0 && global.heap.rooms[this.memory.homeRoom].myWorkers != undefined && global.heap.rooms[this.memory.homeRoom].myWorkers.length > 0
            && Game.time % 2 == 0 && false
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

            if (this.transfer(upgradersContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.travelTo(upgradersContainer)
                return
            }
        }

    }
}