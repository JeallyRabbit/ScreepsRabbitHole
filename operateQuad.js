const { groupBy, range, inRange, startCase } = require("lodash");
const { distanceTransform } = require("./distanceTransform");
const { floodFill } = require("./floodFill");
const C = require('constants')

const ERR_NOT_IN_FULL_RANGE = -20
const DAMAGE_MATRIX_FACTOR = 20

const localHeap = {}

//localHeap = heap;
//TODO
// move to attackManager:
// calculateTowersDamage() - store data in global.heap.rooms[roomName]
// caluclateRampartsCosts() - store data in global.heap.rooms[roomName]
// calculateHostileCreepsCost() - store data in global.heap.rooms[roomName]
// fix breaking formation - urgent
// fix spinning - not urgent

function isQuadPacked(creeps) {
    if (creeps == undefined) { return false }
    if (creeps.length < 4) { return false }
    for (let i = 0; i < creeps.length; i++) {



        for (let j = i + 1; j < creeps.length; j++) {
            var creepA = Game.getObjectById(creeps[i])


            var creepB = Game.getObjectById(creeps[j])
            if (creepA != null && creepB != null && !creepA.pos.isNearTo(creepB.pos) && creepA.pos.roomName == creepB.pos.roomName) {
                return false
            }
            else if (creepA != null && creepB != null && creepA.pos.roomName != creepB.pos.roomName && creepB.pos.x > 2 && creepB.pos.x < 47 && creepB.pos.y > 2 && creepB.pos.y < 47) {//creeps will chase each other
                creepA.moveTo(creepB)
            }
        }
    }
    return true
}

function transformCosts(quad, costs, roomName, swampCost = 5, plainCost = 1, myFlee = false) {

    const terrain = Game.map.getRoomTerrain(roomName)
    const result = new PathFinder.CostMatrix()
    const formationVectors = [
        { x: 0, y: 0 }, // top-left
        { x: 1, y: 0 }, // top-right
        { x: 0, y: 1 }, // bottom-left
        { x: 1, y: 1 }, // bottom-right
    ]
    if (roomName != quad.targetRoom) {
        swampCost *= 2;
        plainCost *= 2
    }
    for (let x = 0; x < 50; x++) {
        for (let y = 0; y < 50; y++) {
            let cost = undefined

            for (let vector of formationVectors) {
                const newX = x + vector.x
                const newY = y + vector.y

                if (newX < 0 || newX > 49 || newY < 0 || newY > 49) {
                    continue
                }

                let newCost = costs.get(newX, newY)

                if (newCost === 0) {
                    const terrainMask = terrain.get(newX, newY)
                    if (terrainMask === TERRAIN_MASK_WALL) {
                        newCost = 255
                    } else if (terrainMask === TERRAIN_MASK_SWAMP) {
                        newCost = swampCost
                    } else {
                        newCost = plainCost
                    }
                }

                if (cost === undefined) {
                    cost = newCost
                } else {
                    cost = Math.max(cost, newCost)
                }
            }

            result.set(x, y, cost)
        }

        result.set(0, i, Math.min(255, result.get(0, i)))
        result.set(49, i, Math.min(255, result.get(49, i)))
        result.set(i, 0), Math.min(255, result.get(i, 0))
        result.set(i, 49, Math.min(255, result.get(i, 49)))
    }

    Game.rooms[roomName].find(FIND_STRUCTURES).forEach(function (struct) {
        if (struct.structureType !== STRUCTURE_CONTAINER &&
            (struct.structureType !== STRUCTURE_RAMPART && struct.structureType !== STRUCTURE_ROAD/* || !struct.my */)) {
            // Can't walk through non-walkable buildings
            result.set(struct.pos.x, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y, 255);
            result.set(struct.pos.x - 1, struct.pos.y - 1, 255);
            result.set(struct.pos.x, struct.pos.y - 1, 255);
        }
        /*
        else if ((struct.structureType == STRUCTURE_RAMPART || struct.structureType == STRUCTURE_WALL) && !struct.my) {
            result.set(struct.pos.x, struct.pos.y, struct.hits / struct.hitsMax);
        }*/

    });

    Game.rooms[roomName].find(FIND_CREEPS).forEach(function (creep) {
        if (!quad.members.includes(creep.id)) {

            result.set(creep.pos.x, creep.pos.y, 254);
            result.set(creep.pos.x - 1, creep.pos.y, 254);
            result.set(creep.pos.x - 1, creep.pos.y - 1, 254);
            result.set(creep.pos.x, creep.pos.y - 1, 254);
        }
    });

    //adding towers and ramparts costs and hostileCreepsCost
    if (roomName == quad.targetRoom) {
        var rampartsCM = undefined
        if (global.heap.rooms[quad.targetRoom].rampartsCM != undefined) {
            rampartsCM = new PathFinder.CostMatrix
            rampartsCM = PathFinder.CostMatrix.deserialize(global.heap.rooms[quad.targetRoom].rampartsCM)
        }
        var towersCM = undefined
        if (global.heap.rooms[quad.targetRoom].towersDamageCM != undefined) {
            towersCM = new PathFinder.CostMatrix
            towersCM = PathFinder.CostMatrix.deserialize(global.heap.rooms[quad.targetRoom].towersDamageCM)
        }
        var hostilesCM = undefined
        if (global.heap.rooms[quad.targetRoom].hostilesCM != undefined) {
            hostilesCM = new PathFinder.CostMatrix
            hostilesCM = PathFinder.CostMatrix.deserialize(global.heap.rooms[quad.targetRoom].hostilesCM)
        }

        for (var i = 0; i < 50; i++) {
            for (var j = 0; j < 50; j++) {
                var currentCost = result.get(i, j)
                var towerCost = 0;
                var rampartCost = 0;
                var hostileCost = 0
                if (towersCM != undefined) {
                    towerCost = towersCM.get(i, j)
                }

                if (rampartsCM != undefined) {
                    //if (myFlee == true) {
                    //    rampartCost = 255
                    //}
                    //else {
                    rampartCost = rampartsCM.get(i, j)
                    //}

                }

                if (hostilesCM != undefined) {
                    hostileCost = hostilesCM.get(i, j)
                }
                var currentCost = result.get(i, j)
                result.set(i, j, Math.max(currentCost, Math.min(currentCost + towerCost + rampartCost + hostileCost, 255)))


            }
        }
    }


    // debuggin - showing overall costmatrix
    for (var i = 0; i < 50; i++) {
        for (var j = 0; j < 50; j++) {
            var tileCost = result.get(i, j)
            if (tileCost > 1 && i == 19) {
            }
            if (Game.rooms[roomName] != undefined) {
                //if (i > 5 && i < 25 && j > 18 && j < 30 || true) {
                //Game.rooms[quad.targetRoom].visual.rect(i - 0.5, j - 0.5, 1, 1, { fill: 'red', opacity: (tileCost / 255) * 0.7 })
                //Game.rooms[roomName].visual.text(tileCost, i, j, { font: 0.5 })
                //}
                //
            }

        }
    }



    return result
}

