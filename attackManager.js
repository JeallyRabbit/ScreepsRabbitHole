
const C = require('constants');
const operateQuad = require('operateQuad')


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

class scoutRequest {
    constructor(targetRoom, role) {
        this.targetRoom = targetRoom
        this.role = role
    }
}

class generalRoomRequest {
    constructor(roomName, role) {
        this.roomName = roomName
        this.role = role;
    }
}

class quadMemberRequest {
    constructor(quadId, creepRole, bodyType, isFirstMember) {
        this.quadId = quadId
        this.role = creepRole
        this.bodyType = bodyType
        this.isFirstMember = isFirstMember
    }
}

function attackManager(attackRoom) {
    console.log()
    console.log("AttackManager")



    // TODO:
    // 1. Calculate How many bodyparts or spawnTimeTicks is needed to every attack role instance 

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

    if(attackRoom.drainersId==undefined)
    {
        attackRoom.drainersId=[]
    }
    else if(attackRoom.drainersId.length>0)
    {
        for(id of attackRoom.drainersId)
        if(Game.getObjectById(id)==null)
        {
             const index = attackRoom.drainersId.indexOf(id);
                if (index > -1) { // only splice array when item is found
                    attackRoom.drainersId.splice(index, 1); // 2nd parameter means remove one item only
                }
        }
    }

    if(attackRoom.scoutId!=undefined)
    {
        if(Game.getObjectById(attackRoom.scoutId)==null)
        {
            attackRoom.scoutId=undefined
        }
    }

    attackRoom.areDefendersPresent = true;


    // boolean to agregate results of history into one value
    attackRoom.areTowersHistoryOperational = false

    // boolean to agregate status of all towers in single tick (gets status of one tick)
    attackRoom.areTowersOperational = true

    attackRoom.towers = []
    attackRoom.ramparts = []
    attackRoom.walls = []

    if (Game.rooms[attackRoom.name] != undefined) {

        attackRoom.lastDataGatherTime = Game.time
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
                attackRoom.ramparts.push(s)
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

                auxSum += h.rangedAttackPower //That is the name of attribute in class - keeping this name to make it easy to use 
                //with other history data (about creeps)
                auxCounter++;
            }
        }

        attackRoom.meanOperationalTowersAmount = auxSum / auxCounter

        if (Game.rooms[attackRoom.name].controller.safeMode != undefined) {
            console.log("attacked Room: ", attackRoom.name, " is in safe mode")
            return;
        }

        //global.heap.rooms[attackRoom.name].rampartsCM=caluclateRampartsCosts(str,attackRoom.name)
        //global.heap.rooms[attackRoom.name].towersDamageCM=calculateTowersDamage(attackRoom.towers)
        //global.heap.rooms[attackRoom.name].hostilesCM=calculateHostileCreepsCost()

    }
    else {
        //we need vision on the room
        if (attackRoom.lastDataGatherTime != undefined && Game.time - attackRoom.lastDataGatherTime > C.MAX_ROOM_INVISIBILITY_TIME
            && attackRoom.scoutId==undefined
        ) {
            attackRoom.attackType[C.ATTACK_TYPE_SCOUT] = true
        }
    }

    //Decisions based on towers history
    if (attackRoom.attackType != undefined) {
        if (attackRoom.areTowersHistoryOperational == true) {
            attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] = true

            attackRoom.reqDrainers = (attackRoom.meanOperationalTowersAmount!=null)? attackRoom.meanOperationalTowersAmount:2
        }   
        if (attackRoom.areTowersHistoryOperational == false) {
            //turned of for debugging
            //attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] = false
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


        //Clearing data about dead quad members
        if (attackRoom.quads.length > 0) {
            for (q of attackRoom.quads) {
                if (q.members != undefined && q.members.length > 0) {
                    for (m of q.members) {
                        if (Game.getObjectById(m) == null) {

                            var index = q.members.indexOf(m)
                            q.members.splice(index, 1)
                        }
                    }
                }
                else {
                    q.members = []
                }

            }
        }



        //Adding requests to rooms

        //Adding quads
        if (attackRoom.attackType[C.ATTACK_TYPE_QUAD] == true) {
            // for now keep two quads
            quadAttack(attackRoom);
        }

        if (attackRoom.attackType[C.ATTACK_TYPE_SCOUT] == true) {
            if (attackRoom.scoutId == undefined) {
                //add request
                var minDistance = Infinity
                var minRoom = undefined
                for (m of global.heap.mainRooms) {
                    if (Game.map.getRoomLinearDistance(m, attackRoom.name) < minDistance) {
                        minDistance = Game.map.getRoomLinearDistance(m, attackRoom.name)
                        minRoom = m
                    }
                }
                if (minRoom != undefined && global.heap.rooms[minRoom].civilianQueue != undefined) {
                    console.log("need scout from: ",minRoom," to attackRoom: ",attackRoom.name)
                    if(global.heap.rooms[minRoom].civilianQueue==undefined)
                    {
                        global.heap.rooms[minRoom].civilianQueue=[]
                    }
                    if (global.heap.rooms[minRoom].civilianQueue.find(( {role} ) => role === C.ROLE_SCOUT) == undefined) {
                        global.heap.rooms[minRoom].civilianQueue.push(new scoutRequest(attackRoom.name, C.ROLE_SCOUT))
                    }

                }
            }
            else if (Game.getObjectById(attackRoom.scoutId) == null) {
                attackRoom.scoutId = undefined
            }
        }


        //ATTACK_TYPE_DRAIN
        if (attackRoom.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] == true) {
            
            if (attackRoom.drainersId.length < attackRoom.reqDrainers) {
                //
                var minDistance = Infinity
                var minRoom = undefined
                for (m of global.heap.mainRooms) {
                    if (Game.map.getRoomLinearDistance(m, attackRoom.name) < minDistance) {
                        minDistance = Game.map.getRoomLinearDistance(m, attackRoom.name)
                        minRoom = m
                    }
                }
                if (minRoom != undefined) {
                    console.log("Need ENERGY_DRAINER from ", minRoom)
                    if(global.heap.rooms[minRoom].offensiveQueue==undefined)
                    {
                        global.heap.rooms[minRoom].offensiveQueue=[]
                    }
                    if (global.heap.rooms[minRoom].offensiveQueue.find(({ role }) => role === C.ROLE_ENERGY_DRAINER)==undefined) {
                        global.heap.rooms[minRoom].offensiveQueue.push(new generalRoomRequest(attackRoom.name,C.ROLE_ENERGY_DRAINER));
                    }
                }

            }
        }





        var ifLog = false
        if (ifLog) {
            console.log("data about room to attack")
            if (attackRoom.attackType != undefined) {
                for (t in attackRoom.attackType) {
                    console.log(t, " ", attackRoom.attackType[t])
                }
            }

        }

    }





}


