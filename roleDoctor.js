const C=require('constants')

Creep.prototype.roleDoctor = function roleDoctor() {

    this.say("D")
    var storage=this.room.storage
    var terminal=this.room.terminal
    var inputLab1=Game.getObjectById(global.heap.rooms[this.room.name].inLab1Id)
    var inputLab2=Game.getObjectById(global.heap.rooms[this.room.name].inLab2Id)
    var outputLabs=[]
    for(outputId in global.heap.rooms[this.room.name].outLabsId)
    {
        var outputLab=Game.getObjectById(outputId)
        if(outputLab!=null)
        {
            outputLabs.push(outputLab)
        }
    }

    var boostingLab=Game.getObjectById(global.heap.rooms[this.room.name].inLab2Id)

    if(storage==null || terminal==null || inputLab1==null || inputLab2==null || outputLabs.length==0)
    {
        return
    }

    //raw taking from terminal
    //storing everything in storage

    //storage
    // terminal
    // inputLab1
    // inputLab2
    // boostingLab
    // outputLabs

    // filling input labs energy
    //filling input labs minerals-- when they are empty/(close to empty and match reaction)
    // clearing input labs -- one of them empty 
    // taking stuff from output labs -- 


    if(global.heap.rooms[this.room.name].doctorTask==undefined)
    {

        if(this.store.getCapacity()!=this.store.getFreeCapacity(RESOURCE_ENERGY))
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_CREEP
        }
        else if(inputsNeedEnergy(inputLab1,inputLab2)==1)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LAB_1_ENERGY
        }
        else if(inputsNeedEnergy(inputLab1,inputLab2)==2)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LAB_2_ENERGY
        }
        else if(global.heap.rooms[this.room.name].boostingRequests.length>0)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_BOOST_CREEP
        }
        else if(ifBothInputMineralEmpty(inputLab1,inputLab2)==true)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LABS
        }
        else if(oneInputMineralEmpty(inputLab1,inputLab2)==true)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_INPUT_LABS
        }
        else{
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_OUTPUT_LABS
        }

    }


    if(global.heap.rooms[this.room.name].doctorTask!=undefined)
    {
        if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_CREEP)
        {
            this.taskClearCreep()
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LAB_1_ENERGY)
        {
            this.taskFillInputLabEnergy(inputLab1)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LAB_2_ENERGY)
        {
            this.taskFillInputLabEnergy(inputLab2)
        }/*
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_BOOST_CREEP)
        {

        }*/
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LABS)
        {
            this.taskFillInputLabsMineral(inputLab1,inputLab2)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_INPUT_LABS)
        {
            this.taskClearInputLabs(inputLab1,inputLab2)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_OUTPUT_LABS)
        {
            this.taskClearOutputLabs()
        }
    }
}

function oneInputMineralEmpty(in1,in2)
{
    var in1Empty=true
    var in2Empty=true
    for(res in in1.store)
    {
        if(res!=RESOURCE_ENERGY)
        {
            in1Empty= false
            break
        }
    }
    for(res in in2.store)
    {
        if(res!=RESOURCE_ENERGY)
        {
            in2Empty= false
            break
        }
    }
    if(in1Empty!=in2Empty)
    {
        return true
    }
    return false

}

function ifBothInputMineralEmpty(in1,in2)
{

    for(res in in1.store)
    {
        if(res!=RESOURCE_ENERGY)
        {
            return false
        }
    }
    for(res in in2.store)
    {
        if(res!=RESOURCE_ENERGY)
        {
            return false
        }
    }
    return true
}

function inputsNeedEnergy(in1,in2)
{
     if(in1.store.getUsedCapacity(RESOURCE_ENERGY)<LAB_ENERGY_CAPACITY/2)
     {
        return 1
     }
     else if(in2.store.getUsedCapacity(RESOURCE_ENERGY)<LAB_ENERGY_CAPACITY/2)
     {
        return 2
     }
     else 
     {
        return false
     }
}