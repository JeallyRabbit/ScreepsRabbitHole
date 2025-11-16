

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
}