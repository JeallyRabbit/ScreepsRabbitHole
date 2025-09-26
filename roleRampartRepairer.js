const C = require('constants');
const creepsTasks=require('creepsTasks')


Creep.prototype.roleRampartRepairer = function roleRampartRepairer()
{

    if(this.store[RESOURCE_ENERGY]==0)
    {
        global.heap.creeps[this.name].task=C.TASK_COLLECT
        this.memory.minRampartId=undefined
        this.memory.task=C.TASK_COLLECT
    }
    else if(this.store.getFreeCapacity(RESOURCE_ENERGY)==0)
    {
        global.heap.creeps[this.name].task=C.TASK_REPAIR_RAMPARTS
        this.memory.task=C.TASK_REPAIR_RAMPARTS
    }

    if(this.memory.task==C.TASK_COLLECT)
    {
        this.taskCollect(global.heap.creeps[this.name])
    }

    if(this.memory.task==C.TASK_REPAIR_RAMPARTS)
    {
        this.taskRepairRamparts();
    }
}