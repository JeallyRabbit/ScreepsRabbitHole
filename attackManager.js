const C = require('constants');


class Quad {
    constructor(quadId, targetRoom, homeRoom) {
        this.id = quadId;
        this.targetRoom = targetRoom;
        this.homeRoom = homeRoom
        this.minEnergyOnCreep = -1;
        this.members = [];
    }
}

class attackHistoryData {
    constructor(areOperational, time, rangedPower = 0, meleePower = 0) {
        this.areOperational = areOperational
        this.time = time
        this.rangedAttackPower = rangedPower;
        this.meleeAtackPower = meleePower
    }
}

class generalRoomRequest {
    constructor(roomName, type) {
        this.name = roomName
        this.type = type;
    }
}


function attackManager(attackRoom) {
    console.log("AttackManager")



    // TODO:
    // 1. Calculate How many bodyparts or spawnTimeTicks is needed to every attack type instance 

    // 
    // (e.g quad needs 200 bodyparts, 
    // single drainer need 50
    // single dismantler needs 50)
    // nuke needs 0
    // plunder needs 50
    // scout needs 1
    // 2. attackManager should decide who (which room) would spawn which creep
    // 3. attackManager should how many nuke should be launched and by which room
    // for attacking mechanic - gathering data


    // Array to store history of towers availability
    if (attackRoom.areTowersOperationalHistory == undefined) {
        attackRoom.areTowersOperationalHistory = []
    }

    if (attackRoom.areDefendersPresentHistory == undefined) {
        attackRoom.areDefendersPresentHistory = []
    }

    if (attackRoom.operationalTowersAmountHistory == undefined) {
        attackRoom.operationalTowersAmountHistory = []
    }



    attackRoom.areDefendersPresent = false;


    // boolean to agregate results of history into one value
    attackRoom.areTowersHistoryOperational = false

    // boolean to agregate status of all towers in single tick (gets status of one tick)
    attackRoom.areTowersOperational = true

    attackRoom.towers = []
    attackRoom.ramparts = []
    attackRoom.walls = []

    if (Game.rooms[attackRoom.name] != undefined) {
        str = Game.rooms[attackRoom.name].find(FIND_STRUCTURES)
        var anyOperational = false
        var operationalTowersAmount = 0;
        for (s of str) {

            if (s.structureType == STRUCTURE_TOWER) {

                //tracking if towers are refilled/operational/can shoot
                attackRoom.towers.push(s)
                if (s.store[RESOURCE_ENERGY] > 0) {
                    anyOperational = true
                }
                operationalTowersAmount++;
            }
            else if (s.structureType == STRUCTURE_RAMPART) {
                global.heap.rooms.ramparts.push(s)
            }
            else if (s.structureType == STRUCTURE_WALL) {
                attackRoom.walls.push(s)
            }

        }

        if (attackRoom.hostileAttackPower > 0 || attackRoom.hostileRangedAttackPower > 0) {
            attackRoom.areDefendersPresentHistory.push(new attackHistoryData(true, Game.time,
                attackRoom.hostileRangedAttackPower, attackRoom.hostileAttackPower
            ))
        }
        else {
            attackRoom.areDefendersPresentHistory.push(new attackHistoryData(false, Game.time))

        }
        var historyLength = attackRoom.areTowersOperationalHistory.length
        attackRoom.areTowersOperationalHistory.push(new attackHistoryData(anyOperational, Game.time, operationalTowersAmount))

        //limiting towers history length
        if (attackRoom.areTowersOperationalHistory[historyLength - 1].time - attackRoom.areTowersOperationalHistory[0].time > C.ROOM_ATTACK_HISTORY_RANGE) {
            attackRoom.areTowersOperationalHistory.shift()
        }

        //limiting creeps history length
        if (attackRoom.areDefendersPresentHistory[historyLength - 1].time - attackRoom.areDefendersPresentHistory[0].time > C.ROOM_ATTACK_HISTORY_RANGE) {
            attackRoom.areDefendersPresentHistory.shift()
        }

        //Defender creeps (attack,rangedAttack) history
        for (h of attackRoom.areDefendersPresentHistory) {
            if (h.areOperational) {
                attackRoom.areDefendersPresent = true
                break;
            }
        }


        //Towers History

        //Calculate how many towers are operational on average
        var auxSum = 0;
        var auxCounter = 0
        for (h of attackRoom.areTowersOperationalHistory) {
            if (h.areOperational) {
                attackRoom.areTowersHistoryOperational = true

                auxSum += h.rangedPower //That is the name of attribute in class - keeping this name to make it easy to use 
                //with other history data (about creeps)
                auxCounter++;
            }
        }

        attackRoom.meanOperationalTowersAmount = auxSum / auxCounter

    }

    //Decisions based on towers history
    if (attackRoom.attackType != undefined) {
        if (attackRoom.areTowersHistoryOperational == true) {
            attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] = true

            attackRoom.reqDrainers = attackRoom.meanOperationalTowersAmount
        }

        if (attackRoom.areTowersHistoryOperational == false) {
            attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] = false
        }

        //Decisions based on defender creeps history
        if (attackRoom.areDefendersPresent == true) {
            attackRoom.attackType[C.ATTACK_TYPE_QUAD] = true
        }

        if (attackRoom.areDefendersPresent == false) {
            attackRoom.attackType[C.ATTACK_TYPE_QUAD] = false
        }

        // decisions based on both
        if (attackRoom.areDefendersPresent == false &&
            attackRoom.areTowersHistoryOperational == false
        ) {
            attackRoom.attackType[C.ATTACK_TYPE_DISMANTLE] = true
            attackRoom.attackType[C.ATTACK_TYPE_PLUNDER] = true
        }
        else {
            attackRoom.attackType[C.ATTACK_TYPE_DISMANTLE] = false
            attackRoom.attackType[C.ATTACK_TYPE_PLUNDER] = false
        }


        if (attackRoom.controller.safeMode != undefined) {
            return;
        }


        //Adding requests to rooms

        //Adding quads
        if (attackRoom.attackType[C.ATTACK_TYPE_QUAD] == true) {
            // for now keep two quads
            attackRoom.reqQuads = 2


            if (attackRoom.quads.length < attackRoom.reqQuads) {
                for (m of Memory.mainRooms) {
                    var maxBodyParts = CREEP_LIFE_TIME / CREEP_SPAWN_TIME
                    if (Memory.rooms[m].spawn2Id != undefined) {
                        maxBodyParts += CREEP_LIFE_TIME / CREEP_SPAWN_TIME
                    }
                    if (Memory.rooms[m].spawn3Id != undefined) {
                        maxBodyParts += CREEP_LIFE_TIME / CREEP_SPAWN_TIME
                    }

                    if (maxBodyParts - global.heap.rooms[m].creepsBodyParts > QUAD_BODY_PARTS_AMOUNT) {
                        //add quad with spawning set to room m
                        r.quads.push(new Quad(m + "_" + Game.time, this.name, m))


                    }
                }
            }
            else if (attackRoom.quads.length > attackRoom.reqQuads) {
                attackRoom.quads.shift()
            }


            for (q of attackRoom.quads) {
                if (q.isCompleted == false) {

                    if (q.members.length = 0) {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.Id, C.QUAD_MEMBER, C.RANGED_BODY, true))

                    }
                    else if (q.members.length = 1) {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.Id, C.QUAD_MEMBER, C.RANGED_BODY, false))
                    }
                    else {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.Id, C.QUAD_MEMBER, C.HEALER_BODY, false))
                    }

                }
            }
        }

        if (attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] == true) {
            if (attackRoom.drainersId.length < attackRoom.reqDrainers) {
                //
            }
        }

    }





}
module.exports = attackManager