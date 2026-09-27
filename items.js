const ITEM_DEFINITIONS = [
    {
        name: 'Ore',
        baseValue: 200,
        flags: 0x01,
        info: 'Ore is produced by mines found mostly in the mining district. Processing produces sheet metal and exotic metals.'
    },
    {
        name: 'Pure Water',
        baseValue: 250,
        flags: 0x01,
        info: 'Pure water is produced by the water purifiers operated by the two major factions. It is used in the manufacture of power cells as well as for general survival.'
    },
    {
        name: 'Chemicals',
        baseValue: 350,
        flags: 0x01,
        info: 'Chemicals are harvested from the polluted air and lakes of the city for use in manufacturing, particularly of weapons.'
    },
    {
        name: 'Scrap Metal',
        baseValue: 200,
        flags: 0x01,
        info: 'Scrap metal can be recycled to produce sheet metal.'
    },
    {
        name: 'Food',
        baseValue: 500,
        flags: 0x01,
        info: 'Food is grown in the macroclimate domes operated by the two major factions, the need for food needs little explanation.'
    },
    {
        name: 'Bodyparts',
        baseValue: 700,
        flags: 0x01,
        info: 'Human body parts.'
    },
    {
        name: 'Gems',
        baseValue: 500,
        flags: 0x01,
        info: 'Gems are a byproduct of ore mining and in these troubled times are used more commonly for weapons manufacture than decoration.'
    },
    {
        name: 'ExMetal',
        baseValue: 400,
        flags: 0x01,
        info: 'Exotic metals are a secondary product of the ore processing plants. They are vital to many manufacturing processes.'
    },
    {
        name: 'SheetMetal',
        baseValue: 400,
        flags: 0x01,
        info: 'Sheet metal is the main product of the ore processing plants. It is used for manufacturing hardware throughout the city.'
    },
    {
        name: 'ConstMat',
        baseValue: 100,
        flags: 0x01,
        info: 'Construction materials originate mostly from the mines district. Their use in the repair of damaged structures is more common than actual construction in these troubled times.'
    },
    {
        name: 'CompComp',
        baseValue: 1550,
        flags: 0x01,
        info: 'Computer components are produced in various component factories around the city and are required for the manufacture of hi-tech hardware.'
    },
    {
        name: 'MachParts',
        baseValue: 700,
        flags: 0x01,
        info: 'Machine parts are produced in component factories for use in manufacturing.'
    },
    {
        name: 'Plastics',
        baseValue: 450,
        flags: 0x01,
        info: 'Plastics are a product of the chemicals industry, used in manufacturing.'
    },
    {
        name: 'Explosives',
        baseValue: 1320,
        flags: 0x01,
        info: 'Explosives are produced by the chemicals industry for use in weapons.'
    },
    {
        name: 'Fusion Parts',
        baseValue: 2000,
        flags: 0x41,
        info: 'Fusion parts, a recently rediscovered technology, are used in the construction of fusion cells and devastating weapons.'
    },
    {
        name: 'Trigger',
        baseValue: 3000,
        flags: 0x41,
        info: 'Trigger for a nuclear device.'
    },
    {
        name: 'Matter',
        baseValue: 3000,
        flags: 0x41,
        info: 'Radioactive matter, no doubt for use in some fiendish weapon.'
    },
    {
        name: 'Engine #1',
        baseValue: 3105,
        flags: 0x03,
        info: 'A moth engine of low power.'
    },
    {
        name: 'Engine #2',
        baseValue: 3910,
        flags: 0x03,
        info: 'A moderately powerful moth engine.'
    },
    {
        name: 'Engine #3',
        baseValue: 4660,
        flags: 0x03,
        info: 'A very powerful moth engine.'
    },
    {
        name: 'Cell #1',
        baseValue: 1210,
        flags: 0x03,
        info: 'A moth power cell with mediocre performance.'
    },
    {
        name: 'Cell #2',
        baseValue: 1720,
        flags: 0x03,
        info: 'A reasonable moth power cell.'
    },
    {
        name: 'Cell #3',
        baseValue: 2410,
        flags: 0x03,
        info: 'A moth power cell with good performance.'
    },
    {
        name: 'Cell #4',
        baseValue: 3220,
        flags: 0x03,
        info: 'An excellent moth power cell, suitable for long missions and weaponry with a heavy power drain.'
    },
    {
        name: 'Fusion Cell',
        baseValue: 15000,
        flags: 0x43,
        info: 'A fusion power cell that can provide a moth with almost unlimited power and increased altitude.'
    },
    {
        name: 'Afterburner',
        baseValue: 8500,
        flags: 0x05,
        info: 'When fired, the afterburner will boost your moth\'s thrust output tremendously for a short period of time.'
    },
    {
        name: 'Smallest Pod',
        baseValue: 3560,
        flags: 0x23,
        cargoCount: 2,
        maxUnitsEach: 10,
        info: 'The smallest and lightest cargo pod available. Can be dismantled for transportation. Holds %d cargos, max %d units each.'
    },
    {
        name: 'Small Pod',
        baseValue: 5350,
        flags: 0x23,
        cargoCount: 3,
        maxUnitsEach: 10,
        info: 'A small cargo pod. Can be dismantled for transportation. Holds %d cargos, max %d units each.'
    },
    {
        name: 'Medium Pod',
        baseValue: 7590,
        flags: 0x23,
        cargoCount: 3,
        maxUnitsEach: 20,
        info: 'A medium sized cargo pod. Can be dismantled for transportation. Holds %d cargos, max %d units each.'
    },
    {
        name: 'Large Pod',
        baseValue: 8570,
        flags: 0x23,
        cargoCount: 4,
        maxUnitsEach: 30,
        info: 'A large cargo pod. Can be dismantled for transportation. Holds %d cargos, max %d units each.'
    },
    {
        name: 'Largest Pod',
        baseValue: 9030,
        flags: 0x23,
        cargoCount: 5,
        maxUnitsEach: 30,
        info: 'The largest cargo pod available. Can be dismantled for transportation. Holds %d cargos, max %d units each.'
    },
    {
        name: 'Salvage Drone',
        baseValue: 4000,
        flags: 0x03,
        info: 'A salvage drone can be fitted to a cargo pod to allow the recovery of cargo or other objects from the surface.'
    },
    {
        name: 'Super Drone',
        baseValue: 9000,
        flags: 0x03,
        info: 'A salvage drone can be fitted to a cargo pod to allow the recovery of cargo or other objects from the surface. This is the deluxe model.'
    },
    {
        name: 'Frame MM',
        baseValue: 6660,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame SY',
        baseValue: 7880,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame NT',
        baseValue: 8800,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame HK',
        baseValue: 11400,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame DH',
        baseValue: 13680,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame PL',
        baseValue: 20000,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Frame AL',
        baseValue: 99999,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Spratx10',
        baseValue: 3000,
        flags: 0x05,
        info: 'A pack of 10 Sprats, target seeking missiles that inflict heavy damage on shields and moth structure.'
    },
    {
        name: 'Swarmx10',
        baseValue: 4000,
        flags: 0x05,
        info: 'A pack of 10 Swarms, clustered target seeking missiles that inflict severe damage on shields and moth structure.'
    },
    {
        name: 'Devastator',
        baseValue: 8600,
        flags: 0x05,
        info: 'A missile capable of inflicting catastrophic damage on a moth\'s power systems.'
    },
    {
        name: 'Leachx10',
        baseValue: 4500,
        flags: 0x05,
        info: 'The power leach drains a moth\'s power reserves on impact. Supplied in packs of 10.'
    },
    {
        name: 'Flaresx10',
        baseValue: 1000,
        flags: 0x03,
        info: 'A pack of ten flares, vital for deflecting incoming missiles.'
    },
    {
        name: 'Chaffx10',
        baseValue: 1000,
        flags: 0x03,
        info: 'A pack of ten chaff cannisters, vital for deflecting incoming missiles and damaging close following enemies.'
    },
    {
        name: 'StarShellsx10',
        baseValue: 1500,
        flags: 0x03,
        info: 'A pack of ten star shells, useful for illuminating dark areas.'
    },
    {
        name: 'Tac-Nuke',
        baseValue: 10000,
        flags: 0x45,
        info: 'A \'tactical\' nuclear missile, capable of causing damage to buildings.'
    },
    {
        name: 'Big Bob Missile',
        baseValue: 20000,
        flags: 0x45,
        info: 'A Big Bob missile, capable of causing severe damage to buildings.'
    },
    {
        name: 'FireBurstx10',
        baseValue: 7800,
        flags: 0x05,
        info: 'A pack of 10 Fireburst weapons, which causes major damage to a moth\'s shields and severe engine damage once shields are depleted.'
    },
    {
        name: 'FireBurstSub',
        baseValue: 20000,
        flags: 0x04,
        info: 'Our database contains no information about this item.'
    },
    {
        name: 'SwarmSub',
        baseValue: 20000,
        flags: 0x04,
        info: 'Our database contains no information about this item.'
    },
    {
        name: 'Underkillx5',
        baseValue: 5000,
        flags: 0x05,
        info: 'A pack of 5 Underkills, which attack both the CPU and structure of their target.'
    },
    {
        name: 'GroundBasex5',
        baseValue: 7000,
        flags: 0x05,
        info: 'The Groundbase anchors itself in the ground below a target moth and drags it down, causing severe damage in the process. In packs of 5.'
    },
    {
        name: 'GroundBase Sub',
        baseValue: 20000,
        flags: 0x04,
        info: 'Our database contains no information about this item.'
    },
    {
        name: 'Hologramx5',
        baseValue: 4500,
        flags: 0x05,
        info: 'Releases a limited-time hologram of your moth which draws incoming weapons fire and fools enemy targetting systems. In packs of 5.'
    },
    {
        name: 'Laser',
        baseValue: 2000,
        flags: 0x15,
        info: 'A laser. Has little effect on a shielded moth, but more effective when shields are down.'
    },
    {
        name: 'Plasma Kannon',
        baseValue: 5000,
        flags: 0x15,
        info: 'A plasma kannon. Depletes shields rapidly and causes mainly CPU damage.'
    },
    {
        name: 'Laser Turret',
        baseValue: 9500,
        flags: 0x15,
        info: 'A laser turret can be fitted to larger and more advanced moths. It is a formidable weapon that will automatically rotate to track your current target.'
    },
    {
        name: 'Pulse Laser',
        baseValue: 9900,
        flags: 0x15,
        info: 'The pulse laser causes damage to the shields and weapons systems of the target.'
    },
    {
        name: 'Death Ray',
        baseValue: 9900,
        flags: 0x14,
        info: 'A death ray.'
    },
    {
        name: 'New Moth NT',
        baseValue: 50000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'New Moth HK',
        baseValue: 55000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'New Moth DH',
        baseValue: 60000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'New Moth MM',
        baseValue: 40000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'New Moth SY',
        baseValue: 45000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'New Moth PL',
        baseValue: 70000,
        flags: 0x08,
        info: 'A new moth.'
    },
    {
        name: 'Unknown Origin',
        baseValue: 1,
        flags: 0x00,
        info: 'The origin and purpose of this object are unknown.'
    },
    {
        name: 'Mass Driver Part',
        baseValue: 2,
        flags: 0x00,
        info: 'A vital part from the defunct mass drivers in the port district.'
    },
    {
        name: 'Mystery Package',
        baseValue: 2,
        flags: 0x00,
        info: 'A mystery package.'
    },
    {
        name: 'Black Box',
        baseValue: 2,
        flags: 0x00,
        info: 'A black box flight recorder.'
    },
    {
        name: 'Minerals',
        baseValue: 120,
        flags: 0x00,
        info: 'Minerals.'
    },
    {
        name: 'Air Filters',
        baseValue: 620,
        flags: 0x00,
        info: 'Air Filters'
    },
    {
        name: 'Pleasure Cubes',
        baseValue: 310,
        flags: 0x00,
        info: 'Pleasure Cubes'
    },
    {
        name: 'Alcohol',
        baseValue: 520,
        flags: 0x01,
        info: 'Though a contraband item, Alcohol is traded openly throughout the city, with the police turning a blind eye.'
    },
    {
        name: 'Textiles',
        baseValue: 220,
        flags: 0x00,
        info: 'Textiles'
    },
    {
        name: 'Furs',
        baseValue: 460,
        flags: 0x01,
        info: 'Furs are a byproduct of the food producing macroculture domes.'
    },
    {
        name: 'Huskar Cigars',
        baseValue: 625,
        flags: 0x01,
        info: 'The tobacco in Huskar Cigars is grown at a secret location.'
    },
    {
        name: 'Servant Droids',
        baseValue: 820,
        flags: 0x00,
        info: 'Slave droids are used to perform mundane tasks in buildings around the city.'
    },
    {
        name: 'Narcotics',
        baseValue: 2520,
        flags: 0x01,
        info: 'Narcotics are frowned upon by the police. The high profit margin available to traders is offset by the risk of capture.'
    },
    {
        name: 'Cloning Device',
        baseValue: 5000,
        flags: 0x81,
        info: 'A cloning device.'
    },
    {
        name: 'FRAME SW',
        baseValue: 7880,
        flags: 0x00,
        info: 'A moth frame.'
    },
    {
        name: 'Trojan',
        baseValue: 8000,
        flags: 0x05,
        info: 'Trojan'
    },
    {
        name: 'New Moth SW',
        baseValue: 90000,
        flags: 0x08,
        info: 'A new Swallow Moth'
    },
    {
        name: 'Munitions Machinery',
        baseValue: 41000,
        flags: 0x81,
        info: 'Weapons manufacturing machinery which can be installed in any hanger to allow production of a range of weapons from raw materials.'
    },
    {
        name: 'Components Machinery',
        baseValue: 28000,
        flags: 0x81,
        info: 'Components manufacturing machinery can be installed in any hanger to allow production of various components from raw materials.'
    },
    {
        name: 'Ore Processor',
        baseValue: 19000,
        flags: 0x81,
        info: 'Ore processing machinery can be installed in any hanger to allow producessing of ore.'
    },
    {
        name: 'Distiller',
        baseValue: 25000,
        flags: 0x81,
        info: 'Distilling machinery can be installed in any hanger to allow production of alcohol from raw materials.'
    },
    {
        name: 'Narcotron',
        baseValue: 58000,
        flags: 0x81,
        info: 'Narcotics manufacturing machinery can be installed in any hanger to allow production of narcotics from raw materials.'
    }
];