function quadAttack(attackRoom) {
    attackRoom.reqQuads = 2;


    if (attackRoom.quads.length < attackRoom.reqQuads) {
    }
    else if (attackRoom.quads.length > attackRoom.reqQuads) {
        attackRoom.quads.shift();
    }

    if (attackRoom.quads.length < attackRoom.reqQuads) {
        attackRoom.quads.push(new Quad(attackRoom.name + Game.time, attackRoom.name, undefined));
    }

    for (q of attackRoom.quads) {
        
        if (q.isCompleted != true) {

            if (q.homeRoom == undefined) {

                var distanceToTargetRoom = Infinity;
                var roomToSpawnQuad = undefined;
                for (m of global.heap.mainRooms) {
                    var maxBodyParts = CREEP_LIFE_TIME / CREEP_SPAWN_TIME;
                    if (Memory.rooms[m].spawn2Id != undefined) {
                        maxBodyParts += CREEP_LIFE_TIME / CREEP_SPAWN_TIME;
                    }
                    if (Memory.rooms[m].spawn3Id != undefined) {
                        maxBodyParts += CREEP_LIFE_TIME / CREEP_SPAWN_TIME;
                    }
                    if (maxBodyParts - Game.rooms[m].memory.creepsBodyParts > C.QUAD_BODY_PARTS_AMOUNT) {

                        quadsAmount=Game.rooms[m].memory.quads!=undefined ? Game.rooms[m].memory.quads.length : 0;
                        if (Game.map.getRoomLinearDistance(m, attackRoom.name)*(Math.pow(1.1,quadsAmount)) < distanceToTargetRoom
                            && Game.rooms[m].controller.level >= 7) {
                            distanceToTargetRoom = Game.map.getRoomLinearDistance(m, attackRoom.name);
                            roomToSpawnQuad = m;

                        }

                    }
                }
                if (roomToSpawnQuad != undefined) {
                    q.homeRoom = roomToSpawnQuad;
                }
            }

            if (q.homeRoom != undefined && global.heap.rooms[q.homeRoom].offensiveQueue != undefined ) {
                if (global.heap.rooms[q.homeRoom].offensiveQueue.find(({ role }) => role === C.ROLE_QUAD_MEMBER) == undefined
            && Game.time%2==0
        ) {
                    console.log("quad members: ",q.members.length)
                    if (q.members.length == 0) {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.id, C.ROLE_QUAD_MEMBER, C.RANGED_BODY, true));
                        console.log("adding first member of quad: ",q.id);
                        break;

                    }
                    else if (q.members.length == 1) {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.id, C.ROLE_QUAD_MEMBER, C.RANGED_BODY, false));
                         console.log("Adding second member")
                        break;
                       
                    }
                    else if (q.members.length == 2 || q.members.length == 3) {
                        global.heap.rooms[q.homeRoom].offensiveQueue.push(new quadMemberRequest(q.id, C.ROLE_QUAD_MEMBER, C.HEALER_BODY, false));
                        console.log("adding third/fourth member")
                        break;
                    }
                }

            }


        }
    }


    for (q of attackRoom.quads) {
        console.log("opearting quad: ",q.id)
        operateQuad(q);
        
    }
}

