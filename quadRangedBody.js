function quadRangedBody(cap)// return array with max possible work parts for hauler
{
    var parts = [];
    if (cap > 6300) {
        cap = 6300;
    }
    
    parts.push(MOVE);
    parts.push(RANGED_ATTACK);
    parts.push(MOVE);
    parts.push(HEAL);
    setCost=BODYPART_COST[RANGED_ATTACK]+BODYPART_COST[HEAL]+(2*BODYPART_COST[MOVE])
    cap -= setCost;

    for (let i = 0; i < Math.floor(cap / setCost); i++) {
        parts.push(MOVE);
        parts.push(RANGED_ATTACK);
        parts.push(MOVE);
        parts.push(HEAL);
    }
    cap-= Math.floor(cap / setCost)*setCost
    if(cap>=300)
    {
        parts.push(MOVE)
        parts.push(HEAL)
    }
    return parts;
}
module.exports = quadRangedBody;