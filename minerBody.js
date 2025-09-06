function minerBody(cap)
{
    var parts=[]
    segmentCost=(BODYPART_COST[CARRY]*2)+(BODYPART_COST[WORK]*5)+(BODYPART_COST[MOVE]*1)
    var segmentLength=9
    while(cap>=segmentCost && parts.length+segmentLength<=50)
    {
        parts.push(CARRY)
        parts.push(CARRY)

        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)
        parts.push(WORK)
        parts.push(MOVE)

        cap-=segmentCost

    }
    return parts;
}
module.exports = minerBody