function moveQuad(quad, targetPos, reusePath = 9, myRange = 1, myFlee = false, maxRooms = 16) {

    //delete quad.path
    //QUad is currently spinning
    //if (quad.isRotating != undefined && quad.isRotating == true) { return -1; }
    if(myFlee==false)
    {
        localHeap.isRetreating=false
    }
    else
    {
        if(localHeap.isRetreating==false)
        {
            localHeap.isRetreating=true
            quad.path=undefined//clear path on first restreat tick
        }
    }


    if (localHeap.isRotating != undefined && localHeap.isRotating == true) { return -1; }
    if (localHeap.isQuadPacked != undefined && localHeap.isQuadPacked == false) { return -1; }
    //if all can move - fatique==0
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        if (cr.fatigue > 0) { return -11 }
    }

    var topLeft = Game.getObjectById(quad.topLeftId);
    if (topLeft == null) { return -1; }

    if (topLeft.pos.isNearTo(targetPos) && myFlee == false) { return }

    if (quad.lastTargetPos == undefined || (quad.lastTargetPos != undefined && !(quad.lastTargetPos.x == targetPos.x && quad.lastTargetPos.y == targetPos.y && quad.lastTargetPos.roomName == targetPos.roomName))) {
        quad.lastTargetPos = targetPos
        // if (Game.time % 88 == 0) {
        quad.path = undefined
        //}

        console.log("RESETTING PATH - TARGET_POS HAS CHANGED")
    }
    var movePath;
    if (quad.path != undefined) {
        movePath = quad.path;
    }

    var nextPos = undefined

    // I'm not sure if that should be before or after calculating Path
    if (quad.path != undefined && quad.path != undefined && quad.path[0] != undefined) {
        nextPos = new RoomPosition(movePath[0].x, movePath[0].y, movePath[0].roomName)

        if ((nextPos.x == topLeft.pos.x && nextPos.y == topLeft.pos.y)) {
            movePath.shift()
            try {
                nextPos = new RoomPosition(movePath[0].x, movePath[0].y, movePath[0].roomName)
            }
            catch { }
        }
    }




    if (movePath != undefined && movePath.length == 0) {
        //quad.path = undefined
        //movePath = undefined
    }


    if (quad.path != undefined && quad.path[0] != undefined && !topLeft.pos.isNearTo(nextPos) && topLeft.pos.roomName == nextPos.roomName) {
        quad.path = undefined
        console.log("resseting path - topLeft is to far away from calculated path")
    }




    if (Game.time % reusePath == 0 || quad.path == undefined /* || (topLeft.pos.x == 49 || topLeft.pos.y == 49 || topLeft.pos.x == 0 || topLeft.pos.y == 0 ) */) {

        topLeft.say("FndPath")
        startCPU = Game.cpu.getUsed()
        const path = PathFinder.search(
            topLeft.pos,
            { pos: targetPos, range: myRange },
            //{ range: 1 },
            {
                flee: myFlee,
                plainCost: 1,
                swampCost: 5,
                maxRooms: maxRooms,
                maxOps: 4000,
                //roomCallback: () => costMatrix,
                roomCallback: function (roomName) {
                    let room = Game.rooms[roomName];
                    if (!room) { return; }
                    const existingCostMatrix = new PathFinder.CostMatrix;
                    const terrain = room.getTerrain()
                    const costMatrix = transformCosts(quad, existingCostMatrix, roomName, 5, 1, myFlee)
                    return costMatrix
                }
            },
        )

        endCPU = Game.cpu.getUsed();
        topLeft.say("Fn: " + (endCPU - startCPU))

        //skipping doubled room edge tiles
        var auxPath = []
        auxPath.push(path.path[0])
        for (var i = 1; i < path.path.length - 1; i++) {
            if ((path.path[i].x == 0 && path.path[i + 1].x == 49) || (path.path[i].x == 49 && path.path[i + 1].x == 0) ||
                (path.path[i].y == 0 && path.path[i + 1].y == 49) || (path.path[i].y == 49 && path.path[i + 1].y == 0)) {
                continue
            }

            if ((path.path[i].x == 0 && path.path[i - 1].x == 49) || (path.path[i].x == 49 && path.path[i - 1].x == 0) ||
                (path.path[i].y == 0 && path.path[i - 1].y == 49) || (path.path[i].y == 49 && path.path[i - 1].y == 0)) {
                continue
            }
            auxPath.push(path.path[i])

        }
        quad.path = auxPath;
        movePath = auxPath
    }



    // I'm not sure if that should be before or after calculating Path
    if (movePath != undefined && movePath != undefined && movePath[0] != undefined) {
        nextPos = new RoomPosition(movePath[0].x, movePath[0].y, movePath[0].roomName)

        if ((nextPos.x == topLeft.pos.x && nextPos.y == topLeft.pos.y /* && nextPos.roomName == topLeft.pos.roomName */)) {
            movePath.shift()
            try {
                nextPos = new RoomPosition(movePath[0].x, movePath[0].y, movePath[0].roomName)
            }
            catch { }
        }
    }

    if (movePath != undefined) {

        var direction = topLeft.pos.getDirectionTo(nextPos)


        var bottomRight = Game.getObjectById(quad.bottomRightId);
        var bottomLeft = Game.getObjectById(quad.bottomLeftId)
        var topRight = Game.getObjectById(quad.topRightId)
        //check PATH is blocked by not STRUCTURE_CONTAINER and not STRUCTURE_ROAD
        var structuresAtPath = []
        if (topLeft.pos.x > 0 && topLeft.pos.x < 49 && topLeft.pos.y > 0 && topLeft.pos.y < 49) {

            if (direction == TOP_LEFT && topLeft != null && topLeft.pos.x - 1 > 0) {
                topLeft.say("↖️", true)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                structuresAtPath = topLeft.room.lookForAt(LOOK_STRUCTURES, topLeft.pos.x - 1, topLeft.pos.y - 1)
                if (topRight != null && topRight.pos.x > 0 && topRight.pos.y > 0) {
                    structuresAtPath.push(topRight.room.lookForAt(LOOK_STRUCTURES, topRight.pos.x - 1, topRight.pos.y - 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
                if (bottomLeft != null && bottomLeft.pos.x > 0 && bottomLeft.pos.y > 0) {
                    structuresAtPath.push(bottomLeft.room.lookForAt(LOOK_STRUCTURES, bottomLeft.pos.x - 1, bottomLeft.pos.y - 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == BOTTOM_LEFT && bottomLeft != null && bottomLeft.pos.x - 1 > 0 && bottomLeft.pos.y + 1 < 49) {
                bottomLeft.say("↙️", true)
                structuresAtPath = bottomLeft.room.lookForAt(LOOK_STRUCTURES, bottomLeft.pos.x - 1, bottomLeft.pos.y + 1)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (topLeft != null && topLeft.pos.x - 1 > 0 && topLeft.pos.y + 1 < 49) {
                    structuresAtPath.push(topLeft.room.lookForAt(LOOK_STRUCTURES, topLeft.pos.x - 1, topLeft.pos.y + 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
                if (bottomRight != null && bottomRight.pos.x - 1 > 0 && bottomRight.pos.y + 1 < 49) {
                    structuresAtPath.push(bottomRight.room.lookForAt(LOOK_STRUCTURES, bottomRight.pos.x - 1, bottomRight.pos.y + 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == BOTTOM_RIGHT && bottomRight != null && bottomRight.pos.x + 1 < 49 && bottomRight.pos.y + 1 < 49) {
                bottomRight.say("↘️", true)
                structuresAtPath = bottomRight.room.lookForAt(LOOK_STRUCTURES, bottomRight.pos.x + 1, bottomRight.pos.y + 1)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (bottomLeft != null && bottomLeft.pos.x + 1 < 49 && bottomLeft.pos.y + 1 < 49) {
                    structuresAtPath.push(bottomLeft.room.lookForAt(LOOK_STRUCTURES, bottomLeft.pos.x + 1, bottomLeft.pos.y + 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
                if (topRight != null) {
                    structuresAtPath.push(topRight.room.lookForAt(LOOK_STRUCTURES, topRight.pos.x + 1, topRight.pos.y + 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == TOP_RIGHT && topRight != null && topRight.pos.x + 1 < 49 && topRight.pos.y - 1 > 0) {
                topRight.say("↗️", true)
                structuresAtPath = topRight.room.lookForAt(LOOK_STRUCTURES, topRight.pos.x + 1, topRight.pos.y - 1)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (topLeft != null && topLeft.pos.x + 1 < 49 && topLeft.pos.y - 1 > 0) {
                    structuresAtPath.push(topLeft.room.lookForAt(LOOK_STRUCTURES, topLeft.pos.x + 1, topLeft.pos.y - 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
                if (bottomRight != null && bottomRight.pos.x + 1 < 49 && bottomRight.pos.y - 1 > 0) {
                    structuresAtPath.push(bottomRight.room.lookForAt(LOOK_STRUCTURES, bottomRight.pos.x + 1, bottomRight.pos.y - 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == BOTTOM && bottomLeft != null && bottomLeft.pos.y + 1 < 49) {
                bottomLeft.say("⬇️", true)
                structuresAtPath = bottomLeft.room.lookForAt(LOOK_STRUCTURES, bottomLeft.pos.x, bottomLeft.pos.y + 1)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (bottomRight != null && bottomRight.pos.y + 1 > 0) {
                    structuresAtPath.push(topLeft.room.lookForAt(LOOK_STRUCTURES, bottomRight.pos.x, bottomRight.pos.y + 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == TOP && topLeft != null && topLeft.pos.y - 1 > 0) {
                topLeft.say("⬆️", true)
                structuresAtPath = topLeft.room.lookForAt(LOOK_STRUCTURES, topLeft.pos.x, topLeft.pos.y - 1)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (topRight != null && topRight.pos.y - 1 > 0) {
                    structuresAtPath.push(topRight.room.lookForAt(LOOK_STRUCTURES, topRight.pos.x, topRight.pos.y - 1))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == LEFT && topLeft != null && topLeft.pos.x - 1 > 0) {
                topLeft.say("⬅️", true)
                structuresAtPath = topLeft.room.lookForAt(LOOK_STRUCTURES, topLeft.pos.x - 1, topLeft.pos.y)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (bottomLeft != null && bottomLeft.pos.x - 1 > 0) {
                    structuresAtPath.push(bottomLeft.room.lookForAt(LOOK_STRUCTURES, bottomLeft.pos.x - 1, bottomLeft.pos.y))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
            else if (direction == RIGHT && topRight != null && topRight.pos.x + 1 < 49) {
                topRight.say("➡️", true)
                structuresAtPath = topRight.room.lookForAt(LOOK_STRUCTURES, topRight.pos.x + 1, topRight.pos.y)
                if (structuresAtPath == undefined) { structuresAtPath = [] }
                if (bottomRight != null && bottomRight.pos.x + 1 < 49) {
                    structuresAtPath.push(bottomRight.room.lookForAt(LOOK_STRUCTURES, bottomRight.pos.x + 1, bottomRight.pos.y))
                    if (structuresAtPath == undefined) { structuresAtPath = [] }
                }
            }
        }


        //Excluding roads and containers from path
        structuresAtPath = _.filter(structuresAtPath, function (str) {
            return str.my == false && (str.structureType != STRUCTURE_CONTAINER && str.structureType != STRUCTURE_ROAD);
        });
        if (movePath != undefined && movePath.length > 0 && structuresAtPath.length > 0 && structuresAtPath[0].structureType != undefined) {

            localHeap.isBlocked = false;

            if (structuresAtPath.length > 0) {
                localHeap.isBlocked = true;
                if (topLeft != null && topLeft.room.name == quad.targetRoom) {
                    if (Game.time % 131 == 0) {
                        console.log("RESETTING PATH - OBSTACLE - in targetRoom")
                        quad.path = undefined
                    }
                }
                else if (topLeft != null && topLeft.room.name != quad.targetRoom) {

                    quadRangedMassAttack(quad)
                    if (Game.time % 9 == 0) {
                        console.log("RESETTING PATH - OBSTACLE - not in target room")
                        quad.path = undefined
                    }

                }

                //need testing
                if (structuresAtPath[0] != undefined && structuresAtPath[0].pos != undefined) {
                    //topLeft.say("rtObs")
                    //quad.targetStructureId=structuresAtPath[0].id
                    //quad.targetId=structuresAtPath[0].id
                    console.log("changing target to: ", structuresAtPath[0])
                    rotateToTarget(quad, structuresAtPath[0])
                }

                //
                console.log("Path blocked by WALL or RAMPART at: ", s.pos)
                return -13;//path in reality is blocked by rampart/wall
            }

        }



        //debugging - drawing path
        myStroke = 'red'
        if (myFlee) {
            myStroke = 'yellow'
        }
        for (p of movePath) {
            // if (p.roomName == topLeft.room.name) {
            if (p != null && Game.rooms[p.roomName] != undefined) {
                Game.rooms[p.roomName].visual.circle(p.x, p.y, { fill: 'transparent', radius: 0.55, stroke: myStroke })
            }
        }


        var move_result = 0;
        for (q of quad.members) {
            if (localHeap.isBlocked) {
                return -1;
            }
            cr = Game.getObjectById(q)
            if (cr == null) { continue }

            move_result += cr.move(direction)
            //cr.say(cr.move(direction))
        }
        if (move_result > 0 && Math.abs(move_result) % 11 != 0) {// 0 - OK,11 - err_tired
            //quad.path = undefined
        }
        else if (move_result == 0 || Math.abs(move_result) % 11 == 0) {
            return move_result
        }
    }
    else {
        //console.log("Path is undefined")
    }



}

function quadRetreat(quad, position, range = 55) {

    localHeap.noSpin = true
    
    //quad.noSpin = true
    //quad.isRotating = false
    localHeap.isRotating = false;
    retreatResult = moveQuad(quad, position, 9, range, true, 2)
}

function quadRangedAttack(quad, target) {
    var resultSum = 0;
    var result = 0;
    var notInRange = false
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        result = cr.rangedAttack(target)
        resultSum += result
        if (result == ERR_NOT_IN_RANGE) { notInRange = true; }
        else if (result == ERR_INVALID_TARGET) { return ERR_INVALID_TARGET }
    }
    if (resultSum == 0) { return OK }
    else if (resultSum > 0 && resultSum < 36 && resultSum % 9 == 0) { return ERR_NOT_IN_FULL_RANGE }
    else if (notInRange == true) { return ERR_NOT_IN_RANGE }
}

function quadSpinLeft(quad) {
    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (topLeft == null || topRight == null || bottomLeft == null || bottomRight == null || (localHeap.isRotating != undefined && localHeap.isRotating == true))
    //(quad.isRotating != undefined && quad.isRotating == true)) {
    {
        return -1;
    }

    topLeft.say("<-")
    /*
    console.log("before spin")
    console.log("topLeft.pos: ", topLeft.pos)
    console.log("topRight.pos: ", topRight.pos)
    console.log("bottomRight.pos: ", bottomRight.pos)
    console.log("bottomLeft.pos: ", bottomLeft.pos)
    */
    topLeft.move(BOTTOM);
    topRight.move(LEFT);
    bottomRight.move(TOP);
    bottomLeft.move(RIGHT);
    console.log("quad is spinning left")

    var aux = quad.topLeftId
    quad.topLeftId = quad.topRightId
    quad.topRightId = quad.bottomRightId
    quad.bottomRightId = quad.bottomLeftId
    quad.bottomLeftId = aux
    quad.isRotating = true
    localHeap.isRotating = true
}

function quadSpinRight(quad) {
    //if (quad.isRotating == true) { return -1; }
    if (localHeap.isRotating == true) { return -1 }
    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (topLeft == null || topRight == null || bottomLeft == null || bottomRight == null || (localHeap.isRotating != undefined && localHeap.isRotating == true))
    // (quad.isRotating != undefined && quad.isRotating == true)) {
    {
        return -1;
    }

    topRight.say("->")
    topLeft.move(RIGHT);
    topRight.move(BOTTOM);
    bottomRight.move(LEFT);
    bottomLeft.move(TOP);
    console.log("quad is spinning right")
    //
    var aux = quad.topLeftId
    quad.topLeftId = quad.bottomLeftId
    quad.bottomLeftId = quad.bottomRightId
    quad.bottomRightId = quad.topRightId
    quad.topRightId = aux
    //quad.isRotating = true
    localHeap.isRotating = true
    return 0;
}

function getTargetDirection(quad, target) {
    var powerDirection = undefined;
    var topLeft = Game.getObjectById(quad.topLeftId);

    if (topLeft == null) {
        return -1;
    }

    var damage = 0;
    if (target.pos.x <= topLeft.pos.x) {//Left side
        if (target.pos.y <= topLeft.pos.y) {
            return TOP_LEFT
        }
        else {
            return BOTTOM_LEFT
        }
    }
    else {//Right side
        if (target.pos.y <= topLeft.pos.y) {
            return TOP_RIGHT
        }
        else {
            return BOTTOM_RIGHT
        }
    }
}

function getQuadDirection(quad) {
    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (topLeft == null || topRight == null || bottomLeft == null || bottomRight == null) {
        return -1;
    }

    /*
    creep.memory.thisNotWorkWellInMemory="oh no"

    heap.thisWorksWellInHeap="oh yes"



    */

    var topPower = 0;
    var leftPower = 0;
    var rightPower = 0;
    var bottomPower = 0;

    topPower = (_.filter(topLeft.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER) + _.filter(topRight.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER;
    leftPower = (_.filter(topLeft.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER) + _.filter(bottomLeft.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER;
    rightPower = (_.filter(topRight.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER) + _.filter(bottomRight.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER;
    bottomPower = (_.filter(bottomLeft.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER) + _.filter(bottomRight.body, { type: RANGED_ATTACK }).length * RANGED_ATTACK_POWER;

    var max = Math.max(topPower, leftPower, rightPower, bottomPower)
    if (max == topPower) { return TOP }
    if (max == leftPower) { return LEFT }
    if (max == rightPower) { return RIGHT }
    if (max == bottomPower) { return BOTTOM }

    return -1;
}

function rotateToTarget(quad, target) {
    //if (quad.noSpin == true) { return -1 }
    if (localHeap.noSpin == true) { return -1 }
    var aux = getTargetDirection(quad, target) - getQuadDirection(quad)
    console.log("quad: ", quad.id, " needs to rotate into  into ", getTargetDirection(quad, target),
        " - ", getQuadDirection(quad), " = ", aux, " direction")
    if (Math.abs(aux) > 1) {
        if (aux == -3) {
            quadSpinLeft(quad)
        }
        else {
            quadSpinRight(quad)
        }

        /*
        rotate left when TOPRIGHT(2) - BOTTOM(5)=-3
        BOTTOMRIGHT4 - LEFT7
            */
    }
}

function quadRangedMassAttack(quad, target = undefined) {
    var result = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }

        if (target != undefined) {

            var range = cr.pos.getRangeTo(target.pos.x, target.pos.y)
            //console.log("range to target: ",range)
            if (range > 1 && range <= 3) {
                result = cr.rangedAttack(target)
            }
            else {
                result = cr.rangedMassAttack()
            }
        }
        else { result = cr.rangedMassAttack() }

    }
    if (result == 0) { return OK; }
}

function quadEqualHeal(quad) {

    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);

    if (topLeft != null && topRight != null && bottomLeft != null && bottomRight != null) {
        var direction = getQuadDirection(quad)

        if (direction == TOP || direction == BOTTOM) {
            bottomLeft.heal(topLeft)
            topLeft.heal(bottomLeft)
            bottomRight.heal(topRight)
            topRight.heal(bottomRight)
        }
        else // direction ==LEFT || direction == RIGHT
        {
            topLeft.heal(topRight)
            topRight.heal(topLeft)
            bottomLeft.heal(bottomRight)
            bottomRight.heal(bottomLeft)
        }
    }
    else {
        for (q of quad.members) {
            cr = Game.getObjectById(q)
            if (cr == null) { continue }

            cr.heal();
        }
    }

}

function quadHeal(quad, target) {
    var ranged_res = OK;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        var res = cr.heal(target)
        if (res == ERR_NOT_IN_RANGE) {
            ranged_res = cr.rangedHeal(target)
        }
        if (ranged_res == ERR_NOT_IN_RANGE) { }
    }
    return ranged_res;
}

function quadMinHeal(quad) {
    var minHealth = 1;
    var minHealthId = null
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        if (cr.hits / cr.hitsMax < minHealth) {
            minHealth = cr.hits / cr.hitsMax
            minHealthId = q;
        }
    }

    return minHealthId
}

function quadSelfHeal(quad) {
    var minHeal = quadMinHeal(quad)
    //console.log(quad, " is healing")
    if (minHeal == null) {
        topLeft = Game.getObjectById(quad.topLeftId)
        if (topLeft != null) {
            //{event: EVENT_ATTACK, }
            eventLog = topLeft.room.getEventLog()
            myAttackedEvents = _.filter(eventLog, function (e) {
                return e.event == EVENT_ATTACK && quad.members.includes(e.targetId)
            });
            //console.log("myAttackedEVents: ", myAttackedEvents.length)
            if (myAttackedEvents.length > 0) {
                target = Game.getObjectById(myAttackedEvents[0].id)
                if (target != null) {
                    quadHeal(quad, target)
                    //console.log("last attacked was: ", target, " and healing this creep")
                }
                else {
                    quadEqualHeal(quad)
                }

            }
        }
        else {
            quadEqualHeal(quad)
        }


    }
    else {

        quadHeal(quad, Game.getObjectById(minHeal))
    }
}

function quadHealPower(quad) {
    var healPower = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        healPower += _.filter(cr.body, { type: HEAL }).length * HEAL_POWER;
    }
    return healPower
}

function quadHits(quad) {
    var hits = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        hits += cr.hits;
    }
    return hits
}

function quadHitsMax(quad) {
    var hitsMax = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        hitsMax += cr.hitsMax;
    }
    return hitsMax;
}



function quadNearTo(quad, target) {
    var nearCounter = 0;
    for (q of quad.members) {
        cr = Game.getObjectById(q)
        if (cr == null) { continue }
        {
            if (cr.pos.isNearTo(target.pos.x, target.pos.y) == true) { nearCounter++; }
        }
    }
    if (nearCounter >= 2) { return true }
    return false;
}


function calculateTowersDamage(quad, towers, currentRoom) {
    if (towers.length < 1) { return -1; }

    if (global.heap.rooms[currentRoom].towersDamageCM == undefined) {
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
        global.heap.rooms[currentRoom].towersDamageCM = damageMatrix.serialize();
    }
    return 0;
}



function caluclateRampartsCosts(quad, structures, currentRoom) {

    // TODO or TO THINK OVER
    // instead of dividing by str.hitsMax, divide by biggest str.hits (biggest out of ramparts)
    // maxHits = str.hits of most fortified rampart
    // var tileCost = (str.hits / maxHits) * DAMAGE_MATRIX_FACTOR
    if (structures.length < 1) { return -1; }
    if (global.heap.rooms[currentRoom].rampartsCM == undefined) {
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
        global.heap.rooms[currentRoom].rampartsCM = rampartsMatrix.serialize();

    }
    return 0;
}



//Calculates heal power of weakest creep in quad (the one with least HEAL parts) and heal power of all of them
function calculateHealPower(quad) {
    var minHealPower = 999999//heal power of weakest creep
    var totalHealPower = 0;//heal power of whole quad
    var minHp = Infinity;//Finds weakest hitsMax - creep with minimum hitsMax
    for (m of quad.members) {
        member = Game.getObjectById(m)
        if (member == null) { continue }
        if (_.filter(member.body, { type: HEAL }).length * HEAL_POWER < minHealPower) { minHealPower = _.filter(member.body, { type: HEAL }).length * HEAL_POWER }
        if (member.hitsMax < minHp) { minHp = member.hitsMax }
        totalHealPower += _.filter(member.body, { type: HEAL }).length * HEAL_POWER

    }
    quad.minHealPower = minHealPower;
    quad.totalHealPower = totalHealPower;
    quad.minHp = minHp;
}

function getRangedAttackPower(body) {
    var attackSum = 0;
    for (b of body) {
        if (b.role == RANGED_ATTACK) {
            if (b.boost == undefined) {
                attackSum += RANGED_ATTACK_POWER;
                continue;
            }
            else if (b.boost == RESOURCE_KEANIUM_OXIDE) {
                attackSum += RANGED_ATTACK_POWER * 2;
            }
            else if (b.boost == RESOURCE_KEANIUM_ALKALIDE) {
                attackSum += RANGED_ATTACK_POWER * 3;
            }
            else if (b.boost == RESOURCE_CATALYZED_KEANIUM_ALKALIDE) {
                attackSum += RANGED_ATTACK_POWER * 4;
            }
        }
    }
    return attackSum
}
function getAttackPower(body) {
    var attackSum = 0;
    for (b of body) {
        if (b.role == ATTACK) {
            if (b.boost == undefined) {
                attackSum += ATTACK_POWER;
                continue;
            }
            else if (b.boost == RESOURCE_UTRIUM_HYDRIDE) {
                attackSum += ATTACK_POWER * 2;
            }
            else if (b.boost == RESOURCE_UTRIUM_ACID) {
                attackSum += ATTACK_POWER * 3;
            }
            else if (b.boost == RESOURCE_CATALYZED_UTRIUM_ACID) {
                attackSum += ATTACK_POWER * 4;
            }
        }
    }
    return attackSum
}


function calculateHostileCreepsCost(quad, hostiles, currentRoom) {
    if (hostiles.length < 1) { return -1; }
    if (global.heap.rooms[currentRoom].hostilesCM == undefined || true) {
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
        global.heap.rooms[currentRoom].hostilesCM = hostilesMatrix.serialize()
    }
}




function findTargetStructure(quad, structures, room) {

    if (structures == undefined || structures.length < 1) {
        return -1;
    }
    if (room == undefined) { room = quad.targetRoom }
    var targetStructure = null
    var minHits = Infinity

    for (s of structures) {
        var role = s.structureType
        if (role != STRUCTURE_RAMPART && role != STRUCTURE_CONTROLLER && role != STRUCTURE_CONTAINER && role != STRUCTURE_EXTRACTOR
            && role != STRUCTURE_LINK
        ) {
            structuresAt = Game.rooms[room].lookForAt(LOOK_STRUCTURES, s.pos)
            var rampHits = 0
            for (at of structuresAt) {
                if (at.structureType == STRUCTURE_RAMPART) {
                    rampHits = at.hits
                }
            }
            id = s.id
            myHits = rampHits + s.hits
            if (myHits < minHits) {
                minHits = myHits
                targetStructure = s
            }
        }

    }
    if (targetStructure == null) {
        return -1
    }
    return targetStructure
}

function findTargetCreepInRange(quad, hostiles) {// finds creep in range of RangedAttack which is not  protected by ramparts
    var target = null
    var distance = 4
    for (m of quad.members) {
        var member = Game.getObjectById(m)
        var closeNotCovered = []
        if (member == null) { continue }


        for (h of hostiles) {
            var isCovered = false
            var inRange = false;

            if (member.pos.getRangeTo(h) < distance) { inRange = true; }

            if (inRange) {
                var str = member.room.lookForAt(LOOK_STRUCTURES, h.pos.x, h.pos.y)
                for (s of str) {
                    if (s.structureType == STRUCTURE_RAMPART) {
                        isCovered = true
                        break;
                    }
                }
                if (isCovered == false) {
                    closeNotCovered.push(h)
                }
            }

        }

        if (closeNotCovered.length > 0) {
            return member.pos.findClosestByRange(closeNotCovered)
        }
    }
    return target;
}


function operateQuad(quad) {

    startCpu = Game.cpu.getUsed()
    var topLeft = Game.getObjectById(quad.topLeftId);
    var topRight = Game.getObjectById(quad.topRightId);
    var bottomLeft = Game.getObjectById(quad.bottomLeftId);
    var bottomRight = Game.getObjectById(quad.bottomRightId);
    //quad.isRotating = false
    localHeap.isRotating = false;
    localHeap.noSpin = false;
    localHeap.isBlocked = false;
    localHeap.isQuadPacked = false;
    localHeap.isQuadPacked = isQuadPacked(quad.members)

    //debugging
    if (false) {
        quad.path = undefined
        var manualMove = BOTTOM
        topLeft.move(manualMove)
        topRight.move(manualMove)
        bottomLeft.move(manualMove)
        bottomRight.move(manualMove)
        return;
    }



    if (quad.members != undefined && quad.members.length >= 4) {
        quad.completed = true
        //while (quad.members.length > 4) { quad.members.pop() }
    }

    if (topLeft == null && topRight != null) {
        topLeft = topRight
        quad.topLeftId = quad.topRightId

        topRight = bottomRight
        quad.topRightId = quad.bottomRightId

        bottomRight = bottomLeft
        quad.bottomRightId = quad.bottomLeftId

        bottomLeft = undefined
        quad.bottomLeftId = undefined

    }



    //checking if quad is dead
    var dead_counter = 0;
    if (quad.members != undefined && quad.members.length > 0) {
        for (m of quad.members) {
            if (Game.getObjectById(m) == null) { dead_counter++; }
        }
    }
    else {
        dead_counter = 4
    }

    if (dead_counter == 4 || topLeft == null) {
        quad.members = [];
        quad.isCompleted = false;
        quad.topLeftId = undefined;
        quad.topRightId = undefined;
        quad.bottomLeftId = undefined;
        quad.bottomRightId = undefined;
        quad.minEnergyOnCreep = -1;
        //global.heap.rooms[quad.targetRoom].towersDamageCM = undefined;
        //global.heap.rooms[quad.targetRoom].rampartsCM = undefined;
        quad.grouping_pos = undefined
        quad.targetStructureId = undefined;
        quad.minHealPower = undefined;
        quad.totalHealPower = undefined;
        quad.minHp = undefined;

        return
    }

    quadSelfHeal(quad)

    if (localHeap.isQuadPacked == false) {

        if (topLeft.pos.x > 0 && topLeft.pos.x < 48 && topLeft.pos.y > 0 && topLeft.pos.y < 48 || true) {
            //console.log("grouping 2")
            if (quad.grouping_pos == undefined) {
                var seeds = [];
                seeds.push(topLeft.pos);
                let roomCM = new PathFinder.CostMatrix;
                //setting roomCM with terrain data
                const terrain = new Room.Terrain(topLeft.room.name);
                for (let i = 0; i < 50; i++) {
                    for (let j = 0; j < 50; j++) {
                        if (terrain.get(i, j) == 1) {
                            roomCM.set(i, j, 255);
                        }
                    }
                }

                var myOtherCreeps = topLeft.room.find(FIND_MY_CREEPS, {
                    filter: function (cr) {
                        return !quad.members.includes(cr.id)
                    }
                })

                for (other of myOtherCreeps) {
                    roomCM.set(other.pos.x, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y - 1, 255)
                    roomCM.set(other.pos.x, other.pos.y - 1, 255)
                }

                var notMineCreeps = topLeft.room.find(FIND_CREEPS, {
                    filter: function (cr) {
                        return !quad.members.includes(cr.id)
                    }
                })

                for (other of notMineCreeps) {
                    roomCM.set(other.pos.x, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y, 255)
                    roomCM.set(other.pos.x - 1, other.pos.y - 1, 255)
                    roomCM.set(other.pos.x, other.pos.y - 1, 255)
                }



                var structures = topLeft.room.find(FIND_STRUCTURES, {
                    filter: function (str) {
                        return str.structureType != STRUCTURE_ROAD || (str.structureType == STRUCTURE_RAMPART && str.my == false)
                    }
                })

                for (s of structures) {
                    roomCM.set(s.pos.x, s.pos.y, 255)
                    roomCM.set(s.pos.x - 1, s.pos.y, 255)
                    roomCM.set(s.pos.x - 1, s.pos.y - 1, 255)
                    roomCM.set(s.pos.x, s.pos.y - 1, 255)
                }


                var floodCM = topLeft.room.floodFill(seeds);
                let distanceCM = topLeft.room.diagonalDistanceTransform(roomCM, false);
                var min_distance = Infinity
                grouping_pos = new RoomPosition(25, 25, topLeft.room.name)
                for (let i = 1; i < 48; i++) {
                    for (let j = 1; j < 48; j++) {
                        if (distanceCM.get(i, j) >= 3 && floodCM.get(i, j) < min_distance) {
                            min_distance = floodCM.get(i, j);
                            grouping_pos.x = i;
                            grouping_pos.y = j;
                        }
                    }
                }
                quad.grouping_pos = grouping_pos
            }
        }
        else {
            //topLeft.moveTo(new RoomPosition(25, 25, quad.targetRoom), { maxStuck: 1 })
        }


        //quad.path = false

        if (topLeft != null && quad.grouping_pos != undefined) {
            //topLeft.say(quad.grouping_pos.x + " " + quad.grouping_pos.y)
            topLeft.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y, quad.grouping_pos.roomName), { maxStuck: 1 })
        }
        if (topRight != null && quad.grouping_pos != undefined) {
            if (topLeft != null) {
                topRight.moveTo(new RoomPosition(topLeft.pos.x + 1, topLeft.pos.y, topLeft.pos.roomName))
            }
            else {
                topRight.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y, quad.grouping_pos.roomName), { maxStuck: 1 })

            }

        }
        if (bottomLeft != null && quad.grouping_pos != undefined) {
            if (topLeft != null) {
                bottomLeft.moveTo(new RoomPosition(topLeft.pos.x, Math.min(topLeft.pos.y + 1, 49), topLeft.pos.roomName))
            }
            else {
                bottomLeft.moveTo(new RoomPosition(quad.grouping_pos.x, quad.grouping_pos.y + 1, quad.grouping_pos.roomName), { maxStuck: 1 })
            }
        }
        if (bottomRight != null && quad.grouping_pos != undefined) {
            if (topLeft != null) {
                bottomRight.moveTo(new RoomPosition(topLeft.pos.x + 1, topLeft.pos.y + 1, topLeft.pos.roomName))
            }
            else {
                bottomRight.moveTo(new RoomPosition(quad.grouping_pos.x + 1, quad.grouping_pos.y + 1, quad.grouping_pos.roomName), { maxStuck: 1 })
            }
        }

        return

    }
    else {
        quad.grouping_pos = undefined
    }


    console.log("quad: ", quad.id, " targetRoom: ", quad.targetRoom)
    var currentRoom = topLeft.room.name
    console.log("currentRoom: ", currentRoom, global.heap.rooms[currentRoom].hostiles.length)
    if (currentRoom == quad.targetRoom || (global.heap.rooms[currentRoom].hostiles != undefined && global.heap.rooms[currentRoom].hostiles.length > 0)) {

        if (currentRoom == quad.targetRoom) {
            //console.log("QUAD IS IN TARGET ROOM")
        }
        else {
            console.log("Quad is fighting with hostile creeps on the road to targetRoom")
        }


        var hostileCreeps = [] // just not mine/allied creeps
        var hostileNotProtectedCreeps = [] // hostile creeps, not under rampart and in quad range
        for (hos of global.heap.rooms[currentRoom].hostiles) {

            hostileCreeps.push(hos)
            if (hos.pos.inRangeTo(topLeft.pos.x, topLeft.pos.y, 5) || hos.pos.inRangeTo(topLeft.pos.x + 1, topLeft.pos.y, 5)
                || hos.pos.inRangeTo(topLeft.pos.x, topLeft.pos.y + 1, 5) || hos.pos.inRangeTo(topLeft.pos.x + 1, topLeft.pos.y + 1, 5)) {
                hostileNotProtectedCreeps.push(hos)
            }


        }
        var hostilesFound = false
        if (hostileCreeps.length > 0) { hostilesFound = true }
        console.log("hostilesFound: ", hostilesFound)

        var hostileStructures = global.heap.rooms[currentRoom].hostileStructures;
        var towers = []
        var extensions = []
        var spawns = []
        var ramparts = []

        for (str of hostileStructures) {
            aux = Game.getObjectById(str)
            if (aux == null) {
                continue;
            }
            if (aux.structureType == STRUCTURE_TOWER) {
                towers.push(aux)
            }
            else if (aux.structureType == STRUCTURE_EXTENSION) {
                extensions.push(aux)
            }
            else if (aux.structureType == STRUCTURE_SPAWN) {
                spawns.push(aux)
            }
            else if (aux.structureType == STRUCTURE_RAMPART) {
                ramparts.push(aux)
            }
        }

        //var target = null;

        calculateHealPower(quad)
        calculateTowersDamage(quad, towers, currentRoom)
        caluclateRampartsCosts(quad, hostileStructures, currentRoom)
        calculateHostileCreepsCost(quad, hostileCreeps, currentRoom)



        if (quad.targetStructureId == undefined || Game.time % 7 == 0 || Game.getObjectById(quad.targetStructureId) == null) {
            var aux = findTargetStructure(quad, hostileStructures, currentRoom)
            if (aux != -1) {
                quad.targetStructureId = aux.id
            }
            else {
                quad.targetStructureId = undefined
            }
        }

        var target = undefined


        if (quad.targetStructureId != undefined) {
            target = Game.getObjectById(quad.targetStructureId)
        }

        console.log("hostileCreeps: ", hostileCreeps.length)
        var targetCreep = findTargetCreepInRange(quad, hostileCreeps)



        if (targetCreep != null) { target = targetCreep }
        console.log(topLeft.pos, " ", target)

        console.log("target: ", target)
        if (target != null) {


            quad.targetId = target.id
            console.log("quad: ", quad.id, " is targeting: ", target, " at: ", target.pos)

            quadRangedMassAttack(quad, target)

            //console.log("quad is attacking: ", target, " result ", quadRangedAttack(quad, target))
            if ((quadRangedAttack(quad, target) == ERR_NOT_IN_RANGE || quadNearTo(quad, target) == false) && quadHits(quad) >= quadHitsMax(quad) - quadHealPower(quad)) {
                moveQuad(quad, target.pos, 9, 1, false, 1)
                //console.log("quad: ", quad.id, " is moving to target: ", target.pos)
            }
            else if (quadNearTo(quad, target)) {
                console.log("quad is near ", target)
                quadRangedMassAttack(quad, target)

                //if Quad will for sure not retreat
                if (!(quadHits(quad) < quadHitsMax(quad) && (quadHitsMax(quad) - quadHits(quad)) > quadHealPower(quad))
                    && localHeap.isBlocked == false) {
                    rotateToTarget(quad, target)
                }

            }
            else {
                quadRangedAttack(quad, target)
            }
        }
        else {

            moveQuad(quad, new RoomPosition(25, 25, quad.targetRoom), 10)


        }


        //console.log(quad.id, " hits: ", quadHits(quad), " / ", quadHitsMax(quad))
        if (quadHits(quad) < quadHitsMax(quad) && (quadHitsMax(quad) - quadHits(quad)) > quadHealPower(quad)) {

            if (target == undefined || target.pos == undefined) {
                console.log("quad: ", quad.id, " is retreating - no target")
                topLeft.say("retr1")
                var homePos = new RoomPosition(25, 25, topLeft.memory.homeRoom)
                moveQuad(quad, homePos, 5, 10)
                
            }
            else {
                topLeft.say("retTar")
                console.log("quad: ", quad.id, " is retreating away from target")
                quadRetreat(quad, target.pos)
            }
        }
    }
    else if (quadHits(quad) >= quadHitsMax(quad)){
        ///if (quadHits(quad) >= quadHitsMax(quad) - quadHealPower(quad)) {
        console.log("Quad: ", quad.id, " is moving to: ", quad.targetRoom)
        //moveQuad(quad, new RoomPosition(25, 25, quad.targetRoom), 10)
        if (quad.targetId != undefined && Game.getObjectById(quad.targetId) != null && Game.getObjectById(quad.targetId).pos.roomName == quad.targetRoom) {
            moveQuad(quad, Game.getObjectById(quad.targetId).pos, 9, 1, false, 1)
            
        }
        else {
            quad.targetId = undefined
            moveQuad(quad, new RoomPosition(25, 25, quad.targetRoom), 10)
            
        }
    }
    else {
        console.log("quad: ", quad.id, " is retreating to spawn")
        var homePos = new RoomPosition(25, 25, topLeft.memory.homeRoom)
        //moveQuad(quad, homePos, 5, 10)
        quadRetreat(quad, target.pos)
    }

    if (global.heap.rooms[currentRoom].allies == undefined || global.heap.rooms[currentRoom].allies.length < 0) {
        //quadRangedMassAttack(quad)
    }


    if (topLeft.room.name != topLeft.memory.homeRoom && target != undefined && target.id == undefined) {
        quadRangedMassAttack(quad)
    }

    endCPU = Game.cpu.getUsed()
    //console.log("Quad: ", quad.id, " used: ", endCPU - startCpu, " CPU")
}
module.exports = operateQuad