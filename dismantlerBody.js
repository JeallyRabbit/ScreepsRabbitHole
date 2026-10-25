function dismantlerBody(cap,)// return array with max possible work parts for builder
{
    var parts=[];

    //cap is max amount of energy that can be spent on body
    for(let i=0;i<Math.min(cap/(BODYPART_COST[MOVE]+(BODYPART_COST[WORK])),25);i++)
    {
        parts.push(MOVE)
        parts.push(WORK)
    }
    
    return parts;
}
module.exports = dismantlerBody;