function quadHealerBody(cap)// return array with max possible work parts for hauler
{
    var parts=[];
    if(cap>7400)
    {
        cap=7400;
    }

    parts.push(RANGED_ATTACK);
    parts.push(MOVE);
    parts.push(MOVE);
    parts.push(HEAL);
    cap-=500;
    
    for(let i=0;i<Math.floor(cap/300);i++)
    {
        parts.push(MOVE);
        parts.push(HEAL);
    }
    
    return parts;
}
module.exports = quadHealerBody;