

Room.prototype.labsManager= function labsManager()
{
    if(global.heap.rooms[this.name].inLab1Id==undefined || global.heap.rooms[this.name].inLab2Id==undefined || global.heap.rooms[this.name].outLabsId.length==0)
    {
        return
    }
    var in1=Game.getObjectById(global.heap.rooms[this.name].inLab1Id)
    var in2=Game.getObjectById(global.heap.rooms[this.name].inLab2Id)

    var outputs=[]
    for(id of global.heap.rooms[this.name].outLabsId)
    {
        var out = Game.getObjectById(id)
        if(out!=null)
        {
            outputs.push(out)
        }
    }
    for(out of outputs)
    {
        
        out.runReaction(in1, in2)
    }



    var boostingLab=Game.getObjectById(global.heap.rooms[this.name].boostingLabId)
    if(boostingLab!=null)
    {
        if(global.heap.rooms[this.name].boostingRequests.length>0)
        {
            for(r of global.heap.rooms[this.name].boostingRequests)
            {
                var creepToBoost=Game.getObjectById(r.creepId)
                if(creepToBoost!=null)
                {
                    var boostResult=boostingLab.boostCreep(creepToBoost,r.amount/LAB_BOOST_MINERAL)
                    if(boostResult==OK)
                    {
                        global.heap.rooms[this.name].boostingRequests.shift()
                    }
                }
                
                break;
            }
        }
    }
}