const C=require('constants')

function drainerBody(cap)
{
    var body=[]
    var startingSegment=[ATTACK,MOVE,HEAL,MOVE]
    var startingCost=0
    
    for(part of startingSegment)
    {
        startingCost+=BODYPART_COST[part]
        body.push(part)
    }
    cap-=startingCost
    for(var i=0;i<cap-(BODYPART_COST[MOVE]+BODYPART_COST[TOUGH]);i++)
    {
        body.push(MOVE)
    }

    for(var i=0;i<cap-(BODYPART_COST[MOVE]+BODYPART_COST[TOUGH]);i++)
    {
        body.push(TOUGH)
    }
    body.reverse();
    return body
}
module.exports = drainerBody