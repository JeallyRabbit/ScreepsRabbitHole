const C = require('constants');
const { RESOURCE_SHARE_AMOUNT } = require('./constants');



StructureTerminal.prototype.buyResource = function buyResource(res, amount) {
    if (res == undefined) {
        return false;
    }

    var buyResult = null
    bestPrice = 0
    var bestOrderId = undefined
    const resourceOrders = Game.market.getAllOrders({ type: ORDER_SELL, resourceType: res }) // fast
    if (resourceOrders != undefined && resourceOrders.length > 0) {
        bestOrderId = resourceOrders[0].id
    }
    for (let i = 1; i < resourceOrders.length; i++) {
        var tradeAmount = Math.min(amount, resourceOrders[i].amount)
        var transferCost = Game.market.calcTransactionCost(tradeAmount, resourceOrders[i].roomName, this.room.name)
        var price = (resourceOrders[i].price * tradeAmount) + transferCost
        var pricePerUnit = price * tradeAmount
        if (res == RESOURCE_ENERGY) {
            if (pricePerUnit < bestPrice && tradeAmount > transferCost*2) {
                bestPrice = pricePerUnit
                bestOrderId = resourceOrders[i].id
            }
        }
        else {
            if (pricePerUnit < bestPrice) {
                bestPrice = pricePerUnit
                bestOrderId = resourceOrders[i].id
            }
        }

    }
    if (bestOrderId != undefined) {

        var tradeAmount = Math.min(amount, Game.market.getOrderById(bestOrderId).amount)
        var transferCost = Game.market.calcTransactionCost(tradeAmount, Game.market.getOrderById(bestOrderId).roomName,
            this.room.name)
        var price = (Game.market.getOrderById(bestOrderId).price * tradeAmount) - transferCost
        var pricePerUnit = price / tradeAmount
        if (pricePerUnit < 2000) {
            if (res == RESOURCE_ENERGY) {
                if (tradeAmount > transferCost) {
                    buyResult = Game.market.deal(bestOrderId, tradeAmount, this.room.name)

                }
            }
            else {
                buyResult = Game.market.deal(bestOrderId, tradeAmount, this.room.name)

            }

        }

    }
    return buyResult
}

StructureTerminal.prototype.sellResource = function sellResource(res, amount) {

    if (res == undefined) {
        return;
    }
    var sellResult = null;

    biggestProfitAmount = 0
    var bestOrderId = undefined
    const sellOrders = Game.market.getAllOrders({ type: ORDER_BUY, resourceType: res }) // fast
    if (sellOrders != undefined && sellOrders.length > 0) {
        bestOrderId = sellOrders[0].id
    }
    for (let i = 1; i < sellOrders.length; i++) {
        var tradeAmount = Math.min(amount, sellOrders[i].amount)
        var cost = Game.market.calcTransactionCost(tradeAmount, sellOrders[i].roomName, this.room.name)
        var profit = (sellOrders[i].price * tradeAmount) - cost
        var profitPerUnit = profit / tradeAmount
        if (profitPerUnit > biggestProfitAmount) {
            biggestProfitAmount = profitPerUnit
            bestOrderId = sellOrders[i].id
        }
    }
    if (bestOrderId != undefined) {

        var tradeAmount = Math.min(this.store[res], Game.market.getOrderById(bestOrderId).amount)
        tradeAmount = 1000
        var cost = Game.market.calcTransactionCost(tradeAmount, Game.market.getOrderById(bestOrderId).roomName,
            this.room.name)
        var profit = (Game.market.getOrderById(bestOrderId).price * tradeAmount) - cost
        var profitPerUnit = profit / tradeAmount
        if (profitPerUnit > 10 || true) {
            sellResult = Game.market.deal(bestOrderId, tradeAmount, this.room.name)
        }

    }
    return sellResult
}


