// Every constant definied in separate file
const C = require('constants');
const buildRoom = require('buildRoom');
const operateTowers = require('operateTowers')
const roomReaction = require('roomReaction')

class Variation {
    constructor(variationName, variationFinished, rampartsAmount, spawnPos) {
        this.variationName = variationName
        this.variationFinished = variationFinished;
        this.rampartsAmount = rampartsAmount;
        this.spawnPos = spawnPos;
    }
}



Room.prototype.roomManager = function roomManager() {



    global.heap.rooms[this.name].myCreeps = []
    global.heap.rooms[this.name].hostiles = []
    global.heap.rooms[this.name].hostileHealPower = 0;
    global.heap.rooms[this.name].hostileAttackPower = 0;
    global.heap.rooms[this.name].hostileRangedAttackPower = 0;
    global.heap.rooms[this.name].hostileStructures = []
    global.heap.rooms[this.name].allies = []
    global.heap.rooms[this.name].myWorkers = [];
    global.heap.rooms[this.name].myHealPower = 0;
    global.heap.rooms[this.name].myAttackPower = 0;
    global.heap.rooms[this.name].myRangedAttackPower = 0;
    global.heap.rooms[this.name].damagedStructuresId = []
    global.heap.rooms[this.name].containersId = []
    global.heap.rooms[this.name].construction = []

    if (global.heap.rooms[this.name].repairerId != undefined && Game.getObjectById(global.heap.rooms[this.name].repairerId) == null) {
        global.heap.rooms[this.name].repairerId = undefined
    }







    var myCreeps = this.find(FIND_MY_CREEPS)

    for (cr of myCreeps) {
        if (cr.memory.role == C.ROLE_WORKER) {
            global.heap.rooms[this.name].myWorkers.push(cr.id)
        }
        global.heap.rooms[this.name].myCreeps.push(cr.id)
    }





    if (Memory.mainRooms.includes(this.name)) {
        //If it is one of main rooms 


        // Resetting roomsToScan after 2nd and 3rd spawns are build
        if(Game.time&2341==0 || true)
        {
            if(this.controller.level>=7)
            {
                var sp = this.find(FIND_MY_SPAWNS)
                if(sp.length>1 && this.memory.rcl7RoomsReset!=true)
                {
                    this.memory.roomsToScan=undefined
                    this.memory.rcl7RoomsReset=true
                }

                if(sp.length>2 && this.memory.rcl8RoomsReset!=true)
                {
                    this.memory.roomsToScan=undefined
                    this.memory.rcl8RoomsReset=true
                }
            }
        }
        


        if (Memory.rooms != undefined && Memory.rooms[this.name] != undefined && Memory.rooms[this.name].quads == undefined) {
            Memory.rooms[this.name].quads = []
        }

        if (this.memory.distanceToOthers == undefined && Game.time % C.ROOM_DISTANCE_CALC_STEP == 0) {
            var distance = 0;
            var distanceCounter = 0
            for (m of Memory.mainRooms) {
                if (m != this.name) {
                    distance += Game.map.getRoomLinearDistance(this.name, m)
                    distanceCounter++;
                }
            }
            this.memory.distanceToOthers = distance / distanceCounter;
        }



        //spawnID
        if ((this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) == null) || this.memory.spawnId == undefined) {
            var sp = this.find(FIND_MY_SPAWNS)
            if (sp.length > 0) {
                this.memory.spawnId = sp[0].id
            }
        }



        //second spawn ID
        if ((this.memory.spawn2Id != undefined && Game.getObjectById(this.memory.spawn2Id) == null) || this.memory.spawn2Id == undefined) {
            var sp = this.find(FIND_MY_SPAWNS, {
                filter:
                    function (str) {
                        return str.name.endsWith("_2")
                    }
            })
            if (sp.length > 0) {
                this.memory.spawn2Id = sp[0].id
            }
        }

        //Third spawnID
        if ((this.memory.spawn3Id != undefined && Game.getObjectById(this.memory.spawn3Id) == null) || this.memory.spawn3Id == undefined) {
            var sp = this.find(FIND_MY_SPAWNS, {
                filter:
                    function (str) {
                        return str.name.endsWith("_3")
                    }
            })
            if (sp.length > 0) {
                this.memory.spawn3Id = sp[0].id
            }
        }

        //Mineral
        if (this.memory.mineralId == undefined) {
            var mineral = this.find(FIND_MINERALS)
            if (mineral.length > 0) {
                this.memory.mineralId = mineral[0].id
                this.memory.mineralOpenPositions = mineral[0].pos.getOpenPositions2()
            }
        }



        //Extractor
        var extractor = this.find(FIND_MY_STRUCTURES, {
            filter:
                function (str) {
                    return str.structureType == STRUCTURE_EXTRACTOR
                }
        })
        if (extractor.length > 0) {
            this.memory.extractorId = extractor[0].id
        }


        if (Memory.roomsToColonize.some(e => e.name == this.name) && this.controller.level > 1 && this.memory.spawnId != undefined) {
            //Room is finished being colonizer
            if (Memory.manualColonize = this.name) {
                Memory.manualColonize = '??'
            }

            //Remove that roomName from array
            var index = Memory.roomsToColonize.find((r) => r.name == this.name);
            if (index != undefined) {
                Memory.roomsToColonize.splice(index, 1);
            }
            delete global.heap.rooms[this.name].claimer
        }


        //Tracking creeps
        global.heap.rooms[this.name].rampartRepairersPower = 0;


        //Tracking structures
        this.memory.state = []
        this.memory.myStructures = []

        global.heap.rooms[this.name].myExtensions = []
        global.heap.rooms[this.name].myLabs = []
        global.heap.rooms[this.name].outLabsId = []
        global.heap.rooms[this.name].myTowersId = []
        global.heap.rooms[this.name].towersNeedRefill = false
        global.heap.rooms[this.name].myRamparts = []
        global.heap.rooms[this.name].myNuker = undefined
        global.heap.rooms[this.name].myLinks = []
        global.heap.rooms[this.name].myFactory = undefined
        global.heap.rooms[this.name].myExtractor = undefined
        global.heap.rooms[this.name].myObserver = undefined
        global.heap.rooms[this.name].myStorage = {}


        for (res in C.RESOURCES) {
            global.heap.rooms[this.name].myStorage[C.RESOURCES[res]] = 0
        }


        if (this.storage != undefined) {
            for (res in this.storage.store) {
                global.heap.rooms[this.name].myStorage[res] += this.storage.store[res]
            }
        }

        if (this.terminal != undefined) {
            for (res in this.terminal.store) {
                global.heap.rooms[this.name].myStorage[res] += this.terminal.store[res]
            }
        }


        //adding doctor store ton myStorage - my Storage is used to determine reaction to run
        var doctor = Game.getObjectById(global.heap.rooms[this.name].doctorId)
        if (doctor != null) {
            for (res in doctor.store) {
                global.heap.rooms[this.name].myStorage[res] += doctor.store[res]
            }
        }

        var inputLab1 = Game.getObjectById(Game.rooms[this.name].memory.inLab1Id)
        if (inputLab1 != null) {
            for (res in inputLab1.store) {
                global.heap.rooms[this.name].myStorage[res] += inputLab1.store[res]
            }
        }

        var inputLab2 = Game.getObjectById(Game.rooms[this.name].memory.inLab2Id)
        if (inputLab2 != null) {
            for (res in inputLab2.store) {
                global.heap.rooms[this.name].myStorage[res] += inputLab2.store[res]
            }
        }


        //adding input labs to myStorage

        global.heap.rooms[this.name].state = []
        global.heap.rooms[this.name].needRawResources = []
        global.heap.rooms[this.name].excessRawResources = []
        global.heap.rooms[this.name].needT3EconomicBoosts = []
        global.heap.rooms[this.name].excessT3EconomicBoost = []
        global.heap.rooms[this.name].needT3MilitaryBoosts = []
        global.heap.rooms[this.name].excessT3MilitaryBoosts = []
        if (global.heap.rooms[this.name].boostingRequests == undefined) {
            global.heap.rooms[this.name].boostingRequests = []
        }



        if (this.memory.energyBalance == undefined && (this.storage == undefined
            || this.controller.level < 4)
        ) {
            this.memory.energyBalance = 0.0;
        }
        if (this.memory.energyBalance != undefined) {
            if (this.storage != undefined && this.controller.level >= 4) {
                delete this.memory.energyBalance
            }
            else {
                if (this.memory.energyBalance < -C.BALANCER_HARVEST_LIMIT) {
                    this.memory.energyBalance = -C.BALANCER_HARVEST_LIMIT;
                }
                else if (this.memory.energyBalance > C.BALANCER_USE_LIMIT) {
                    this.memory.energyBalance = C.BALANCER_USE_LIMIT
                }
                if (this.memory.energyBalance > 0 /* &&  this.memory.energyBalance < C.BALANCER_HARVEST_LIMIT */) {
                    this.memory.energyBalance -= C.BALANCER_DECAY
                }
                else if (this.memory.energyBalance < 0 /* &&  this.memory.energyBalance > C.BALANCER_USE_LIMIT*/) {
                    this.memory.energyBalance += C.BALANCER_DECAY
                }
            }

        }

        if (this.memory.harvestingSources == undefined) {
            this.memory.harvestingSources = []
        }
        else if (this.memory.harvestingSources.length > 0) {

            this.memory.harvestingRooms = []

            this.memory.harvestingSources.sort((a, b) => a.bodyPartsCost - b.bodyPartsCost)

            var sourcesAmount = 0;
            var bodyPartsSum = 0
            var counter = 0;
            var spawnNum=this.find(FIND_MY_SPAWNS).length
            for (s of this.memory.harvestingSources) {

                if (this.memory.harvestingRooms.findIndex(room => room.name == s.roomName) == -1) {
                    this.memory.harvestingRooms.push({ name: s.roomName, repairerId: undefined })
                }
                bodyPartsSum += s.bodyPartsCost
                counter++;
                if (bodyPartsSum >= ((CREEP_LIFE_TIME / CREEP_SPAWN_TIME)*spawnNum) * C.HARVESTING_BODYPARTS_FRACTION) {
                    break;
                }
            }

            if (this.memory.harvestingRooms != undefined) {
                for (hr of this.memory.harvestingRooms) {
                    if (hr.repairerId != undefined && Game.getObjectById(hr.repairerId) == null) {
                        hr.repairerId = undefined
                    }
                }
            }

            if (this.memory.isMinimalRoom == true) {//limiting some rooms to only 2 sources - those should be perfect rooms for attacks
                counter = 2;
            }

            while (this.memory.harvestingSources.length > counter) {
                this.memory.harvestingSources.pop()
            }

            for (s of this.memory.harvestingSources) {
                s.harvestingPower = 0;
                s.carryPower = 0;
                s.harvesters = 0;
            }

        }




        if (this.memory.keepersSources == undefined) {
            this.memory.keepersSources = []
        }

        if (this.memory.keepersRooms == undefined) {
            this.memory.keepersRooms = []
        }

        if (this.memory.forcedUpgrades == undefined) {
            this.memory.forcedUpgrades = [0, 0, 0, 0, 0, 0, 0, 0]
        }

        global.heap.rooms[this.name].workersParts = 0;


        this.memory.progressOld = this.memory.progress;
        this.memory.progress = this.controller.progress;
        if (this.memory.progressOld != 0) {
            this.memory.progressSum += (this.memory.progress - this.memory.progressOld);
        }
        else { this.memory.progressSum = (this.memory.progress - this.memory.progressOld); }
        this.memory.progressCounter += 1;


        ////// START OF BUILDING ROOM MESS

        if (global.heap.isSomeRoomPlanning == false) {

            // console.log("Room: ", this.name, " entered building/planning base")
            //this.visualizeBase() // debugging
            // assuring that only one room in a tick would go into room building
            if (this.memory.finishedPlanning != true) {
                console.log("Room: ", this.name, " is planning layout")
                global.heap.isSomeRoomPlanning = true;

                if (this.memory.baseVariations == undefined) {
                    this.memory.baseVariations = {}
                    this.memory.baseVariations[C.CONTROLLER] = {}
                    this.memory.baseVariations[C.CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.CONTROLLER].spawnPos = undefined
                    /*
                    this.memory.baseVariations[C.SRC_1] = {}
                    this.memory.baseVariations[C.SRC_1].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_2] = {}
                    this.memory.baseVariations[C.SRC_2].variationFinished = false;
                    this.memory.baseVariations[C.SRC_2].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_2].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_1_2] = {}
                    this.memory.baseVariations[C.SRC_1_2].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_2].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_2].spawnPos = undefined
                    
                    this.memory.baseVariations[C.SRC_1_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_CONTROLLER].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_2_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_2_CONTROLLER].spawnPos = undefined
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER] = {}
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].variationFinished = false;
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].rampartsAmount = 0;
                    this.memory.baseVariations[C.SRC_1_2_CONTROLLER].spawnPos = undefined
                    */

                    //if there is spawn in room use only one variation
                    if (this.memory.spawnId != undefined && Game.getObjectById(this.memory.spawnId) != null) {
                        this.memory.baseVariations = {}
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS] = {}
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS].variationFinished = false;
                        this.memory.baseVariations[C.CURRENT_SPAWNPOS].rampartsAmount = 0;
                    }


                    this.memory.finalRoomPlan = undefined
                    this.memory.finalBuildingList = []
                    this.memory.minRampartsAmount = 999999
                    this.memory.finishedPlanning = false

                }
                else {

                    // loop through room variations
                    var finishedCounter = 0;



                    for (key in this.memory.baseVariations) {

                        if (this.memory.baseVariations[key].variationFinished == false) {
                            this.visual.text(key, 25, 4)
                            if (Game.cpu.bucket > 200) {
                                this.buildRoom(key)
                            }

                            break;
                        }
                        this.memory.finishedPlanning = true
                        finishedCounter++;
                    }

                }
            }
            else {

                //final room plan will be in this.memory.finalRoomPlan
                if (this.memory.roomPlan != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.roomPlan
                }
                //final building list wil be in this.memory.finalBuildingList
                if (this.memory.buildingList != undefined && this.memory.plannedRoads == true) {
                    //delete this.memory.buildingList
                }
                if (this.memory.variationToBuild == undefined) {
                    this.memory.finishedPlanning = undefined
                }
                if (Game.time % 5 == 0 || true) {
                    //console.log("room: ",this.name," is building from list")
                    //debugging condition
                    if (this.controller.level != 8) {
                        this.buildRoom(this.memory.variationToBuild)
                    }

                    //global.heap.isSomeRoomPlanning = true
                }
            }

        }

        //minerals sharing
        var rawResources = ["H", "O", "U", "L", "K", "Z", "X"]//140k total
        var T3EconomicBoosts = ["XUHO2", "XKH2O", "XLH2O", "XGH2O"]
        var T3MilitaryBoosts = ["XUH2O", "XKHO2", "XLHO2", "XZH2O", "XZHO2", "XGHO2"]
        if (this.terminal != undefined && this.storage != undefined) {
            for (res of rawResources) {
                if (this.terminal.store[res] + this.storage.store[res] < C.MIN_RAW_RESOURCE_AMOUNT) {
                    global.heap.rooms[this.name].needRawResources.push(res)
                }
                else if (this.terminal.store[res] + this.storage.store[res] > C.MAX_RAW_RESOURCE_AMOUNT) {
                    global.heap.rooms[this.name].excessRawResources.push(res)
                }
            }
            for (boost of T3EconomicBoosts) {
                if (this.terminal.store[boost] + this.storage.store[boost] < C.MIN_ECONOMIC_BOOST_AMOUNT) {
                    global.heap.rooms[this.name].needT3EconomicBoosts.push(boost)
                }
                else if (this.terminal.store[boost] + this.storage.store[boost] > C.MIN_ECONOMIC_BOOST_AMOUNT * 2) {
                    global.heap.rooms[this.name].excessT3EconomicBoost.push(boost)
                }
            }
            for (boost of T3MilitaryBoosts) {
                if (this.terminal.store[boost] + this.storage.store[boost] < C.MIN_MILITARY_BOOST_AMOUNT) {
                    global.heap.rooms[this.name].needT3MilitaryBoosts.push(boost)
                }
                else if (this.terminal.store[boost] + this.storage.store[boost] > C.MIN_MILITARY_BOOST_AMOUNT * 2) {
                    global.heap.rooms[this.name].excessT3MilitaryBoosts.push(boost)
                }
            }
        }

        //Define what reacion should labs run
        if (global.heap.rooms[this.name].reaction != undefined) {
            var res1 = global.heap.rooms[this.name].reaction[0]
            var res2 = global.heap.rooms[this.name].reaction[1]
            if (this.storage != undefined && this.storage.store[REACTIONS[res1][res2]] > C.REACTION_STEP) {
                global.heap.rooms[this.name].reaction = undefined
            }
        }
        if (global.heap.rooms[this.name].reaction == undefined) {
            global.heap.rooms[this.name].reaction = this.roomReaction()
        }





    }

    //creating Spawn construction site
    if (this.memory.spawnId == undefined && this.memory.finalBuildingList != undefined && this.memory.finalBuildingList.length > 0) {
        for (f of this.memory.finalBuildingList) {
            if (f.structureType == STRUCTURE_SPAWN) {
                this.createConstructionSite(f.x, f.y, f.structureType, f.roomName + "_1")
                break;
            }
        }
    }


    this.memory.roads = []

    //finding construction sites
    var constr = this.find(FIND_CONSTRUCTION_SITES)


    if (constr.length > 0) {


        global.heap.rooms[this.name].building = true
        for (c of constr) {
            global.heap.rooms[this.name].construction.push(c.id)
        }
    }
    else {
        if (global.heap.rooms[this.name].building != undefined) {
            delete global.heap.rooms[this.name].building
        }
    }



    var needEnergyForBuilding = false;
    // Adding state need energy if room is building and have little resources
    if (global.heap.rooms[this.name].building == true && (this.storage != undefined && this.terminal != undefined
        && this.storage.store[RESOURCE_ENERGY] + this.terminal.store[RESOURCE_ENERGY] < C.STORAGE_ENERGY_BOTTOM
    )) {
        needEnergyForBuilding = true;

    }


    // adding state need energy if 
    var needEnergyforOffense = false
    if (global.heap.rooms[this.name].offensiveQueue != undefined && global.heap.rooms[this.name].offensiveQueue.length > 0) {
        needEnergyforOffense = true
    }

    if (needEnergyForBuilding || needEnergyforOffense) {
        if (global.heap.rooms[this.name].state != undefined && !global.heap.rooms[this.name].state.includes(C.STATE_NEED_ENERGY)) {
            global.heap.rooms[this.name].state.push(C.STATE_NEED_ENERGY)
        }
    }
    else {
        //removing state if not building or enough resources
        if (global.heap.rooms[this.name].state != undefined && global.heap.rooms[this.name].state.includes(C.STATE_NEED_ENERGY)) {
            var index = global.heap.rooms[this.name].state.indexOf(C.STATE_NEED_ENERGY)
            if (index != -1) {
                global.heap.rooms[this.name].state.splice(index, -1)
            }
        }
    }





    //Finding hostile Creeps
    var hostiles = this.find(FIND_HOSTILE_CREEPS, {
        filter:
            function (enemy) {
                return Memory.allies.includes(enemy.owner.username) == false
            }
    })

    if (hostiles.length > 0) {
        console.log("Adding hostiles in ", this.name)
        for (a of hostiles) {
            global.heap.rooms[this.name].hostiles.push(a)
            global.heap.rooms[this.name].hostileHealPower += _.filter(a.body, { type: HEAL }).length * HEAL_POWER
            global.heap.rooms[this.name].hostileAttackPower += _.filter(a.body, { type: ATTACK }).length * ATTACK_POWER
            global.heap.rooms[this.name].hostileRangedAttackPower += _.filter(a.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER
        }
    }

    //Finding hostileStructures
    global.heap.rooms[this.name].hostileStructures = this.find(FIND_HOSTILE_STRUCTURES, {
        filter: function (structure) {
            //return structure.my==false && 
            return structure.structureType != STRUCTURE_CONTROLLER
                && structure.structureType != STRUCTURE_CONTAINER
                && structure.structureType != STRUCTURE_ROAD
                && !Memory.allies.includes(structure.owner.name)
        }
    });

    //Finding allied Creeps
    var allies = this.find(FIND_HOSTILE_CREEPS, {
        filter:
            function (ally) {
                return Memory.allies.includes(ally.owner.username)
            }
    })

    if (allies.length > 0) {
        for (a of allies) {
            global.heap.rooms[this.name].allies.push(a.id)
        }
    }


    //Finding structures - single Room.Find then filtering and saving id to heap
    var structures = this.find(FIND_STRUCTURES)
    for (str of structures) {

        const role = str.structureType

        if (role != STRUCTURE_RAMPART && role != STRUCTURE_WALL && str.hits < str.hitsMax) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }
        /*
        else if ((role == STRUCTURE_RAMPART || role == STRUCTURE_WALL) && str.hits < C.RAMPART_HITS_BOTTOM_LIMIT) {
            global.heap.rooms[this.name].damagedStructuresId.push(str.id)
        }
            */


        if (str.my && Memory.mainRooms.includes(this.name)) {
            this.memory.myStructures.push(str.id)

            switch (role) {

                case STRUCTURE_EXTENSION:
                    global.heap.rooms[this.name].myExtensions.push(str.id);
                    break;
                case STRUCTURE_TOWER:
                    global.heap.rooms[this.name].myTowersId.push(str.id);
                    if (str.store[RESOURCE_ENERGY] < TOWER_CAPACITY * C.TOWER_BOTTOM_LIMIT) {
                        global.heap.rooms[this.name].towersNeedRefill = true
                    }
                    break;
                case STRUCTURE_LAB:
                    global.heap.rooms[this.name].myLabs.push(str.id);
                    if (this.memory.inputLab1Pos != undefined && str.pos.x == this.memory.inputLab1Pos.x && str.pos.y == this.memory.inputLab1Pos.y) {
                        global.heap.rooms[this.name].inLab1Id = str.id
                        if (Game.rooms[this.name].memory.inLab1Id == undefined) {
                            Game.rooms[this.name].memory.inLab1Id = str.id
                        }
                    }
                    else if (this.memory.inputLab2Pos != undefined && str.pos.x == this.memory.inputLab2Pos.x && str.pos.y == this.memory.inputLab2Pos.y) {
                        global.heap.rooms[this.name].inLab2Id = str.id
                        if (Game.rooms[this.name].memory.inLab2Id == undefined) {
                            Game.rooms[this.name].memory.inLab2Id = str.id
                        }
                    }
                    else if (this.memory.boostingLabPos != undefined && str.pos.x == this.memory.boostingLabPos.x && str.pos.y == this.memory.boostingLabPos.y) {
                        //boosting lab is also first output lab
                        global.heap.rooms[this.name].boostingLabId = str.id
                        if (Game.rooms[this.name].memory.boostingLabId == undefined) {
                            Game.rooms[this.name].memory.boostingLabId = str.id
                        }

                        global.heap.rooms[this.name].outLabsId.push(str.id)
                    }
                    else {
                        global.heap.rooms[this.name].outLabsId.push(str.id)
                    }



                    break;
                case STRUCTURE_EXTRACTOR:
                    global.heap.rooms[this.name].myExtractor = str.id;
                    break;
                case STRUCTURE_LINK:
                    global.heap.rooms[this.name].myLinks.push(str.id);
                    if (this.storage != undefined && str.pos.x == this.storage.pos.x - 2 && str.pos.y == this.storage.pos.y) {
                        global.heap.rooms[this.name].managerLinkId = str.id
                    }
                    break;
                case STRUCTURE_NUKER:
                    global.heap.rooms[this.name].myNuker = str.id
                    break;
                case STRUCTURE_FACTORY:
                    global.heap.rooms[this.name].myFactory = str.id
                    break;
                case STRUCTURE_OBSERVER:
                    global.heap.rooms[this.name].myObserver = str.id
                    break;
                case STRUCTURE_RAMPART:
                    global.heap.rooms[this.name].myRamparts.push(str.id)
                case STRUCTURE_SPAWN:
                    if (str.name != undefined && str.name.endsWith('1')) {
                        this.memory.spawnPos = str.pos
                    }
                    break;



            }


        }
        else if (str.owner != undefined && Memory.allies.includes(str.owner.username) && false) {
            // What allied structures we need to know ??
        }
        else {
            const role = str.structureType
            switch (role) {
                case STRUCTURE_CONTAINER:
                    global.heap.rooms[this.name].containersId.push(str.id)
                    //this.memory.containersId.push(str.id);
                    break;
                case STRUCTURE_ROAD:
                    this.memory.roads.push(str.id);
                    break;
            }

        }
    }







    if (Memory.mainRooms.includes(this.name))//again checking if room is main room
    {

        //calculating ramparts amount
        global.heap.rooms[this.name].rampartsAmount = global.heap.rooms[this.name].myRamparts.length

        global.heap.rooms[this.name].rampartsEnergyNeedPerTick = (global.heap.rooms[this.name].rampartsAmount * (RAMPART_DECAY_AMOUNT / REPAIR_POWER)) / RAMPART_DECAY_TIME

        if (global.heap.rooms[this.name].myRamparts.length > 0) {
            //global.heap.rooms[this.name].requiredRampartsRepairersPower = global.heap.rooms[this.name].rampartsEnergyNeedPerTick * C.RAMPARTS_REPAIRERS_FACTOR

            // The same formula as for workers but multiplied by 0.75 
            if (this.storage != undefined) {
                global.heap.rooms[this.name].requiredRampartsRepairersPower = (Math.pow((this.storage.store[RESOURCE_ENERGY] / C.UPGRADE_FACTOR_1), 2) / C.UPGRADE_FACTOR_2) * C.RAMPARTS_REPAIRERS_FACTOR

            }
            else {


                global.heap.rooms[this.name].requiredRampartsRepairersPower = Math.min(global.heap.rooms[this.name].requiredRampartsRepairersPower, global.heap.rooms[this.name].rampartsEnergyNeedPerTick)
            }
        }
        else {
            global.heap.rooms[this.name].requiredRampartsRepairersPower = 0
        }



        // Upgraders container
        if (this.memory.upgradersContainerId != undefined && Game.getObjectById(this.memory.upgradersContainerId) == null) {
            this.memory.upgradersContainerId = undefined
        }

        if (this.memory.upgradersContainerId == undefined) {
            if (this.memory.controllerContainerPos != undefined) {
                auxPos = this.memory.controllerContainerPos
                var cont = this.find(FIND_STRUCTURES, {
                    filter:
                        function (str) {
                            return str.structureType === STRUCTURE_CONTAINER && str.pos.x == auxPos.x
                                && str.pos.y == auxPos.y
                        }
                });
                if (cont.length > 0) {
                    this.memory.upgradersContainerId = cont[0].id
                }
            }
        }

        // Defining fillers containers
        var spawnPos = this.memory.spawnPos
        if (this.memory.fillerContainers == undefined && spawnPos != undefined) {
            var fillerContainers = this.find(FIND_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_CONTAINER &&
                        ((structure.pos.x == spawnPos.x + 2 && structure.pos.y == spawnPos.y - 2) ||
                            (structure.pos.x == spawnPos.x - 2 && structure.pos.y == spawnPos.y - 2));
                }
            });

            if (fillerContainers.length > 0) {
                this.memory.fillerContainers = [];
                for (let i = 0; i < fillerContainers.length; i++) {
                    this.memory.fillerContainers.push(fillerContainers[i].id)
                }
                if (this.storage != undefined && this.memory.fillerContainers.length > 1) {
                    var closerContainer = this.storage.pos.findClosestByPath(fillerContainers)
                    if (closerContainer.id != this.memory.fillerContainers[0]) {
                        var aux = this.memory.fillerContainers[0]
                        this.memory.fillerContainers[0] = this.memory.fillerContainers[1]
                        this.memory.fillerContainers[1] = aux;
                    }
                }
            }
        }

        this.operateTowers()





    }


}

