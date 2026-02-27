const C = require('constants')

Room.prototype.operateTowers = function operateTowers() {


    //firstly repair ramparts
    // then attack hostiles
    // then heal my creeps
    // then heal allies

    //repairing ramparts
    if (global.heap.rooms[this.name].myRamparts != undefined && global.heap.rooms[this.name].myRamparts.length > 0) {
        var repairTarget = undefined
        for (r of global.heap.rooms[this.name].myRamparts) {
            var rampart = Game.getObjectById(r)
            if (rampart != null && rampart.hits < C.RAMPART_HITS_BOTTOM_LIMIT) {
                repairTarget = rampart
                //break;
            }
        }
        if (repairTarget != undefined) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    //Game.getObjectById(t).repair(repairTarget)
                }
            }
            //return
        }
    }

    //attacking hostiles
    if (global.heap.rooms[this.name].hostiles != undefined && global.heap.rooms[this.name].hostiles.length > 0) {
        if (global.heap.rooms[this.name].myTowersId != undefined) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    Game.getObjectById(t).attack(global.heap.rooms[this.name].hostiles[0])
                }
            }
            return
        }
    }


    //healing myCreeps
    global.heap.rooms[this.name].myCreepToHeal = []
    var myToHeal = []
    var towersPos = (this.memory.posForTowerKeeper != undefined) ? (new RoomPosition(this.memory.posForTowerKeeper.x, this.memory.posForTowerKeeper.y, this.name)) : undefined
    for (cr of global.heap.rooms[this.name].myCreeps) {
        aux = Game.getObjectById(cr)
        if (aux != null && aux.hits < aux.hitsMax
            && aux.memory.role != C.ROLE_ENERGY_DRAINER
        ) {
            myToHeal.push(aux)
        }
        else if (aux != null && aux.hits < aux.hitsMax
            && aux.memory.role == C.ROLE_ENERGY_DRAINER
            && towersPos != undefined && aux.pos.getRangeTo(towersPos) < 6) {
            myToHeal.push(aux)
        }
    }

    if (myToHeal.length > 0 && towersPos != undefined) {
        var targetToHeal = towersPos.findClosestByRange(myToHeal)
        if (targetToHeal != null) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    Game.getObjectById(t).heal(targetToHeal)
                }
            }
        }
        return
    }


    //Healing allies
    var alliesToHeal = []
    if (towersPos != undefined) {
        for (a of global.heap.rooms[this.name].allies) {
            var aux = Game.getObjectById(a)
            if (aux != null && aux.pos.getRangeTo(towersPos) < 10
        && aux.hits<aux.hitsMax) {
                alliesToHeal.push(aux)
            }
        }
    }

    if (alliesToHeal.length > 0 && towersPos != undefined) {
        var targetToHeal = towersPos.findClosestByRange(alliesToHeal)
        if (targetToHeal != null) {
            for (t of global.heap.rooms[this.name].myTowersId) {
                if (Game.getObjectById(t) != null) {
                    Game.getObjectById(t).heal(targetToHeal)
                }
            }
        }
        return
    }

}