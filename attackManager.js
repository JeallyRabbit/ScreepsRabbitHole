const C = require('constants');

class attackHistoryData {
    constructor(areOperational, time,rangedPower=0,meleePower=0) {
        this.areOperational = areOperational
        this.time = time
        this.rangedAttackPower=rangedPower;
        this.meleeAtackPower=meleePower
    }
}


function attackManager(room)
{
    console.log("AttackManager")



    // TODO:
    // 1. move that (code below) to attackManager
    // 2. attackManager should decide who (which room) would spawn which creep
    // 3. attackManager should how many nuke should be launched and by which room
    // for attacking mechanic - gathering data
    if (Memory.roomsToAttack.includes(room.name)) {

        // Array to store history of towers availability
        if (global.heap.rooms[room.name].areTowersOperationalHistory == undefined) {
            global.heap.rooms[room.name].areTowersOperationalHistory = []
        }

        if(global.heap.rooms[room.name].areDefendersPresentHistory==undefined)
        {
            global.heap.rooms[room.name].areDefendersPresentHistory = []
        }

        if(global.heap.rooms[room.name].operationalTowersAmountHistory==undefined)
        {
            global.heap.rooms[room.name].operationalTowersAmountHistory=[]
        }



        global.heap.rooms[room.name].areDefendersPresent=false;


        // boolean to agregate results of history into one value
        global.heap.rooms[room.name].areTowersHistoryOperational=false

        // boolean to agregate status of all towers in single tick (gets status of one tick)
        global.heap.rooms[room.name].areTowersOperational = true

        global.heap.rooms[room.name].towers = []
        global.heap.rooms[room.name].ramparts = []
        global.heap.rooms[room.name].walls = []

        str = this.find(FIND_STRUCTURES)
        var anyOperational = false
        var operationalTowersAmount=0;
        for (s of str) {

            if (s.structureType == STRUCTURE_TOWER) {

                //tracking if towers are refilled/operational/can shoot
                global.heap.rooms[room.name].towers.push(s)
                if (s.store[RESOURCE_ENERGY] > 0) {
                    anyOperational = true
                }
                operationalTowersAmount++;
            }
            else if(s.structureType==STRUCTURE_RAMPART)
            {
                global.heap.rooms.ramparts.push(s)
            }
            else if(s.structureType==STRUCTURE_WALL)
            {
                global.heap.rooms[room.name].walls.push(s)
            }

        }

        if(global.heap.rooms[room.name].hostileAttackPower>0 || global.heap.rooms[room.name].hostileRangedAttackPower>0)
        {
            global.heap.rooms[room.name].areDefendersPresentHistory.push(new attackHistoryData(true,Game.time,
                 global.heap.rooms[room.name].hostileRangedAttackPower, global.heap.rooms[room.name].hostileAttackPower
            ))
        }
        else{
            global.heap.rooms[room.name].areDefendersPresentHistory.push(new attackHistoryData(false,Game.time))

        }
        var historyLength = global.heap.rooms[room.name].areTowersOperationalHistory.length
        global.heap.rooms[room.name].areTowersOperationalHistory.push(new attackHistoryData(anyOperational,Game.time,operationalTowersAmount))

        //limiting towers history length
        if (global.heap.rooms[room.name].areTowersOperationalHistory[historyLength - 1].time - global.heap.rooms[room.name].areTowersOperationalHistory[0].time > C.ROOM_ATTACK_HISTORY_RANGE) {
            global.heap.rooms[room.name].areTowersOperationalHistory.shift()
        }

        //limiting creeps history length
        if (global.heap.rooms[room.name].areDefendersPresentHistory[historyLength - 1].time - global.heap.rooms[room.name].areDefendersPresentHistory[0].time > C.ROOM_ATTACK_HISTORY_RANGE) {
            global.heap.rooms[room.name].areDefendersPresentHistory.shift()
        }

        //Defender creeps (attack,rangedAttack) history
        for (h of global.heap.rooms[room.name].areDefendersPresentHistory) {
            if(h.areOperational)
            {
                global.heap.rooms[room.name].areDefendersPresent=true
                break;
            }
        }


        //Towers History
        for (h of global.heap.rooms[room.name].areTowersOperationalHistory) {
            if(h.areOperational)
            {
                global.heap.rooms[room.name].areTowersHistoryOperational=true
                break;
            }
        }

        //Decisions based on towers history
        if(global.heap.rooms[room.name].areTowersHistoryOperational==true)
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_ENERGY_DRAIN]=true

        }

        if(global.heap.rooms[room.name].areTowersHistoryOperational==false)
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_ENERGY_DRAIN]=false
        }

        //Decisions based on defender creeps history
        if(global.heap.rooms[room.name].areDefendersPresent==true)
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_QUAD]=true
        }

        if(global.heap.rooms[room.name].areDefendersPresent==false)
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_QUAD]=false
        }
        
        // decisions based on both
        if(global.heap.rooms[room.name].areDefendersPresent==false && 
            global.heap.rooms[room.name].areTowersHistoryOperational==false
        )
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_DISMANTLE]=true
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_PLUNDER]=true
        }
        else{
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_DISMANTLE]=false
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_PLUNDER]=false
        }



    }
}
module.exports=attackManager