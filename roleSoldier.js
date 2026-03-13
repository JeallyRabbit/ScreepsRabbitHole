
const Movement = require('screeps-movement');
const C=require('constants')



//TODO
// add finding (in roomManager) myDamagedCreeps (and allied damaged creeps) and healing them



Creep.prototype.roleSoldier = function roleSoldier() {

    if (this.memory.isMelee == undefined) {
        for (let part of this.body) {

            if (part.type == ATTACK) {
                this.memory.isMelee = true;
            }
        }
        if (this.memory.isMelee == undefined) {
            this.memory.isMelee = false;
        }
    }
    if (this.hits < this.hitsMax) {
        this.heal(this);
    }



    if (this.room.name == this.memory.targetRoom) {

        

        var targetCreep = this.pos.findClosestByRange(global.heap.rooms[this.room.name].hostiles);

        var invaderCore=this.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
            filter: function (structure) {
                return structure.structureType == STRUCTURE_INVADER_CORE
            }
        });
        if(invaderCore!=null)
        {
            global.heap.creeps[this.name].targetStructure = invaderCore
        }
        
        if(!global.heap.creeps[this.name].targetStructure && Game.time%20==0)
        {
            global.heap.creeps[this.name].targetStructure=undefined
        }
        

        if (global.heap.creeps[this.name].targetStructure == undefined) {
            global.heap.creeps[this.name].targetStructure = this.room.controller.pos.findClosestByPath(global.heap.rooms[this.room.name].hostileStructures);
        }

        if (targetCreep) {

            if (this.rangedAttack(targetCreep) == ERR_NOT_IN_RANGE) {

                this.travelTo(targetCreep.pos, { maxRooms: 1, avoidSk: true  });
            }

            if (this.memory.isMelee == false) {
                if (this.pos.inRangeTo(targetCreep, 2) && (_.filter(targetCreep.body, function (part) {
                    return part.type === RANGED_ATTACK && part.hits > 0;
                }).length > 0 || _.filter(targetCreep.body, function (part) {
                    return part.type === ATTACK && part.hits > 0;
                }).length > 0)) {
                    this.fleeFrom({ targetCreep }, 3, { maxRooms: 1 })
                    this.say("flee")
                }
                else if (this.pos.isNearTo(targetCreep.pos)) {
                    this.rangedMassAttack()
                }
            }

            if (this.hits < this.hitsMax / 2) {
                this.fleeFrom({ targetCreep }, 6)
            }



        }
        else if (global.heap.creeps[this.name].targetStructure) {

            if (this.memory.isMelee == true) {
                if (this.attack(global.heap.creeps[this.name].targetStructure) == ERR_NOT_IN_RANGE) {
                    this.travelTo(global.heap.creeps[this.name].targetStructure, { maxRooms: 1 , reusePath: 11, range: 1 });
                }

            }
            else {
                this.travelTo(global.heap.creeps[this.name].targetStructure, { maxRooms: 1  });
                this.rangedMassAttack()
            }

            if (this.hits < this.hitsMax) {
                this.heal(this);
            }
        }
        else{
            this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 25 , range: 22 });
        }
    }
    else {

        if (Game.rooms[this.room.name].memory.hostiles != undefined && Game.rooms[this.room.name].memory.hostiles.length > 0) {
            this.rangedMassAttack()
            this.heal(this)
        }
        this.travelTo(new RoomPosition(25, 25, this.memory.targetRoom), { reusePath: 25 , range: 22 });

    }


    if (this.hits < this.hitsMax) {
        this.heal(this);
    }




};