
const C = require('constants');
Room.prototype.roomReaction = function roomReaction() {

    var storage=undefined
    if(this.storage==undefined)
    {
        return false
    }
    else{
        storage=this.storage
    }
    if (storage.store["XGH2O"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //1 upgrade controller boost
        if (storage.store["GH2O"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["GH2O", "X"]
        }
        else if (storage.store["GH"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["GH2O"]<C.REACTION_STEP*2) {
            return ["GH", "OH"]
        }
        else if (storage.store["G"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP && storage.store["GH"]<C.REACTION_STEP*2) {
            return ["G", "H"]
        }
        else if (storage.store["O"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["O", "H"]
        }
        else if (storage.store["ZK"] > C.REACTION_STEP && storage.store["UL"] > C.REACTION_STEP && storage.store["G"]<C.REACTION_STEP*2) {
            return ["ZK", "UL"]
        }
        else if (storage.store["Z"] > C.REACTION_STEP && storage.store["K"] > C.REACTION_STEP && storage.store["ZK"]<C.REACTION_STEP*2) {
            return ["Z", "K"]
        }
        else if (storage.store["U"] > C.REACTION_STEP && storage.store["L"] > C.REACTION_STEP && storage.store["UL"]<C.REACTION_STEP*2) {
            return ["U", "L"]
        }
    }


    // Ghodium for nuker
    if(this.terminal!=undefined && storage.store["G"]+this.terminal.store["G"]<NUKER_GHODIUM_CAPACITY)
    {
        if (storage.store["ZK"] > C.REACTION_STEP && storage.store["UL"] > C.REACTION_STEP) {
            return ["ZK", "UL"]
        }
        else if (storage.store["Z"] > C.REACTION_STEP && storage.store["K"] > C.REACTION_STEP && storage.store["ZK"]<C.REACTION_STEP*2) {
            return ["Z", "K"]
        }
        else if (storage.store["U"] > C.REACTION_STEP && storage.store["L"] > C.REACTION_STEP && storage.store["UL"]<C.REACTION_STEP*2) {
            return ["U", "L"]
        }
    }
    
    if(storage.store["XKHO2"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //2 ranged attack
        if (storage.store["KHO2"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP ) {
            return ["KHO2", "X"]
        }
        else if (storage.store["KO"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP  && storage.store["KHO2"]<C.REACTION_STEP*2) {
            return ["KO", "OH"]
        }
        else if (storage.store["K"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["KO"]<C.REACTION_STEP*2) {
            return ["K", "O"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if(storage.store["XLHO2"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //3 heal
        if (storage.store["LHO2"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["LHO2", "X"]
        }
        else if (storage.store["LO"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["LHO2"]<C.REACTION_STEP*2) {
            return ["LO", "OH"]
        }
        else if (storage.store["L"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP && storage.store["LO"]<C.REACTION_STEP*2) {
            return ["L", "O"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if(storage.store["XLH2O"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //9 REPAIR
        if (storage.store["LH2O"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["LH2O", "X"]
        }
        else if (storage.store["LH"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["LH2O"]<C.REACTION_STEP*2) {
            return ["LH", "OH"]
        }
        else if (storage.store["L"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP && storage.store["LH"]<C.REACTION_STEP*2) {
            return ["L", "H"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if (storage.store["XGHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //4 tough
        if (storage.store["GHO2"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["GHO2", "X"]
        }
        else if (storage.store["GO"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["GHO2"]<C.REACTION_STEP*2) {
            return ["GO", "OH"]
        }
        else if (storage.store["G"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP && storage.store["GO"]<C.REACTION_STEP*2) {
            return ["G", "O"]
        }
        else if (storage.store["O"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["O", "H"]
        }
        else if (storage.store["ZK"] > C.REACTION_STEP && storage.store["UL"] > C.REACTION_STEP && storage.store["G"]<C.REACTION_STEP*2) {
            return ["ZK", "UL"]
        }
        else if (storage.store["Z"] > C.REACTION_STEP && storage.store["K"] > C.REACTION_STEP && storage.store["ZK"]<C.REACTION_STEP*2) {
            return ["Z", "K"]
        }
        else if (storage.store["U"] > C.REACTION_STEP && storage.store["L"] > C.REACTION_STEP && storage.store["UL"]<C.REACTION_STEP*2) {
            return ["U", "L"]
        }
    }

    if(storage.store["XUH2O"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //5 Attack
        if (storage.store["UH2O"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["UH2O", "X"]
        }
        else if (storage.store["UH"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["UH2O"]<C.REACTION_STEP*2) {
            return ["UH", "OH"]
        }
        else if (storage.store["U"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP && storage.store["UH"]<C.REACTION_STEP*2) {
            return ["U", "H"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if(storage.store["XZHO2"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //6 MOVE
        if (storage.store["ZHO2"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["ZHO2", "X"]
        }
        else if (storage.store["ZO"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP  && storage.store["ZHO2"]<C.REACTION_STEP*2) {
            return ["ZO", "OH"]
        }
        else if (storage.store["Z"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["ZO"]<C.REACTION_STEP*2) {
            return ["Z", "O"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if(storage.store["XKH2O"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //7 CAPACITY
        if (storage.store["KH2O"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP ) {
            return ["KH2O", "X"]
        }
        else if (storage.store["KH"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["KH2O"]<C.REACTION_STEP*2) {
            return ["KH", "OH"]
        }
        else if (storage.store["K"] > C.REACTION_STEP && storage.store["H"] > C.REACTION_STEP && storage.store["KH"]<C.REACTION_STEP*2) {
            return ["K", "H"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }

    if(storage.store["XUHO2"]<C.MIN_ECONOMIC_BOOST_AMOUNT){ //8 HARVEST
        if (storage.store["UHO2"] > C.REACTION_STEP && storage.store["X"] > C.REACTION_STEP) {
            return ["UHO2", "X"]
        }
        else if (storage.store["UO"] > C.REACTION_STEP && storage.store["OH"] > C.REACTION_STEP && storage.store["UHO2"]<C.REACTION_STEP*2) {
            return ["UO", "OH"]
        }
        else if (storage.store["U"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP && storage.store["UO"]<C.REACTION_STEP*2) {
            return ["U", "O"]
        }
        else if (storage.store["H"] > C.REACTION_STEP && storage.store["O"] > C.REACTION_STEP  && storage.store["OH"]<C.REACTION_STEP*2) {
            return ["H", "O"]
        }
    }


}