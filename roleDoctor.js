const C=require('constants')

Creep.prototype.roleDoctor = function roleDoctor() {

    this.say("D")
    var storage=this.room.storage
    var terminal=this.room.terminal
    var inputLab1=Game.getObjectById(Game.rooms[this.room.name].memory.inLab1Id)
    var inputLab2=Game.getObjectById(Game.rooms[this.room.name].memory.inLab2Id)
    var outputLabs=[]
    for(outputId of global.heap.rooms[this.room.name].outLabsId)
    {
        var outputLab=Game.getObjectById(outputId)
        if(outputLab!=null)
        {
            outputLabs.push(outputLab)
        }
    }

    var boostingLab=Game.getObjectById(Game.rooms[this.room.name].memory.boostingLabId)

    
    console.log("storage: ",storage)
    console.log("terminal: ",terminal)
    console.log("inputLab1: ",inputLab1)
    console.log("inputLab2: ",inputLab2)
    console.log("outputLabs: ",outputLabs.length)
    console.log("boostingLab: ",boostingLab)
    if(storage==null || terminal==null || inputLab1==null || inputLab2==null || outputLabs.length==0
        || boostingLab==null
    )
    {
        this.say("error")
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
    console.log("ifBothInputMineralEmpty(inputLab1,inputLab2): ",this.room.ifBothInputMineralEmpty(inputLab1,inputLab2))

    if(global.heap.rooms[this.room.name].doctorTask==undefined)
    {

        if(this.store.getCapacity()!=this.store.getFreeCapacity(RESOURCE_ENERGY))
        {
            this.say("1")
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_CREEP
        }
        //
        else if(anyLabNeedEnergy(this.room.name)!=false)
        {
            this.say("2")
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_LAB_ENERGY
            global.heap.rooms[this.room.name].labNeedEnergyId=anyLabNeedEnergy(this.room.name)
        }
        //changed to any need energy (above)
        /*
        else if(inputsNeedEnergy(inputLab1,inputLab2)==1)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LAB_1_ENERGY
        }
        else if(inputsNeedEnergy(inputLab1,inputLab2)==2)
        {
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LAB_2_ENERGY
        }
            */
        else if(global.heap.rooms[this.room.name].boostingRequests.length>0)
        {
            this.say("3")
            global.heap.rooms[this.room.name].doctorTask=C.TASK_BOOST_CREEP
        }
        else if(this.room.ifBothInputMineralEmpty(inputLab1,inputLab2)==true)
        {
            this.say(C.TASK_FILL_INPUT_LABS_MINERAL)
            global.heap.rooms[this.room.name].doctorTask=C.TASK_FILL_INPUT_LABS_MINERAL
        }
        else if(this.room.oneInputMineralEmpty(inputLab1,inputLab2)==true)
        {
            this.say("5")
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_INPUT_LABS
        }
        else{
            this.say("6")
            global.heap.rooms[this.room.name].doctorTask=C.TASK_CLEAR_OUTPUT_LABS
        }

    }


    if(global.heap.rooms[this.room.name].doctorTask!=undefined)
    {
        if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_CREEP)
        {
            this.taskClearCreep()
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_LAB_ENERGY)
        {
            this.taskFillLabEnergy(global.heap.rooms[this.room.name].labNeedEnergyId)
        }
        /*
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LAB_1_ENERGY)
        {
            this.taskFillInputLabEnergy(inputLab1)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LAB_2_ENERGY)
        {
            this.taskFillInputLabEnergy(inputLab2)
        }*/
       /*
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_BOOST_CREEP)
        {

        }*/
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_FILL_INPUT_LABS_MINERAL)
        {
            this.say("fill in")
            this.taskFillInputLabsMineral(inputLab1,inputLab2)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_INPUT_LABS)
        {
            this.taskClearInputLabs(inputLab1,inputLab2)
        }
        else if(global.heap.rooms[this.room.name].doctorTask==C.TASK_CLEAR_OUTPUT_LABS)
        {
            this.taskClearOutputLabs(inputLab1,inputLab2)
        }
    }
}

Room.prototype.oneInputMineralEmpty=function oneInputMineralEmpty(in1,in2)
{
    var in1Empty=true
    var in2Empty=true

    var res1=1
    var res2=0
    for(res in in1.store)
    {
        if(res!=RESOURCE_ENERGY && in1.store[res]>LAB_REACTION_AMOUNT)
        {
            res1=res
            in1Empty= false
            break
        }
    }
    for(res in in2.store)
    {
        if(res!=RESOURCE_ENERGY && in2.store[res]>LAB_REACTION_AMOUNT)
        {
            res2=res
            in2Empty= false
            break
        }
    }
    if(in1Empty!=in2Empty || res1==res2)
    {
        return true
    }
    return false

}

Room.prototype.ifBothInputMineralEmpty=function ifBothInputMineralEmpty(in1,in2)
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

function anyLabNeedEnergy(roomName)
{
    for(id of global.heap.rooms[roomName].myLabs)
    {
        var lab=Game.getObjectById(id)
        if(lab.store[RESOURCE_ENERGY]<LAB_ENERGY_CAPACITY/2)
        {
            return id
        }
    }
    return false
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