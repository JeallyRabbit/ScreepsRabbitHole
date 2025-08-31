
const C = require('constants');
Room.prototype.roomReaction = function roomReaction() {

    var myStorage = global.heap.rooms[this.name].myStorage

    

    if (myStorage["XGH2O"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //1 upgrade controller boost
        if (myStorage["GH2O"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["GH2O", "X"]
        }
        else if (myStorage["GH"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["GH2O"] < C.REACTION_STEP * 2) {
            return ["GH", "OH"]
        }
        else if (myStorage["G"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["GH"] < C.REACTION_STEP * 2) {
            return ["G", "H"]
        }
        else if (myStorage["O"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["O", "H"]
        }
        else if (myStorage["ZK"] > C.REACTION_STEP && myStorage["UL"] > C.REACTION_STEP && myStorage["G"] < C.REACTION_STEP * 2) {
            return ["ZK", "UL"]
        }
        else if (myStorage["Z"] > C.REACTION_STEP && myStorage["K"] > C.REACTION_STEP && myStorage["ZK"] < C.REACTION_STEP * 2) {
            return ["Z", "K"]
        }
        else if (myStorage["U"] > C.REACTION_STEP && myStorage["L"] > C.REACTION_STEP && myStorage["UL"] < C.REACTION_STEP * 2) {
            return ["U", "L"]
        }
    }


    // Ghodium for nuker
    if (this.terminal != undefined && myStorage["G"] + this.terminal.store["G"] < NUKER_GHODIUM_CAPACITY) {
        if (myStorage["ZK"] > C.REACTION_STEP && myStorage["UL"] > C.REACTION_STEP) {
            return ["ZK", "UL"]
        }
        else if (myStorage["Z"] > C.REACTION_STEP && myStorage["K"] > C.REACTION_STEP && myStorage["ZK"] < C.REACTION_STEP * 2) {
            return ["Z", "K"]
        }
        else if (myStorage["U"] > C.REACTION_STEP && myStorage["L"] > C.REACTION_STEP && myStorage["UL"] < C.REACTION_STEP * 2) {
            return ["U", "L"]
        }
    }

    if (myStorage["XKHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //2 ranged attack
        if (myStorage["KHO2"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["KHO2", "X"]
        }
        else if (myStorage["KO"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["KHO2"] < C.REACTION_STEP * 2) {
            return ["KO", "OH"]
        }
        else if (myStorage["K"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["KO"] < C.REACTION_STEP * 2) {
            return ["K", "O"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XLHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //3 heal
        if (myStorage["LHO2"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["LHO2", "X"]
        }
        else if (myStorage["LO"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["LHO2"] < C.REACTION_STEP * 2) {
            return ["LO", "OH"]
        }
        else if (myStorage["L"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["LO"] < C.REACTION_STEP * 2) {
            return ["L", "O"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XLH2O"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //9 REPAIR
        if (myStorage["LH2O"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["LH2O", "X"]
        }
        else if (myStorage["LH"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["LH2O"] < C.REACTION_STEP * 2) {
            return ["LH", "OH"]
        }
        else if (myStorage["L"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["LH"] < C.REACTION_STEP * 2) {
            return ["L", "H"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XGHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //4 tough
        if (myStorage["GHO2"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["GHO2", "X"]
        }
        else if (myStorage["GO"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["GHO2"] < C.REACTION_STEP * 2) {
            return ["GO", "OH"]
        }
        else if (myStorage["G"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["GO"] < C.REACTION_STEP * 2) {
            return ["G", "O"]
        }
        else if (myStorage["O"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["O", "H"]
        }
        else if (myStorage["ZK"] > C.REACTION_STEP && myStorage["UL"] > C.REACTION_STEP && myStorage["G"] < C.REACTION_STEP * 2) {
            return ["ZK", "UL"]
        }
        else if (myStorage["Z"] > C.REACTION_STEP && myStorage["K"] > C.REACTION_STEP && myStorage["ZK"] < C.REACTION_STEP * 2) {
            return ["Z", "K"]
        }
        else if (myStorage["U"] > C.REACTION_STEP && myStorage["L"] > C.REACTION_STEP && myStorage["UL"] < C.REACTION_STEP * 2) {
            return ["U", "L"]
        }
    }

    if (myStorage["XUH2O"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //5 Attack
        if (myStorage["UH2O"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["UH2O", "X"]
        }
        else if (myStorage["UH"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["UH2O"] < C.REACTION_STEP * 2) {
            return ["UH", "OH"]
        }
        else if (myStorage["U"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["UH"] < C.REACTION_STEP * 2) {
            return ["U", "H"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XZHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //6 MOVE
        if (myStorage["ZHO2"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["ZHO2", "X"]
        }
        else if (myStorage["ZO"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["ZHO2"] < C.REACTION_STEP * 2) {
            return ["ZO", "OH"]
        }
        else if (myStorage["Z"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["ZO"] < C.REACTION_STEP * 2) {
            return ["Z", "O"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XKH2O"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //7 CAPACITY
        if (myStorage["KH2O"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["KH2O", "X"]
        }
        else if (myStorage["KH"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["KH2O"] < C.REACTION_STEP * 2) {
            return ["KH", "OH"]
        }
        else if (myStorage["K"] > C.REACTION_STEP && myStorage["H"] > C.REACTION_STEP && myStorage["KH"] < C.REACTION_STEP * 2) {
            return ["K", "H"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }

    if (myStorage["XUHO2"] < C.MIN_ECONOMIC_BOOST_AMOUNT) { //8 HARVEST
        if (myStorage["UHO2"] > C.REACTION_STEP && myStorage["X"] > C.REACTION_STEP) {
            return ["UHO2", "X"]
        }
        else if (myStorage["UO"] > C.REACTION_STEP && myStorage["OH"] > C.REACTION_STEP && myStorage["UHO2"] < C.REACTION_STEP * 2) {
            return ["UO", "OH"]
        }
        else if (myStorage["U"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["UO"] < C.REACTION_STEP * 2) {
            return ["U", "O"]
        }
        else if (myStorage["H"] > C.REACTION_STEP && myStorage["O"] > C.REACTION_STEP && myStorage["OH"] < C.REACTION_STEP * 2) {
            return ["H", "O"]
        }
    }


}