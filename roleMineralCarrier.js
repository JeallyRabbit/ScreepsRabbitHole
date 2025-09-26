const C=require('constants')


Creep.prototype.roleMineralCarrier = function roleMineralCarrier()
{
    //global.heap.creeps[this.name].task=undefined
    if(this.store.getFreeCapacity(RESOURCE_ENERGY)>0 && this.ticksToLive>C.CREEP_TICKS_TO_LIVE_BUFFER)
    {//is full
        global.heap.creeps[this.name].task=C.TASK_COLLECT_MINERAL
    }
    else{
        global.heap.creeps[this.name].task=C.TASK_STORE_MINERAL
    }


    if(global.heap.creeps[this.name].task==C.TASK_COLLECT_MINERAL)
    {
        this.taskCollectMineral()
    }
    else if(global.heap.creeps[this.name].task==C.TASK_STORE_MINERAL)
    {
        this.taskStoreMineral()
    }
}