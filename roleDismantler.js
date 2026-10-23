const C = require('constants')

Creep.prototype.roleDismantler = function roleDismantler() {
    
     
    if(this.room.name!=this.memory.targetRoom)
    {
        this.travelTo(new RoomPosition(25,25,this.memory.targetRoom))
    }
    else{
        if(this.memory.targetStructureId!=undefined)
        {
            if(Game.getObjectById(this.memory.targetStructureId)==null)
            {
                this.memory.targetStructureId=undefined
            }
        }
        
        if(this.memory.targetStructureId==undefined && global.heap.rooms[this.room.name].hostileStructures!=undefined)
        {
            this.memory.targetStructureId=this.pos.findClosestByPath(global.heap.rooms[this.room.name].hostileStructures).id
        }


        if(this.memory.targetStructureId!=undefined)
        {
            str=Game.getObjectById(this.memory.targetStructureId)
            if(str!=null && this.dismantle(str)==ERR_NOT_IN_RANGE)
            {
                this.travelTo(str)
            }
        }
    }
    
}