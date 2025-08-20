const C=require('constants');
const { glob } = require('fs');



StructureTerminal.prototype.buyResource=function buyResource(res, amount) {
    if (res == undefined) {
        return false;
    }

    var buyResult = null
    //console.log("i have storage");
    bestPrice = 0
    var bestOrderId = undefined
    const resourceOrders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: res }) // fast
    if (resourceOrders != undefined && resourceOrders.length > 0) {
        bestOrderId = resourceOrders[0].id
    }
    for (let i = 1; i < resourceOrders.length; i++) {
        //console.log(i)
        var tradeAmount = Math.min(amount, resourceOrders[i].amount)
        var transferCost = Game.market.calcTransactionCost(tradeAmount, resourceOrders[i].roomName, this.room.name)
        var price = (resourceOrders[i].price * tradeAmount) + transferCost
        //console.log("Profit: ",profit);
        var pricePerUnit = price * tradeAmount
        //console.log("profit per unit: ", profitPerUnit);
        if (pricePerUnit < bestPrice) {
            bestPrice = pricePerUnit
            bestOrderId = resourceOrders[i].id
        }
    }
    if (bestOrderId != undefined) {

        var tradeAmount = Math.min(amount, Game.market.getOrderById(bestOrderId).amount)
        var transferCost = Game.market.calcTransactionCost(tradeAmount, Game.market.getOrderById(bestOrderId).roomName,
            this.room.name)
        var price = (Game.market.getOrderById(bestOrderId).price * tradeAmount) - transferCost
        var pricePerUnit = price / tradeAmount
        if (pricePerUnit < 2000) {
            buyResult = Game.market.deal(bestOrderId, tradeAmount, this.room.name)

        }

    }
    return buyResult
}

StructureTerminal.prototype.sellResource=function sell_resource(res,amount) {

    if (res == undefined) {
        return;
    }
    var sellResult=null;

    biggestProfitAmount = 0
    var bestOrderId = undefined
    const sellOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: res }) // fast
    if (sellOrders != undefined && sellOrders.length > 0) {
        bestOrderId = sellOrders[0].id
    }
    for (let i = 1; i < sellOrders.length; i++) {
        var tradeAmount = Math.min(amount, sellOrders[i].amount)
        var cost = Game.market.calcTransactionCost(tradeAmount, sellOrders[i].roomName, spawn.room.name)
        var profit = (sellOrders[i].price * tradeAmount) - cost
        var profitPerUnit = profit / tradeAmount
        if (profitPerUnit > biggestProfitAmount) {
            biggestProfitAmount = profitPerUnit
            bestOrderId = sellOrders[i].id
        }
    }
    //console.log("best order id: ",bestOrderId)
    if (bestOrderId != undefined) {

        //onsole.log("best offer: ",bestOrderId);
        var tradeAmount = Math.min(terminal.store[res], Game.market.getOrderById(bestOrderId).amount)
        tradeAmount = 1000
        var cost = Game.market.calcTransactionCost(tradeAmount, Game.market.getOrderById(bestOrderId).roomName,
            spawn.room.name)
        var profit = (Game.market.getOrderById(bestOrderId).price * tradeAmount) - cost
        var profitPerUnit = profit / tradeAmount
        //console.log("profit per unit: ",profitPerUnit)
        if (profitPerUnit > 10 || true) {
            sellResult= Game.market.deal(bestOrderId, tradeAmount, this.room.name)
        }

    }
    return sellResult
}


Room.prototype.terminalManager = function terminalManager() {
    if (this.terminal == undefined || (this.terminal!=undefined && this.terminal.cooldown!=0)) {
        return
    }

    //Sharing T3 Military Boosts
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (boost of global.heap.rooms[this.name].excessT3MilitaryBoosts) {
                if (global.heap.rooms[m].needT3MilitaryBoosts==boost) {
                    resourceToShare=boost;
                    roomToShareWith=m;
                    break
                }
            }
        }
    }
    if(resourceToShare!=null && roomToShareWith!=null)
    {
        var sendResult=this.terminal.send(resourceToShare,C.RESOURCE_SHARE_AMOUNT,roomToShareWith)
        if(sendResult==OK)
        {
            return;
        }
    }

    
    //Sharing T3 Economic Boosts
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (boost of global.heap.rooms[this.name].excessT3EconomicBoost) {
                if (global.heap.rooms[m].needT3EconomicBoosts==boost) {
                    resourceToShare=boost;
                    roomToShareWith=m;
                    break
                }
            }
        }
    }
    if(resourceToShare!=null && roomToShareWith!=null)
    {
        var sendResult=this.terminal.send(resourceToShare,C.RESOURCE_SHARE_AMOUNT,roomToShareWith)
        if(sendResult==OK)
        {
            return;
        }
    }

    
    //Sharing raw resources
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (res of global.heap.rooms[this.name].excessRawResources) {
                if (global.heap.rooms[m].needRawResources==res) {
                    resourceToShare=res;
                    roomToShareWith=m;
                    break
                }
            }
        }
    }
    if(resourceToShare!=null && roomToShareWith!=null)
    {
        var sendResult=this.terminal.send(resourceToShare,C.RESOURCE_SHARE_AMOUNT,roomToShareWith)
        if(sendResult==OK)
        {
            return;
        }
    }


    //Selling Raw Resources
    for(res of global.heap.rooms[this.name].excessRawResources)
    {
        if(this.terminal.sellResource(res,C.RAW_RES_SELL_AMOUNT)==OK)
        {
            return
        }
    }

    //


    //Buying Raw Resources
    for(res of global.heap.rooms[this.name].needRawResources)
    {
        if(this.terminal.buyResource(res,C.RAW_RES_BUY_AMOUNT)==OK)
        {
            return;
        }
    }
}