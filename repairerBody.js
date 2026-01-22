const C = require("./constants");

function repairerBody(cap,maxBodyParts=C.CREEP_MAX_BODYPARTS)// return array with max possible work parts for builder
{
    var parts=[];

    while(cap>BODYPART_COST[MOVE]+BODYPART_COST[CARRY]+BODYPART_COST[WORK] && parts.length<C.CREEP_MAX_BODYPARTS-3
        
    )
    {
        if(parts.length>=maxBodyParts)
        {
            return parts
        }
        parts.push(MOVE)
        cap-=BODYPART_COST[MOVE]
        parts.push(CARRY)
        cap-=BODYPART_COST[CARRY]
        parts.push(WORK)
        cap-=BODYPART_COST[WORK]


    }
    return parts;
}
module.exports = repairerBody;