function calculateTowersDamage(quad, towers) {
    if (towers.length < 1) { return -1; }

    if (global.heap.rooms[quad.targetRoom].towersDamageCM == undefined) {
        const damageMatrix = new PathFinder.CostMatrix
        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                totalDamage = 0;
                for (t of towers) {
                    let distance = t.pos.getRangeTo(i, j)
                    let towerDamage = 0;
                    if (distance <= 5) { towerDamage = TOWER_POWER_ATTACK; }
                    else if (distance >= 20) { towerDamage = TOWER_POWER_ATTACK / 4; }
                    else {
                        const falloffPerUnit = (TOWER_POWER_ATTACK - TOWER_POWER_ATTACK / 4) / (20 - 5);
                        totalDamage = TOWER_POWER_ATTACK - falloffPerUnit * (distance - 5);
                        //towerDamage = ((TOWER_POWER_ATTACK - (TOWER_POWER_ATTACK / 4)) / (20 - 5)) * distance;
                    }
                    totalDamage += towerDamage;
                }
                tileCost = (totalDamage / (TOWER_POWER_ATTACK * towers.length)) * DAMAGE_MATRIX_FACTOR

                damageMatrix.set(i, j, tileCost)

            }
        }
        global.heap.rooms[quad.targetRoom].towersDamageCM = damageMatrix.serialize();
    }
    return 0;
}

