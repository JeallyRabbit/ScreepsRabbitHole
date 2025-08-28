const C = require('constants');


class Quad{
    constructor(quadId,targetRoom, homeRoom)
    {
        this.id=quadId;
        this.targetRoom=targetRoom;
        this.homeRoom=homeRoom
        this.minEnergyOnCreep=-1;
        this.members=[];
    }
}

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

        //Calculate how many towers are operational on average
        var auxSum=0;
        var auxCounter=0
        for (h of global.heap.rooms[room.name].areTowersOperationalHistory) {
            if(h.areOperational)
            {
                global.heap.rooms[room.name].areTowersHistoryOperational=true
                
                auxSum+=h.rangedPower //That is the name of attribute in class - keeping this name to make it easy to use 
                //with other history data (about creeps)
                auxCounter++;
            }
        }

        global.heap.rooms[room.name].meanOperationalTowersAmount=auxSum/auxCounter

        //Decisions based on towers history
        if(global.heap.rooms[room.name].areTowersHistoryOperational==true)
        {
            global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_ENERGY_DRAIN]=true

            global.heap.rooms[room.name].reqDrainers=global.heap.rooms[room.name].meanOperationalTowersAmount
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


        

        //Adding requests to rooms

        //Adding quads
        if(global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_QUAD]==true)
        {
            // for now keep two quads
            global.heap.rooms[room.name].reqQuads=2

            if(global.heap.rooms[room.name].quads.length<global.heap.rooms[room.name].reqQuads)
            {
                for(m of Memory.mainRooms)
                {
                    var maxBodyParts=CREEP_LIFE_TIME/CREEP_SPAWN_TIME
                    if(Memory.rooms[m].spawn2Id!=undefined)
                    {
                        maxBodyParts+=CREEP_LIFE_TIME/CREEP_SPAWN_TIME
                    }
                    if(Memory.rooms[m].spawn3Id!=undefined)
                    {
                        maxBodyParts+=CREEP_LIFE_TIME/CREEP_SPAWN_TIME
                    }

                    if(maxBodyParts-global.heap.rooms[m].creepsBodyParts>QUAD_BODY_PARTS_AMOUNT)
                    {
                        //add quad with spawning set to room m
                        global.heap.rooms[room.name].quads.push(new Quad(m+"_"+Game.time,this.name,m))
                    }
                }
            }


            for(q of global.heap.rooms[room.name].quads)
            {
                //Here add checking if quad is dead/needs to be spawnbed
                //and operateQuad(q)
            }
        }

        if(global.heap.rooms[room.name].attackType[C.ATTACK_TYPE_ENERGY_DRAIN]==true)
        {
            if(global.heap.rooms[room.name].drainersId.length<global.heap.rooms[room.name].reqDrainers)
            {
                //
            }
        }
    }
}
module.exports=attackManager