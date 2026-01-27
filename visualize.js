const C = require('constants');


Room.prototype.visualize = function visualizeroomManager() {


    var blockPosWidth = 4
    var blockPosHeight = 1


    // energyBalance visualization
    if (Game.rooms[this.name].memory.energyBalance != undefined) {
        console.log("energy Balance: ", Game.rooms[this.name].memory.energyBalance)
        //visualize balancing
        Game.rooms[this.name].visual.rect(Game.rooms[this.name].controller.pos.x - (C.BALANCER_HARVEST_LIMIT / 500),
            Game.rooms[this.name].controller.pos.y - 1, (C.BALANCER_HARVEST_LIMIT / 500) * 2, 1, {
            fill: C.FILL_COLOR
        }
        )
        // right is a lot of energy
        Game.rooms[this.name].visual.text('⛏️', Game.rooms[this.name].controller.pos.x + 0.5 + (C.BALANCER_HARVEST_LIMIT / 500), Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('⏫', Game.rooms[this.name].controller.pos.x - 0.5 - (C.BALANCER_HARVEST_LIMIT / 500), Game.rooms[this.name].controller.pos.y - 0.3)
        Game.rooms[this.name].visual.text('🔻', Game.rooms[this.name].controller.pos.x + (Game.rooms[this.name].memory.energyBalance / 500), Game.rooms[this.name].controller.pos.y - 0.3)


    }


    //progress/tick visualization
    if (Game.rooms[this.name].memory.progressSum != undefined && Game.rooms[this.name].memory.progressCounter != undefined) {

        if (Game.time % C.AVG_STEP == 0) {
            Game.rooms[this.name].memory.progressSum = 0;
            Game.rooms[this.name].memory.progressCounter = 0
        }
        var auxText = '⬆️' + (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100) + "/t"
        var blockPos = new RoomPosition(this.controller.pos.x, this.controller.pos.y, this.name)
        blockPosWidth = 4
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(auxText, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        //Game.rooms[this.name].visual.text('⬆️' + (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100) + "/t",
        //    Game.rooms[this.name].controller.pos.x + 1.5, Game.rooms[this.name].controller.pos.y + 1, { color: C.TEXT_COLOR })



        var ttu = (Game.rooms[this.name].controller.progressTotal - Game.rooms[this.name].controller.progress) / (Math.round((Game.rooms[this.name].memory.progressSum / Game.rooms[this.name].memory.progressCounter) * 100) / 100)
        var blockPos = new RoomPosition(this.controller.pos.x - 4, this.controller.pos.y, this.name)
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text('🕓' + Math.round((ttu)), blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    }

    var blockPos = new RoomPosition(38, 1, this.name)
    //Cpu usage visualization
    if (global.heap.rooms[mainRoom].avgCpu != undefined) {

        //avg cpu
        tempAvg = (Math.round((global.heap.rooms[this.name].avgCpu) * 100) / 100)
        blockPos.y += blockPosHeight
        blockPosWidth = 6
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("avgCpu: " + tempAvg, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        //usedCpu
        tempUsed = (Math.round((global.heap.rooms[this.name].usedCpu) * 100) / 100)
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("usedCpu: " + tempUsed, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

        //Bucket
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text("Bucket: " + Game.cpu.bucket, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Memory


    //Heap
    var heapData = Game.cpu.getHeapStatistics()
    blockPos.y += blockPosHeight
    blockPosWidth = 8

    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    var usedHeap = (Math.round((heapData.used_heap_size / 1024) / 1024) * 100) / 100
    this.visual.text("Heap: " + usedHeap + " MB\\" + (Math.round(((heapData.heap_size_limit / 1024) / 1024) * 100) / 100) + " MB", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    blockPos.y += blockPosHeight
    // What spawn1 is spawning
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    var shortenedName = global.heap.rooms[this.name].spawn1Name.substring(0, global.heap.rooms[this.name].spawn1Name.indexOf("_"))
    this.visual.text("Spawn1: " + shortenedName, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    blockPos.y += blockPosHeight
    // What spawn2 is spawning
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    shortenedName = global.heap.rooms[this.name].spawn2Name.substring(0, global.heap.rooms[this.name].spawn2Name.indexOf("_"))
    this.visual.text("Spawn2: " + shortenedName, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    blockPos.y += blockPosHeight
    // What spawn3 is spawning
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    shortenedName = global.heap.rooms[this.name].spawn3Name.substring(0, global.heap.rooms[this.name].spawn3Name.indexOf("_"))
    this.visual.text("Spawn3: " + shortenedName, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    //energyCap below queues
    //var blockPos = new RoomPosition(38, 9, this.name)
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Energy cap: " + this.energyAvailable, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Room States:", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    //state need energy
    for (s of global.heap.rooms[this.name].state) {
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(s, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }




    //Player Name
    var blockPos = new RoomPosition(22, 1, this.name)
    var blockPosWidth = 8
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text(C.USERNAME, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //GCL Data
    var progress = (Math.round((Game.gcl.progress / Game.gcl.progressTotal) * 100))
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("GCL: " + Game.gcl.level + " " + progress + "%", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //Construction sites
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Construction Sites: " + Object.keys(Game.constructionSites).length, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    var sitesRooms = []

    for (c in Game.constructionSites) {

        var cc = Game.getObjectById(c)
        if (cc != null && cc.room!=undefined) {
            const roomName = cc.room.name;

            const room = sitesRooms.find(obj => obj.name === roomName);

            if (!room) {
                sitesRooms.push({ name: roomName, count: 1 });
            } else {
                room.count++;
            }
        }

        //console.log(sitesRooms[0].name+": "+sitesRooms[0].count)
    }

    if (sitesRooms.length > 0) {
        for (r of sitesRooms) {
            blockPos.y += blockPosHeight
            this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.text(r.name + ": " + r.count, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
        }
    }


    //building
    //global.heap.rooms[this.name].construction
    var color = 'red'
    if (global.heap.rooms[this.name].construction != undefined && global.heap.rooms[this.name].construction.length > 0) {
        color = 'green'
    }
    var blockPos = new RoomPosition(44, 2, this.name)
    var blockPosWidth = 1
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: color })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text('🔨', blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //Hauler task
    var tasksVisualizationPos = new RoomPosition(11, 1, this.name)
    var blockPosWidth = 8
    var blockPos = new RoomPosition(tasksVisualizationPos.x, tasksVisualizationPos.y, this.name)
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Hauler task: " + global.heap.rooms[this.name].haulerTask, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
    tasksVisualizationPos.y += blockPosHeight

    //Manager task
    var blockPosWidth = 8
    var blockPos = new RoomPosition(tasksVisualizationPos.x, tasksVisualizationPos.y, this.name)
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Manager task: " + global.heap.rooms[this.name].managerTask, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
    tasksVisualizationPos.y += blockPosHeight

    // what reaction to run
    var blockPosWidth = 8
    var blockPos = new RoomPosition(tasksVisualizationPos.x, tasksVisualizationPos.y, this.name)
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Lab reaction: " + global.heap.rooms[this.name].reaction, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
    tasksVisualizationPos.y += blockPosHeight

    // Doctor task
    var blockPos = new RoomPosition(tasksVisualizationPos.x, tasksVisualizationPos.y, this.name)
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    var task = (global.heap.rooms[this.name].doctorTask != undefined) ? global.heap.rooms[this.name].doctorTask.slice(5) : 'No task'

    this.visual.text("Doc task: " + task, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //harvesting data
    var blockPos = new RoomPosition(3, 1, this.name)
    var blockPosWidth = 8
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Harvesting data", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75, { color: 'pink', stroke: 'black' })



    if (this.memory.harvestingSources != undefined) {
        for (src of this.memory.harvestingSources) {

            blockPos.y += blockPosHeight
            var blockPosWidth = 8
            this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
            this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

            var aux = Math.round((src.harvestingPower / (SOURCE_ENERGY_CAPACITY / ENERGY_REGEN_TIME)) * Math.min(1, src.carryPower / src.harvestingPower) * 100)
            this.visual.text(src.roomName + " (" + src.pos.x + " " + src.pos.y + ") -> " + aux + "%"
                , blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


        }
    }
    blockPos.y += blockPosHeight



    //Used Body Parts
    var blockPosWidth = 8
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

    var maxBodyParts = (CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.controller.level]) * (CREEP_LIFE_TIME / CREEP_SPAWN_TIME)
    this.visual.text("UsedBodyParts: " + global.heap.rooms[this.name].creepsBodyParts + "\\" + maxBodyParts, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)
    blockPos.y += blockPosHeight

    //Creeps data

    //Workers
    var blockPosWidth = 8
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })

    var maxBodyParts = (CONTROLLER_STRUCTURES[STRUCTURE_SPAWN][this.controller.level]) * (CREEP_LIFE_TIME / CREEP_SPAWN_TIME)

    this.visual.text("Workers Parts: " + global.heap.rooms[this.name].workersParts + "/" + Math.round(global.heap.rooms[this.name].needWorkersParts), blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //global.heap.rooms[creep.memory.homeRoom].haulersParts
    //Haulers
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Haulers Parts: " + global.heap.rooms[this.name].haulersParts + "/" + C.HAULER_REQ_CARRY_PARTS, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    //Ramparts repairers
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("RampRep: Parts: " + global.heap.rooms[this.name].rampartRepairersPower + "/" + (Math.round((global.heap.rooms[this.name].requiredRampartsRepairersPower) * 100) / 100), blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)


    //Mineral Carrier
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Mineral carry/harvest: " + (Math.round((global.heap.rooms[this.name].mineralCarryPower) * 100) / 100) + "/" + global.heap.rooms[this.name].mineralMiningPower, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)





    //harvesting queue
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Harvesting Queue:", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75, { color: 'pink', stroke: 'black' })

    for (req of global.heap.rooms[this.name].harvestingQueue) {
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(req.role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Civilian Queue
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("Civilian Queue:", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75, { color: 'pink', stroke: 'black' })

    for (req of global.heap.rooms[this.name].civilianQueue) {
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(req.role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //defensive Queue
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("defensive Queue:", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75, { color: 'pink', stroke: 'black' })

    for (req of global.heap.rooms[this.name].defensiveQueue) {
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(req.role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }

    //Offensive Queue
    blockPos.y += blockPosHeight
    this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
    this.visual.text("offensive Queue:", blockPos.x + blockPosWidth / 2, blockPos.y + 0.75, { color: 'pink', stroke: 'black' })

    for (req of global.heap.rooms[this.name].offensiveQueue) {
        blockPos.y += blockPosHeight
        this.visual.rect(blockPos.x, blockPos.y, blockPosWidth, blockPosHeight, { fill: C.FILL_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x + blockPosWidth, blockPos.y, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y, blockPos.x, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x, blockPos.y + blockPosHeight, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.line(blockPos.x + blockPosWidth, blockPos.y, blockPos.x + blockPosWidth, blockPos.y + blockPosHeight, { color: C.OUTLINE_COLOR })
        this.visual.text(req.role, blockPos.x + blockPosWidth / 2, blockPos.y + 0.75)

    }





}