function caluclateRampartsCosts(quad, structures) {

    // TODO or TO THINK OVER
    // instead of dividing by str.hitsMax, divide by biggest str.hits (biggest out of ramparts)
    // maxHits = str.hits of most fortified rampart
    // var tileCost = (str.hits / maxHits) * DAMAGE_MATRIX_FACTOR
    if (structures.length < 1) { return -1; }
    if (global.heap.rooms[quad.targetRoom].rampartsCM == undefined) {
        const rampartsMatrix = new PathFinder.CostMatrix

        var maxHits = 0
        for (s of structures) {
            str = Game.getObjectById(s)
            if (str == null) { continue }
            if (str.structureType == STRUCTURE_RAMPART || str.structureType == STRUCTURE_WALL) {

                if (str.hits > maxHits) {
                    maxHits = str.hits
                }

                //Game.rooms[quad.targetRoom].visual.rect(str.pos.x - 0.5, str.pos.y - 0.5, 1, 1, { fill: 'blue', opacity: tileCost })
                //Game.rooms[quad.targetRoom].visual.text(tileCost,i,j)
            }
        }

        for (s of structures) {
            str = Game.getObjectById(s)
            if (str == null) { continue }
            if (str.structureType == STRUCTURE_RAMPART || str.structureType == STRUCTURE_WALL) {
                var tileCost = 0.0
                tileCost = (str.hits / maxHits) * DAMAGE_MATRIX_FACTOR
                if (Memory.allies.includes(str.owner.username) || str.pos.roomName != quad.targetRoom) {
                    tileCost = 255
                }
                rampartsMatrix.set(str.pos.x, str.pos.y, tileCost)

                //might need debuggin:
                rampartsMatrix.set(str.pos.x + 1, str.pos.y, tileCost)
                rampartsMatrix.set(str.pos.x, str.pos.y + 1, tileCost)
                rampartsMatrix.set(str.pos.x + 1, str.pos.y + 1, tileCost)
                //////

            }
        }
        global.heap.rooms[quad.targetRoom].rampartsCM = rampartsMatrix.serialize();

    }
    return 0;
}

function calculateHostileCreepsCost(quad, hostiles) {
    if (hostiles.length < 1) { return -1; }
    if (global.heap.rooms[quad.targetRoom].hostilesCM == undefined || true) {
        const hostilesMatrix = new PathFinder.CostMatrix
        for (h of hostiles) {
            //TODO add counting boosted body parts
            var meleeAttack = getAttackPower(h.body)

            var rangedAttack = getRangedAttackPower(h.body)
            var maxAttack = 200 * ATTACK_POWER
            var maxRangedAttack = 200 * RANGED_ATTACK_POWER

            if (meleeAttack >= quad.minHp + quad.minHealPower)//quad member will het one shoted by enemy creep 
            {
                for (var i = h.pos.x - 2; i <= h.pos.x + 1; i++) {
                    for (var j = h.pos.y - 2; j <= h.pos.y + 1; j++) {
                        hostilesMatrix.set(i, j, 255)
                    }
                }

            }
            else if (meleeAttack > 0) {

                var tileCost = (meleeAttack / maxAttack) * DAMAGE_MATRIX_FACTOR

                // -2 in this loop because additional tile for quad
                for (var i = h.pos.x - 2; i <= h.pos.x + 1; i++) {
                    for (var j = h.pos.y - 2; j <= h.pos.y + 1; j++) {
                        var currentCost = hostilesMatrix.get(i, j)
                        hostilesMatrix.set(i, j, currentCost + tileCost)
                    }
                }

            }

            const RANGED_ATTACK_RANGE = 3
            if (rangedAttack >= quad.minHp + quad.minHealPower)//quad member will het one shoted by enemy creep (RANGED_ATTACK)
            {
                for (var i = h.pos.x - RANGED_ATTACK_RANGE; i <= h.pos.x + RANGED_ATTACK_RANGE; i++) {
                    for (var j = h.pos.y - RANGED_ATTACK_RANGE; j <= h.pos.y + RANGED_ATTACK_RANGE; j++) {
                        hostilesMatrix.set(i, j, 255)
                    }
                }

            }
            else if (rangedAttack > 0) {
                var tileCost = (rangedAttack / maxRangedAttack) * DAMAGE_MATRIX_FACTOR

                for (var i = h.pos.x - RANGED_ATTACK_RANGE; i <= h.pos.x + RANGED_ATTACK_RANGE; i++) {
                    for (var j = h.pos.y - RANGED_ATTACK_RANGE; j <= h.pos.y + RANGED_ATTACK_RANGE; j++) {
                        var currentCost = hostilesMatrix.get(i, j)
                        hostilesMatrix.set(i, j, Math.min(255, currentCost + tileCost))
                    }
                }
            }


        }
        global.heap.rooms[quad.targetRoom].hostilesCM = hostilesMatrix.serialize()
    }
}

module.exports = attackManager