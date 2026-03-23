//defining global heap
var heap = {}
global.heap = heap;

//clear all Memory
//RawMemory.set("{}")
// Every constant definied in separate file
const C = require('constants')



//Profiler to check what CPU usage is
const profiler = require('screeps-profiler');
const createRoomQueues = require('createRoomQueues')
const spawnManager = require('spawnManager')
const roomManager = require('roomManager')
const creepsManager = require('creepsManager')
const linkManager = require('linkManager')
const terminalManager = require('terminalManager')
const labsManager = require('labsManager')
const attackManager = require('attackManager')
const visualize = require('visualize');



Room.prototype.unclaim = function unclaim() {
  for (c in Game.constructionSites) {
    if (Game.getObjectById(c) != null && Game.getObjectById(c).room.name == this.name) {
      Game.getObjectById(c).remove()
    }
  }

  for (c in Game.creeps) {
    cr = Game.creeps[c]
    if (cr != null && (cr.memory.homeRoom == this.name || cr.memory.targetRoom == this.name)) {
      cr.suicide()
    }
  }

  for (c in Game.structures) {
    if (Game.getObjectById(c) != null && Game.getObjectById(c).room.name == this.name) {
      Game.getObjectById(c).destroy()
    }
  }
  this.controller.unclaim();
}
Room.prototype.removeConstructionSites = function removeConstructionSites() {
  for (constr in Game.constructionSites) {
    Game.constructionSites[constr].remove()
  }
}


Room.prototype.resetLayout = function resetLayout() {
  this.memory.finalRoomPlan = undefined
  this.memory.finalBuildingList = []
  this.memory.minRampartsAmount = 999999
  this.memory.finishedPlanning = false
}

class attackRoom {
  constructor(roomName) {

    this.attackType = {}
    this.attackType[C.ATTACK_TYPE_QUAD] = false
    this.attackType[C.ATTACK_TYPE_DUO] = false
    this.attackType[C.ATTACK_TYPE_SINGLE] = false
    this.attackType[C.ATTACK_TYPE_ENERGY_DRAIN] = false
    this.attackType[C.ATTACK_TYPE_DISMANTLE] = false
    this.attackType[C.ATTACK_TYPE_CONTROLLER_DOWNGRADE] = false
    this.attackType[C.ATTACK_TYPE_NUKE] = false
    this.attackType[C.ATTACK_TYPE_SCOUT] = false
    this.attackType[C.ATTACK_TYPE_PLUNDER] = false
    this.name = roomName
    this.reqQuads = 0
    this.quads = []

    this.reqDuos = 0
    this.duos = []

    this.reqSingles = 0
    this.singlesId = []

    this.reqDrainers = 0
    this.drainersId = []

    this.reqDismantlePower = 0
    this.dismantlePower = 0
    this.dismantlersId = []

    this.controllerAttackCreeps = 0

    this.reqNukes = 0
    this.nukes = []

    this.scoutId = undefined

    this.looters = []

  }
}