Room.prototype.terminalManager = function terminalManager() {
    if (this.storage==undefined || this.terminal == undefined || (this.terminal != undefined && this.terminal.cooldown != 0)
        || Game.time % 5 != 0) {
        return
    }
    //Sharing T3 Military Boosts
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (boost of global.heap.rooms[this.name].excessT3MilitaryBoosts) {
                if (global.heap.rooms[m].needT3MilitaryBoosts == boost) {
                    resourceToShare = boost;
                    roomToShareWith = m;
                    break
                }
            }
        }
    }
    if (resourceToShare != null && roomToShareWith != null) {
        var sendResult = this.terminal.send(resourceToShare, C.RESOURCE_SHARE_AMOUNT, roomToShareWith)
        if (sendResult == OK) {
            return;
        }
    }


    //Sharing T3 Economic Boosts
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (boost of global.heap.rooms[this.name].excessT3EconomicBoost) {
                if (global.heap.rooms[m].needT3EconomicBoosts == boost) {
                    resourceToShare = boost;
                    roomToShareWith = m;
                    break
                }
            }
        }
    }
    if (resourceToShare != null && roomToShareWith != null) {
        var sendResult = this.terminal.send(resourceToShare, C.RESOURCE_SHARE_AMOUNT, roomToShareWith)
        if (sendResult == OK) {
            return;
        }
    }

    //Sharing raw resources
    var resourceToShare = null
    var roomToShareWith = null
    for (m of Memory.mainRooms) {
        if (m != this.name && Game.rooms[m].terminal != undefined) {
            for (res of global.heap.rooms[this.name].excessRawResources) {
                if (global.heap.rooms[m].needRawResources == res) {
                    resourceToShare = res;
                    roomToShareWith = m;
                    break
                }
            }
        }
    }
    if (resourceToShare != null && roomToShareWith != null) {
        var sendResult = this.terminal.send(resourceToShare, C.RESOURCE_SHARE_AMOUNT, roomToShareWith)
        if (sendResult == OK) {
            return;
        }
    }

    //Selling Raw Resources
    for (res of global.heap.rooms[this.name].excessRawResources) {
        
        var result=this.terminal.sellResource(res, C.RAW_RES_SELL_AMOUNT) 
        if (result== OK) {
            return
        }
        
    }

    //


    //Buying Raw Resources
    for (res of global.heap.rooms[this.name].needRawResources) {
        if (this.terminal.buyResource(res, C.RAW_RES_BUY_AMOUNT) == OK) {
            return;
        }
    }


    //Sharing energy to STATE_NEED_ENERGY
    var closestNeedingEnergy=undefined
    var distance=Infinity
    for(m of Memory.mainRooms)
    {
        if(m==this.name){continue}
        if(this.storage.store[RESOURCE_ENERGY]<C.STORAGE_ENERGY_BOTTOM || this.terminal.store[RESOURCE_ENERGY]<C.RESOURCE_SHARE_AMOUNT)
        {
            break;
        }
        if(global.heap.rooms[m].state.includes(C.STATE_NEED_ENERGY) && Game.map.getRoomLinearDistance(m,this.name)<distance)
        {
            closestNeedingEnergy=m;
            distance=Game.map.getRoomLinearDistance(m,this.name)
        }

    }
    if(closestNeedingEnergy!=undefined)
    {
        var result=this.terminal.send(RESOURCE_ENERGY, C.RESOURCE_SHARE_AMOUNT, closestNeedingEnergy)
    }


    
    //Sharing energy to fastRclUpgrade
    if (Memory.fastRclUpgrade != undefined && Memory.fastRclUpgrade != this.name
        && global.heap.rooms[this.name].building==true
        && this.storage!=undefined && this.storage.store[RESOURCE_ENERGY]>C.STORAGE_ENERGY_BOTTOM
        && this.terminal!=undefined && this.terminal.store[RESOURCE_ENERGY]>C.TERMINAL_BOTTOM_ENERGY
    ) {
        if (this.terminal.send(RESOURCE_ENERGY, C.RESOURCE_SHARE_AMOUNT, Memory.fastRclUpgrade) == OK) {
            return;
        }
    }

    if (this.terminal.store[RESOURCE_ENERGY] < C.TERMINAL_BOTTOM_ENERGY
        && this.storage.store[RESOURCE_ENERGY]<C.STORAGE_ENERGY_BUY_BOTTOM
    ) {
        let result = this.terminal.buyResource(RESOURCE_ENERGY, C.RAW_RES_BUY_AMOUNT)
        if (result == OK) {
            return;
        }
    }
}