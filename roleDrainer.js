const C=require('constants')

Creep.prototype.roleDrainer=function roleDrainer()
{
    this.say("D")

    this.heal()
    if(this.room.name!=this.memory.targetRoom && this.hits==this.hitsMax)
    {
        if(this.memory.targetRoom!=undefined)
        {
            this.travelTo(new RoomPosition(25,25,this.memory.targetRoom))
        }
        
        
    }
    else{
        if(this.hits<this.hitsMax )
        {
            this.travelTo(new RoomPosition(25,25,this.memory.homeRoom))
        }
    }
}