// this line monkey patches the global prototypes.
profiler.enable();
module.exports.loop = function () {
  profiler.wrap(function () {



    var totalStart = Game.cpu.getUsed()

    if (Game.time % 8911 == 0) {
      global.heap = {}
    }


    //Setting allies
    Memory.allies = ["JeallyRabbit", "Alphonzo", "insainmonkey", "Trepidimous", "csW", "Bleem"]

    //Setting enemies
    Memory.enemies = ["IronVengeance"]

    if (Game.shard.name == 'shard0' || Game.shard.name == 'shard1' || Game.shard.name == 'shard2') {
      if (Game.cpu.bucket == 10000) {
        Game.cpu.generatePixel();
      }
    }

    //Defining global.heap.rooms which is supposed to have identical structure as Memory.rooms but is available always on the same tick and is not using Memory limit
    //Heap size limit is much higher than Memory size limit - as mentioned somewhere on discord it is notable achivement to reach Heap size limit
    if (global.heap.rooms == undefined) {
      global.heap.rooms = []
      console.log("setting global heap")
    }

    if (global.heap.creeps == undefined) {
      global.heap.creeps = []
    }

    //vision requests (observer)
    if (global.heap.visionRequests == undefined) {
      global.heap.visionRequests = []
    }

    //automatic colonizing
    if (Memory.roomsToColonize == undefined) {
      Memory.roomsToColonize = []
    }

    //Manual colonizing
    if (Memory.manualColonize == undefined) {
      Memory.manualColonize = '??'
    }

    if (!Memory.roomsToColonize.some(e => e.name === Memory.manualColonize) && Memory.manualColonize != '??') {
      Memory.roomsToColonize.push({ name: Memory.manualColonize })
      global.heap.rooms[Memory.manualColonize] = {}

    }


    for (colonizeRoom of Memory.roomsToColonize) {
      if (global.heap.rooms[colonizeRoom.name] == undefined) {
        global.heap.rooms[colonizeRoom.name] = {}
      }

      global.heap.rooms[colonizeRoom.name].claimer = undefined
      global.heap.rooms[colonizeRoom.name].colonizers = []
      global.heap.rooms[colonizeRoom.name].maxColonizers = C.DEFAULT_COLONIZERS_AMOUNT // as we get vision on that room it will be definied in next step


      if (Game.rooms[colonizeRoom.name] != undefined) {//Room is being colonized

        global.heap.rooms[colonizeRoom.name].maxColonizers = 0;
        global.heap.rooms[colonizeRoom.name].colonizeSources = Game.rooms[colonizeRoom.name].find(FIND_SOURCES)
        for (s of global.heap.rooms[colonizeRoom.name].colonizeSources) {
          s.maxHarvesters = s.pos.getOpenPositions().length;
          global.heap.rooms[colonizeRoom.name].maxColonizers += s.maxHarvesters;
          s.harvesters = [];
        }

      }

    }



    Memory.mainRooms = []
    global.heap.isSomeRoomPlanning = false;


    for (roomName in Game.rooms) {

      if (global.heap.rooms[roomName] == undefined) {
        global.heap.rooms[roomName] = {}
      }

      if (Game.rooms[roomName].controller != undefined && Game.rooms[roomName].controller.my
        && Game.rooms[roomName].find(FIND_MY_SPAWNS).length>0
      ) {
        Memory.mainRooms.push(roomName)
      }

      Game.rooms[roomName].roomManager()
    }


    if (Memory.roomsToAttack == undefined) {
      Memory.roomsToAttack = []
    }

    if (Memory.manualAttack == undefined) {
      Memory.manualAttack = '??'
    }

    if (!Memory.roomsToAttack.some(e => e.name === Memory.manualAttack) && Memory.manualAttack != '??') {
      Memory.roomsToAttack.push(new attackRoom(Memory.manualAttack))
      console.log("Adding room: ", Memory.manualAttack, " to Memor.roomsToAttack")
    }


    //Clearing attack of now owned rooms and running attackManager
    for (r of Memory.roomsToAttack) {


      var roomName = r.name

      attackManager(r)

      if (roomName != undefined && Game.rooms[roomName] != undefined && Game.rooms[roomName].controller.owner == undefined) {
        console.log("Removing room: ", roomName, " from Memory.roomsToAttack")
        Memory.roomsToAttack = Memory.roomsToAttack.filter(function (obj) {
          return obj.name !== roomName;
        });
        delete global.heap.rooms[roomName]
        break;
      }
      else if (Game.rooms[roomName] == undefined && r.attackType != undefined) {
        r.attackType[C.ATTACK_TYPE_SCOUT] = true
      }
    }




    //Getting current userName - dumb first iteration over spawns//
    for (spawnName in Game.spawns) {
      global.heap.userName = Game.spawns[spawnName].owner.username
      break;
    }




    //chosing colonizer
    if (Memory.roomsToColonize.length > 0) {
      for (r of Memory.roomsToColonize) {
        if (r.colonizer == undefined) {
          minDistance = Infinity
          for (m of Memory.mainRooms) {
            if (Game.map.getRoomLinearDistance(m, r.name) < minDistance
              && Game.rooms[m].storage != undefined && Game.rooms[m].storage.store[RESOURCE_ENERGY] > C.COLONIZE_ENERGY_LIMIT
              && r.name != m && Game.map.getRoomLinearDistance(m, r.name) < 11) {

              minDistance = Game.map.getRoomLinearDistance(m, r.name)
              r.colonizer = m;
            }
          }
        }
      }
    }


    //Defining room to fastUpgrade
    var roomToFastRclUpgrade = undefined
    var minDistanceToFastRclUpgrade = Infinity



    //Adding manualAvoid to avoidance for traveler
    if (Memory.manualAvoid != undefined && Memory.manualAvoid.length > 0) {
      for (r of Memory.manualAvoid) {
        if (Memory.rooms[r] == undefined) {
          Memory.rooms[r] = {}
          Memory.rooms[r].avoid = 1;
        }
        else {
          Memory.rooms[r].avoid = 1;
        }

      }
    }

    console.log(C.USERNAME)




    for (mainRoom of Memory.mainRooms) {

      //console.log("Game.cpu.get Used: ",Game.cpu.getUsed(), " ",Game.cpu.limit)
      if (Game.cpu.getUsed() > Game.cpu.limit * 0.7
        && Game.cpu.bucket < 500) {
        c//onsole.log("NOT ENOUGH CPU")
        return
      }

      console.log("--------------- ", mainRoom, "---------------")

      var start = Game.cpu.getUsed()

      if (Game.rooms[mainRoom].memory.distanceToOthers != undefined && Game.rooms[mainRoom].memory.distanceToOthers < minDistanceToFastRclUpgrade
        && Game.rooms[mainRoom].storage != undefined && Game.rooms[mainRoom].terminal != undefined && Game.rooms[mainRoom].controller.level>=6 && Game.rooms[mainRoom].controller.level < 8
        && Game.rooms[mainRoom].memory.distanceToOthers != 0
      ) {
        minDistanceToFastRclUpgrade = Game.rooms[mainRoom].memory.distanceToOthers;
        roomToFastRclUpgrade = mainRoom;
      }

      if (roomToFastRclUpgrade != undefined) {
        Memory.fastRclUpgrade = roomToFastRclUpgrade
      }



      Game.rooms[mainRoom].creepsManager()


      //console.log("global.heap.rooms[,", mainRoom, "].creepsBodyParts after creepsManger: ",
      //  global.heap.rooms[mainRoom].creepsBodyParts)

      Game.rooms[mainRoom].createRoomQueues()

      Game.rooms[mainRoom].spawnManager()

      Game.rooms[mainRoom].linkManager()

      Game.rooms[mainRoom].terminalManager()

      Game.rooms[mainRoom].labsManager()

      Game.rooms[mainRoom].visualize()

      global.heap.rooms[mainRoom].usedCpu = Game.cpu.getUsed() - start
      if (global.heap.rooms[mainRoom].cpuSum == undefined || global.heap.rooms[mainRoom].avgCounter > C.AVG_STEP) {
        global.heap.rooms[mainRoom].cpuSum = global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter = 1;
      }
      else {
        global.heap.rooms[mainRoom].cpuSum += global.heap.rooms[mainRoom].usedCpu
        global.heap.rooms[mainRoom].avgCounter++;
        global.heap.rooms[mainRoom].avgCpu = global.heap.rooms[mainRoom].cpuSum / global.heap.rooms[mainRoom].avgCounter

      }





    }



    var totalUsedCpu = Math.round(Game.cpu.getUsed() - totalStart)
    for (mainRoom of Memory.mainRooms) {
      //total used cpu
      var blockPos = new RoomPosition(38, 0, mainRoom)
      var blockPosWidth = 6
      var blockPosHeight = 1
      Game.rooms[mainRoom].visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
      Game.rooms[mainRoom].visual.text("Cpu: " + totalUsedCpu + "\\" + Game.cpu.limit, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Clearing Memory of a dead room
    var toDelete = undefined
    for (mainRoom of Memory.mainRooms) {

      if (!Game.rooms[mainRoom].controller.my) {
        toDelete = mainRoom
        break;
      }
    }
    if (toDelete != undefined) {
      //deleting construction sites of a dead room
      for (c in Game.constructionSites) {
        if (Game.getObjectById(c).room.name == toDelete || Game.rooms[toDelete].memory.harvestingRooms.find((r) => r.name == toDelete)) { // remove any road or extension construction site
          Game.getObjectById(c).remove()
        }

      }

      for (c in Game.structures) {
        if (Game.getObjectById(c).room.name == toDelete || Game.rooms[toDelete].memory.harvestingRooms.find((r) => r.name == toDelete)) { // remove any road or extension construction site
          Game.getObjectById(c).remove()
        }

      }

      Memory.rooms[toDelete] = {}
      global.heap.rooms[toDelete] = {}
      var index = Memory.mainRooms.find((r) => r == toDelete);
      if (index != undefined) {
        Memory.roomsToColonize.splice(index, 1);
      }
    }


    //removing dead construction sites
    if (Game.time % 1234 == 0) {
      for (c in Game.constructionSites) {
        var inAnyHarvestingRoom = false
        for (m of Memory.mainRooms) {
          if (Game.getObjectById(c).room != undefined && Game.getObjectById(c).room.name == m) {
            inAnyHarvestingRoom = true
            break
          }
          else if (Memory.rooms[m].harvestingRooms != undefined) {
            for (h of Memory.rooms[m].harvestingRooms) {
              if (Game.getObjectById(c).room != undefined && h.name == Game.getObjectById(c).room.name) {
                inAnyHarvestingRoom = true
                break
              }
            }
          }
        }
        if (inAnyHarvestingRoom == false) {
          Game.getObjectById(c).remove()
        }

      }
    }

    //removing structures in dead rooms
    for (s in Game.structures) {
      var inAliveRoom = false
      for (m of Memory.mainRooms) {
        if (Game.getObjectById(s).room != undefined && Game.getObjectById(s).room.name == m) {
          inAliveRoom = true
          break
        }
        else if (Memory.rooms[m].harvestingRooms != undefined) {
          for (h of Memory.rooms[m].harvestingRooms) {
            if (Game.getObjectById(s).room != undefined && h.name == Game.getObjectById(s).room.name) {
              inAliveRoom = true
              break
            }
          }
        }
      }
      if (inAliveRoom == false) {
        Game.getObjectById(s).destroy()
      }

    }



  });


}
