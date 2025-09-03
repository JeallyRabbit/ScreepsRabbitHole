const C=require('constants')

function drainerBody(cap)
{
    var body=[]
    var startingSegment=[ATTACK,MOVE,HEAL,MOVE]
    var startingCost=0
    
    for(part of startingSegment)
    {
        startingCost+=BODYPART_COST[part]
    }
    body+=startingSegment
    cap-=startingCost
    while (cap>0 && body.length<C.CREEP_MAX_BODYPARTS-2)
    {
        body.push(MOVE)
        body.push(TOUGH)
        cap-=BODYPART_COST[MOVE]
        cap-=BODYPART_COST[TOUGH]
    }

    return body
}
module.exports = drainerBody