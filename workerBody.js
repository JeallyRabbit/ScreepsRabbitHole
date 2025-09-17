const C=require('constants')

function workerBody(cap,bodyScheme=[MOVE,CARRY,WORK,WORK])// return array with max possible work parts for builder
{

    var segmentCost=0;
    var bodyLength=0
    for(part of bodyScheme)
    {
        segmentCost+=BODYPART_COST[part]
    }
    var parts=[];
    while(cap>segmentCost && bodyLength+bodyScheme.length<C.CREEP_MAX_BODYPARTS)
    {
        bodyLength+=bodyScheme.length
        for(part of bodyScheme)
        {
            parts.push(part)
        }
        cap-=segmentCost



    }
    
    return parts;
}
module.exports = workerBody;