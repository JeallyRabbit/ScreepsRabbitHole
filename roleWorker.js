//const { boosting_driver } = require('boosting_driver');
const C = require('constants')
const Movement = require('screeps-movement');
const creepsTasks = require('creepsTasks')


/*Creep needs:
   Mandatory:
   Creep.memory.homeRoom - roomName in which creep will operate
    
   Creep base its decisions on Game.rooms[this.memory.homeRoom].memory.energyBalance
   lower values means we are using more energy than harvesting
   higher value means we are harvesting more than using

    Will Calculate in its own:
    this.memory.workPartsNum - 
    this.memory.boosters - acceptable boosters - putting only upgrade controller for now
    global.heap.creeps[this.name].task - currently done task -> colelct/upgrade/build 

   */


Creep.prototype.roleWorker = function roleWorker() {

    

    if (this.memory.workPartsNum == undefined) {
        this.memory.workPartsNum = _.filter(this.body, { type: WORK }).length
    }




    if (global.heap.creeps[this.name].boosters == undefined) {
        global.heap.creeps[this.name].boosters=[]
        aux={}
        aux={bodyType: WORK,res:'XGH2O', amount:_.filter(this.body, { type: WORK }).length*LAB_BOOST_MINERAL}//boost types that creep accepts
        global.heap.creeps[this.name].boosters.push(aux)
        
    }

    boostingDriverResult=this.taskGetBoosted()
    if (boostingDriverResult!=0) {

        this.say(boostingDriverResult)

        if (this.room.name != this.memory.homeRoom) {
            //this condition allows sending workers to remote rooms
            this.travelTo(new RoomPosition(25, 25, this.memory.homeRoom))
            this.say("go home")
            return
        }

        if (global.heap.creeps[this.name].task == undefined) {
            global.heap.creeps[this.name].deposit=undefined
            if (this.store.getUsedCapacity(RESOURCE_ENERGY) == 0
            ) {
                global.heap.creeps[this.name].task = C.TASK_COLLECT
                this.memory.task = C.TASK_COLLECT
            }
            else {
                if (this.store.getUsedCapacity(RESOURCE_ENERGY) > 0 && global.heap.rooms[this.memory.homeRoom].building == true
                    && this.room.controller.ticksToDowngrade > (CONTROLLER_DOWNGRADE[this.room.controller.level] * C.CONTROLLER_DOWNGRADE_BOTTOM_LIMIT
                    )
                ) {

                    global.heap.creeps[this.name].task = C.TASK_BUILD
                    this.memory.task = C.TASK_BUILD


                }
                else {
                    global.heap.rooms[this.room.name].restoringDowngrade = this.id
                    global.heap.creeps[this.name].task = C.TASK_UPGRADE
                    this.memory.task = C.TASK_UPGRADE
                }
            }

        }




        this.memory.task=global.heap.creeps[this.name].task
        if (global.heap.creeps[this.name].task == C.TASK_UPGRADE) // if upgrading go upgrade
        {
            this.taskUpgrade(global.heap.creeps[this.name])
            return



        }
        else if (global.heap.creeps[this.name].task == C.TASK_COLLECT) {// go to deposits

            this.taskCollect(global.heap.creeps[this.name])
            return
        }
        else if (global.heap.creeps[this.name].task == C.TASK_BUILD) {

            this.taskBuild(global.heap.creeps[this.name])
            return;

        }

    }

}