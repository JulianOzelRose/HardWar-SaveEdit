// Misc
let EOF_OFFSET = 0;
let PILOT_LIST_START = 0;
let HANGAR_LIST_START = 0;
let NUM_MOTHS = 0;
let NUM_HANGARS = 0;
let dataView = null;
let originalFilename = '';
let VERSION_UIM6 = "UIM.06";

// Pointer offsets
const LOCATION_OF_MOTH_ENTRY_COUNT = 0xDD0;
const LOCATION_OF_OFFSET_TO_MOTH_ENTRIES = 0xDD4;
const LOCATION_OF_OFFSET_TO_MOTH_POINTERS = 0xDD8;
const LOCATION_OF_HANGAR_ENTRY_COUNT = 0xDDC;
const LOCATION_OF_OFFSET_TO_HANGAR_ENTRIES = 0xDE0;
const LOCATION_OF_OFFSET_TO_HANGAR_POINTERS = 0xDE4;
const LOCATION_OF_PILOT_ENTRY_COUNT = 0xDF4;
const LOCATION_OF_OFFSET_TO_PILOT_ENTRIES = 0xDF8;
const LOCATION_OF_OFFSET_TO_PILOT_POINTERS = 0xDFC;

// Pilot constants and offsets
const PILOT_ITERATOR = 0x37C;
const PILOT_NAME_MAX_LENGTH = 19;
const PILOT_NAME_OFFSET = 0x4;
const PILOT_STATUS_OFFSET = 0x2C;
const PILOT_LOCATION_OFFSET = 0x30;
const PILOT_CASH_OFFSET = 0x3C;
const PILOT_TYPE_OFFSET = 0x40;
const PILOT_FACTION_OFFSET = 0x298;
const PILOT_STATUS = {
    1: "In a moth",
    2: "On foot",
    3: "In a monorail car",
    4: "Awaiting a monorail car",
    5: "In a walkway"
};

// Moth constants and offsets
const MOTH_HANGAR_OFFSET = 0x1D0;
const MOTH_TYPE_OFFSET = 0x1DC;
const MOTH_SHIELDS_OFFSET = 0x294;
const MOTH_ENGINE_DMG_OFFSET = 0x298;
const MOTH_STRUCTURE_DMG_OFFSET = 0x29C;
const MOTH_CPU_DMG_OFFSET = 0x2A0;
const MOTH_POWER_DMG_OFFSET = 0x2A4;
const MOTH_WEAPONS_DMG_OFFSET = 0x2A8;
const MOTH_PILOT_OFFSET = 0x2DC;
const MOTH_PASSENGER_OFFSET = 0x2E0;
const MOTH_POINTER_OFFSET = 0x160;
const MOTH_ITERATOR = 0x448;
const MOTH_TYPE = {
    1: "Moon Moth",
    2: "Silver Y",
    3: "Neo Tiger",
    4: "Hawk",
    5: "Deaths Head",
    6: "Police",
    7: "Alien",
    8: "Swallow"
};

// Hangar constants and offsets
const HANGAR_ITERATOR = 0x964;
const HANGAR_NAME_OFFSET = 0x10;
const HANGAR_POINTER_OFFSET = 0x2C;
const HANGAR_FACTION_STATE_OFFSET = 0x3C;
const HANGAR_DISPLAY_TYPE_OFFSET = 0x44;
const HANGAR_OWNER_OFFSET = 0x48;
const HANGAR_STOCK_LIST_OFFSET = 0x58;
const HANGAR_STOCK_ENTRY_SIZE = 0x18;
const HANGAR_STOCK_ITEM_COUNT = 89;
const HANGAR_CASH_HELD_OFFSET = 0x8BC;
const HANGAR_BAY_OFFSETS = [0x8D8, 0x8DC, 0x8E0, 0x8E4, 0x8E8, 0x8EC];

// Moth shield/damage constants
const MOTH_MAX_SHIELDS = 0x4000;
const MOTH_MAX_ENGINE_DMG = 0x4000;
const MOTH_MAX_STRUCTURE_DMG = 0x4000;
const MOTH_MAX_CPU_DMG = 0x4000;
const MOTH_MAX_POWER_DMG = 0x4000;
const MOTH_MAX_WEAPONS_DMG = 0x4000;

// Faction constants and offsets
const FACTION_STATE_SIZE = 0x1D34;
const FACTION_ENEMIES_LIST_OFFSET = 0x0;
const FACTION_ENEMIES_RATINGS_OFFSET = 0x78;
const FACTION_ENEMIES_MAX_ENTRIES = 30;
const POLICE_HQ_NAME = "Police HQ";

// Objects
let pilots = {};
let moths = {};
let hangars = {};

function resetFormData() {
    document.querySelectorAll('.form-control').forEach(el => el.value = '');
    document.querySelectorAll('.text-primary').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-select').forEach(el => el.innerHTML = '<option value="">Select</option>');
    document.getElementById('browseStockButton').disabled = true;
    document.getElementById('enemiesListButton').disabled = true;
    document.getElementById('savegame').textContent = "No file loaded";
}

function verifyVersion() {
    let versionString = '';
    for (let i = 0; i < 6; i++) {
        versionString += String.fromCharCode(dataView.getUint8(i));
    }
    return versionString === VERSION_UIM6;
}

function getPilotEntryCount() {
    let pilotEntryCount = dataView.getUint32(LOCATION_OF_PILOT_ENTRY_COUNT, true);
    return pilotEntryCount;
}

function getPilotBaseOffset() {
    let pilotEntryOffset = dataView.getUint32(LOCATION_OF_OFFSET_TO_PILOT_ENTRIES, true);
    return pilotEntryOffset;
}

function getPilotPointersStart() {
    let pilotPointersStart = dataView.getUint32(LOCATION_OF_OFFSET_TO_PILOT_POINTERS, true);
    return pilotPointersStart;
}

function getNumMoths() {
    let numMoths = dataView.getUint32(LOCATION_OF_MOTH_ENTRY_COUNT, true);
    return numMoths;
}

function getMothListStart() {
    let mothListStart = dataView.getUint32(LOCATION_OF_OFFSET_TO_MOTH_ENTRIES, true);
    return mothListStart;
}

function getMothPointersStart() {
    let mothPointersStart = dataView.getUint32(LOCATION_OF_OFFSET_TO_MOTH_POINTERS, true);
    return mothPointersStart;
}

function parsePilots() {
    const pilotEntryCount = getPilotEntryCount();
    const pilotBaseOffset = getPilotBaseOffset();
    const pilotPointersStart = getPilotPointersStart();

    PILOT_LIST_START = pilotBaseOffset;

    if (pilotBaseOffset === -1) {
        console.warn("Unable to find pilot base offset.");
        return;
    }

    for (let pilotIndex = 0; pilotIndex < pilotEntryCount; ++pilotIndex) {
        const pilotOffset = pilotBaseOffset + (pilotIndex * PILOT_ITERATOR);
        let isPilot = true;
        if (isPilot) {
            const name = readString(pilotOffset + PILOT_NAME_OFFSET);

            // Skip if the name length exceeds max name length
            if (name.length > PILOT_NAME_MAX_LENGTH) {
                continue;
            }

            const status = dataView.getUint32(pilotOffset + PILOT_STATUS_OFFSET, true);
            const cash = dataView.getInt32(pilotOffset + PILOT_CASH_OFFSET, true);
            const location = dataView.getUint32(pilotOffset + PILOT_LOCATION_OFFSET, true);
            const faction = dataView.getUint32(pilotOffset + PILOT_FACTION_OFFSET, true);
            const type = dataView.getUint32(pilotOffset + PILOT_TYPE_OFFSET, true);
            const address = dataView.getUint32(pilotPointersStart + (4 * pilotIndex), true);
            const values_changed = false;

            let locationName = `0x${location.toString(16).toUpperCase()}`;

            // Check if the location matches any hangar address
            for (const hangarName in hangars) {
                if (hangars[hangarName].address === location) {
                    locationName = hangars[hangarName].name;
                    break;
                }
            }

            // If no hangar match, check if it matches any moth address
            if (locationName.startsWith('0x')) {
                for (const mothName in moths) {
                    if (moths[mothName].pilot === address) {
                        locationName = moths[mothName].name;
                        break;
                    } else if (moths[mothName].passenger === address) {
                        locationName = moths[mothName].name;
                        break;
                    }
                }
            }

            pilots[name] = {
                name: name,
                status: PILOT_STATUS[status] || "Unknown",
                cash: cash,
                location: location,
                location_name: locationName,
                faction: faction,
                offset: pilotOffset,
                address: address,
                type: type,
                is_main_player: false,
                values_changed: values_changed
            };

            if (type == 1) {
                pilots[name].is_main_player = true;
            }

        }

    }

    console.log(`Pilots (${Object.keys(pilots).length}):`, pilots);
}

function parseMoths() {
    NUM_MOTHS = getNumMoths();
    const mothListStart = getMothListStart();
    const mothPointersStart = getMothPointersStart();

    // Loop until the first invalid moth is reached
    for (let index = 0; index < NUM_MOTHS; index++) {
        const currentOffset = mothListStart + (index * MOTH_ITERATOR);
        const currentAddressOffset = mothPointersStart + (index * 4);
        const type = dataView.getUint32(currentOffset + MOTH_TYPE_OFFSET, true);
        const shields = dataView.getInt32(currentOffset + MOTH_SHIELDS_OFFSET, true);
        const engine_damage = dataView.getInt32(currentOffset + MOTH_ENGINE_DMG_OFFSET, true);
        const structure_damage = dataView.getInt32(currentOffset + MOTH_STRUCTURE_DMG_OFFSET, true);
        const cpu_damage = dataView.getInt32(currentOffset + MOTH_CPU_DMG_OFFSET, true);
        const power_damage = dataView.getInt32(currentOffset + MOTH_POWER_DMG_OFFSET, true);
        const weapons_damage = dataView.getInt32(currentOffset + MOTH_WEAPONS_DMG_OFFSET, true);

        const pilot = dataView.getUint32(currentOffset + MOTH_PILOT_OFFSET, true);
        const passenger = dataView.getUint32(currentOffset + MOTH_PASSENGER_OFFSET, true);
        const hangar = dataView.getUint32(currentOffset + MOTH_HANGAR_OFFSET, true);
        const address = dataView.getUint32(currentAddressOffset, true);
        const name = `MOTH_0x${address.toString(16).toUpperCase()}`;
        const values_changed = false;

        moths[name] = {
            name: name,
            type: MOTH_TYPE[type],
            pilot: pilot,
            passenger: passenger,
            hangar: hangar,
            shields: shields,
            engine_damage: engine_damage,
            structure_damage: structure_damage,
            cpu_damage: cpu_damage,
            power_damage: power_damage,
            weapons_damage: weapons_damage,
            offset: currentOffset,
            address: address,
            values_changed: values_changed
        };

    }

    console.log(`Moths (${Object.keys(moths).length}): `, moths);
}

function parseHangars() {
    HANGAR_LIST_START = getHangarListStart();
    NUM_HANGARS = getHangarEntryCount();
    const hangarPointersStart = getHangarPointersStart();

    for (let index = 0; index < NUM_HANGARS; index++) {
        const hangarOffset = HANGAR_LIST_START + (HANGAR_ITERATOR * index);
        const name = readString(hangarOffset + HANGAR_NAME_OFFSET, true);
        const display_type = dataView.getUint32(hangarOffset + HANGAR_DISPLAY_TYPE_OFFSET, true);
        const owner = dataView.getUint32(hangarOffset + HANGAR_OWNER_OFFSET, true);
        const cash_held = dataView.getInt32(hangarOffset + HANGAR_CASH_HELD_OFFSET, true);
        const address = dataView.getUint32(hangarPointersStart + (4 * index), true);
        const values_changed = false;

        const bays = HANGAR_BAY_OFFSETS.map(offset => {
            const bayAddress = dataView.getUint32(hangarOffset + offset, true);

            if (bayAddress === 0) {
                return "Empty";
            }

            return `0x${bayAddress.toString(16).toUpperCase()}`;
        });

        const stock = [];

        const stockListOffset = hangarOffset + HANGAR_STOCK_LIST_OFFSET;

        for (let itemIndex = 0; itemIndex < HANGAR_STOCK_ITEM_COUNT; itemIndex++) {
            const stockEntryOffset = stockListOffset + (itemIndex * HANGAR_STOCK_ENTRY_SIZE);
            const quantity = dataView.getInt32(stockEntryOffset, true);
            const storedPrice = dataView.getInt32(stockEntryOffset + 0x04, true);
            const item = ITEM_DEFINITIONS[itemIndex];

            if (quantity > 0) {
                stock.push({
                    itemIndex,
                    name: item.name,
                    info: item.info,
                    stock: quantity,
                    storedPrice
                });
            }
        }

        hangars[name] = {
            name,
            display_name: name,
            display_type,
            offset: hangarOffset,
            address,
            owner: `0x${owner.toString(16).toUpperCase()}`,
            cash_held,
            bays,
            stock,
            values_changed
        };
    }

    console.log(`Hangars (${Object.keys(hangars).length}): `, hangars);
}

function resolveHangarDisplayNames() {
    Object.values(hangars).forEach(hangar => {
        if (hangar.display_type !== 1) {
            return;
        }

        const ownerAddress = parseInt(hangar.owner, 16);

        if (!ownerAddress) {
            return;
        }

        const ownerPilot = Object.values(pilots).find(pilot => pilot.address === ownerAddress);

        if (ownerPilot) {
            hangar.display_name = `${ownerPilot.name}'s Hangar`;
        }
    });
}

function resolveHangarWantedLists() {
    Object.values(hangars).forEach(hangar => {
        hangar.hasWantedList = false;

        const ownerAddress = dataView.getUint32(hangar.offset + HANGAR_OWNER_OFFSET, true);

        if (!ownerAddress) {
            return;
        }

        const ownerHangar = Object.values(hangars).find(candidate => candidate.address === ownerAddress);

        if (!ownerHangar) {
            return;
        }

        const reference = dataView.getUint32(ownerHangar.offset + HANGAR_FACTION_STATE_OFFSET, true);
        const index = reference - 0x1000;

        if (index < 0 || index >= 400) {
            return;
        }

        const size = dataView.getUint32(0x790 + (index * 4), true);

        hangar.hasWantedList = size === FACTION_STATE_SIZE;
    });
}

function getPilotDisplayName(pilot) {
    return pilot.is_main_player ? `${pilot.name} (You)` : pilot.name;
}

function getHangarEntryCount() {
    return dataView.getUint32(LOCATION_OF_HANGAR_ENTRY_COUNT, true);
}

function getHangarListStart() {
    return dataView.getUint32(LOCATION_OF_OFFSET_TO_HANGAR_ENTRIES, true);
}

function getHangarPointersStart() {
    return dataView.getUint32(LOCATION_OF_OFFSET_TO_HANGAR_POINTERS, true);
}

function populatePilotDropdown() {
    const dropdown = document.getElementById('pilotSelect');
    dropdown.innerHTML = '';
    let mainPilotIndex = 0;

    Object.keys(pilots).forEach((pilotName, index) => {
        const option = document.createElement('option');
        option.value = pilotName;

        const pilot = pilots[pilotName];
        option.textContent = getPilotDisplayName(pilot);

        if (pilot.is_main_player) {
            mainPilotIndex = index;
        }

        dropdown.appendChild(option);
    });

    dropdown.selectedIndex = mainPilotIndex;
    updatePilotInfo(dropdown.value);

    dropdown.addEventListener('change', function () {
        updatePilotInfo(dropdown.value);
    });

    if (dropdown.customSelectRebuild) {
        dropdown.customSelectRebuild();
    }
}

function populateMothDropdown() {
    const dropdown = document.getElementById('mothSelect');
    dropdown.innerHTML = '';

    Object.keys(moths).forEach(mothPointer => {
        const moth = moths[mothPointer];
        const option = document.createElement('option');
        option.value = mothPointer;
        option.textContent = `${moth.type || "Unknown"} (0x${moth.address.toString(16).toUpperCase()})`;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', function () {
        const selectedMothName = dropdown.value;
        updateMothInfo(selectedMothName);
    });

    if (dropdown.customSelectRebuild) {
        dropdown.customSelectRebuild();
    }

    dropdown.dispatchEvent(new Event('change'));
}

function populateHangarDropdown() {
    const dropdown = document.getElementById('hangarSelect');
    dropdown.innerHTML = '';

    Object.keys(hangars).forEach(hangarName => {
        const option = document.createElement('option');
        option.value = hangarName;
        option.textContent = hangars[hangarName].display_name;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', function () {
        const selectedHangar = hangars[dropdown.value];
        if (selectedHangar) {
            const cashHeldInput = document.getElementById('hangarCashHeld');
            cashHeldInput.value = selectedHangar.cash_held;

            cashHeldInput.oninput = function () {
                selectedHangar.cash_held = parseInt(cashHeldInput.value, 10);
                selectedHangar.values_changed = true;
            }

            updateHangarOwner('hangarOwner', selectedHangar.owner);

            for (let i = 0; i < 6; i++) {
                updateHangarBay(`hangarBay${i + 1}`, selectedHangar.bays[i]);
            }

            const enemiesListButton = document.getElementById('enemiesListButton');
            enemiesListButton.textContent = isPoliceFaction(selectedHangar) ? 'Wanted List' : 'Enemies List';
        }

        updateHangarActionButtons();
    });

    if (dropdown.customSelectRebuild) {
        dropdown.customSelectRebuild();
    }

    dropdown.dispatchEvent(new Event('change'));
}

function updateHangarOwner(elementId, ownerAddress) {
    const element = document.getElementById(elementId);

    if (ownerAddress === "None" || ownerAddress === 0 || ownerAddress == 0x0) {
        element.textContent = "None";
        element.classList.remove('recognized-location');
        element.classList.add('unrecognized-location');

        const newElement = element.cloneNode(true);
        element.replaceWith(newElement);

    } else {
        const ownerPilot = Object.values(pilots).find(pilot => pilot.address === parseInt(ownerAddress, 16));

        if (ownerPilot) {
            element.textContent = getPilotDisplayName(ownerPilot);
            element.classList.remove('unrecognized-location');
            element.classList.add('recognized-location');

            element.replaceWith(element.cloneNode(true));
            const newElement = document.getElementById(elementId);
            newElement.addEventListener('click', function () {
                handlePilotClick(ownerPilot.name);
            });

        } else {
            const ownerHangar = Object.values(hangars).find(hangar => hangar.address === parseInt(ownerAddress, 16));

            if (ownerHangar) {
                element.textContent = ownerHangar.display_name;
                element.classList.remove('unrecognized-location');
                element.classList.add('recognized-location');

                element.replaceWith(element.cloneNode(true));
                const newElement = document.getElementById(elementId);
                newElement.addEventListener('click', function () {
                    handleLocationClick(ownerHangar.name);
                });
            } else {
                element.textContent = "None";
                element.classList.remove('recognized-location');
                element.classList.add('unrecognized-location');

                const newElement = element.cloneNode(true);
                element.replaceWith(newElement);
            }
        }
    }
}

function updateHangarBay(elementId, bayAddress) {
    const element = document.getElementById(elementId);
    const bayAddressNumber = parseInt(bayAddress, 16);

    element.replaceWith(element.cloneNode(true));
    const newElement = document.getElementById(elementId);

    if (bayAddress === "Empty" || bayAddressNumber === 0) {
        newElement.textContent = "Empty";
        newElement.classList.remove('recognized-location');
        newElement.classList.add('unrecognized-location');
    } else {
        const matchingMoth = Object.values(moths).find(moth => moth.address === bayAddressNumber);

        if (matchingMoth) {
            newElement.textContent = matchingMoth.type || "Unknown";
            newElement.classList.remove('unrecognized-location');
            newElement.classList.add('recognized-location');

            newElement.addEventListener('click', function () {
                handleMothClick(matchingMoth.name);
            });
        } else {
            newElement.textContent = `0x${bayAddressNumber.toString(16).toUpperCase()}`;
            newElement.classList.remove('recognized-location');
            newElement.classList.add('unrecognized-location');
        }
    }
}

function updateHangarActionButtons() {
    const selectedHangarName = document.getElementById('hangarSelect').value;
    const hangar = hangars[selectedHangarName];

    const stockButton = document.getElementById('browseStockButton');
    const wantedButton = document.getElementById('enemiesListButton');

    stockButton.disabled = !hangar;
    wantedButton.disabled = !hangar || !hangar.hasWantedList;
}

function updatePilotInfo(pilotName) {
    const selectedPilot = pilots[pilotName];
    if (selectedPilot) {
        const cashInput = document.getElementById('pilotCash');
        cashInput.value = selectedPilot.cash;

        // Add event listener to track changes
        cashInput.oninput = function () {
            selectedPilot.cash = parseInt(cashInput.value, 10);
            selectedPilot.values_changed = true;
        }

        const locationElement = document.getElementById('pilotLocation');
        const locationName = selectedPilot.location_name;
        const locationMoth = moths[locationName];
        const locationHangar = hangars[locationName];
        const locationDisplayName = locationMoth ? (locationMoth.type || "Unknown") : locationHangar ? locationHangar.display_name : locationName;
        const isRecognizedLocation = !locationName.startsWith("0x");

        locationElement.textContent = locationDisplayName;
        document.getElementById('pilotStatus').textContent = selectedPilot.status;

        const factionElement = document.getElementById('pilotFaction');
        const factionAddress = selectedPilot.faction;

        factionElement.replaceWith(factionElement.cloneNode(true));
        const newFactionElement = document.getElementById('pilotFaction');

        if (factionAddress && factionAddress !== 0) {
            let isRecognizedFaction = false;

            // Check if the faction matches any hangar address
            for (const hangarName in hangars) {
                if (hangars[hangarName].address === factionAddress) {
                    newFactionElement.textContent = hangarName;
                    newFactionElement.classList.remove('unrecognized-location');
                    newFactionElement.classList.add('recognized-location');

                    newFactionElement.addEventListener('click', function () {
                        handleLocationClick(hangarName);
                    });

                    isRecognizedFaction = true;
                    break;
                }
            }

            if (!isRecognizedFaction) {
                newFactionElement.textContent = `0x${factionAddress.toString(16).toUpperCase()}`;
                newFactionElement.classList.remove('recognized-location');
                newFactionElement.classList.add('unrecognized-location');
            }

        } else {
            newFactionElement.textContent = "None";
            newFactionElement.classList.remove('recognized-location');
            newFactionElement.classList.add('unrecognized-location');
        }

        if (isRecognizedLocation) {
            locationElement.classList.remove('unrecognized-location');
            locationElement.classList.add('recognized-location');

            locationElement.replaceWith(locationElement.cloneNode(true));
            const newLocationElement = document.getElementById('pilotLocation');
            newLocationElement.addEventListener('click', function () {
                handleLocationClick(locationName);
            });
        } else {
            locationElement.classList.remove('recognized-location');
            locationElement.classList.add('unrecognized-location');

            const newLocationElement = locationElement.cloneNode(true);
            locationElement.replaceWith(newLocationElement);
        }
    }
}

function updateMothInfo(mothName) {
    const selectedMoth = moths[mothName];
    if (selectedMoth) {
        const shieldsInput = document.getElementById('mothShields');
        const engineDamageInput = document.getElementById('mothEngineDamage');
        const structureDamageInput = document.getElementById('mothStructureDamage');
        const cpuDamageInput = document.getElementById('mothCpuDamage');
        const powerDamageInput = document.getElementById('mothPowerDamage');
        const weaponsDamageInput = document.getElementById('mothWeaponsDamage');
        const mothTypeElement = document.getElementById('mothType');

        shieldsInput.value = selectedMoth.shields;
        engineDamageInput.value = selectedMoth.engine_damage;
        structureDamageInput.value = selectedMoth.structure_damage;
        cpuDamageInput.value = selectedMoth.cpu_damage;
        powerDamageInput.value = selectedMoth.power_damage;
        weaponsDamageInput.value = selectedMoth.weapons_damage;

        mothTypeElement.textContent = selectedMoth.type || "Unknown";
        mothTypeElement.classList.remove('text-primary');
        mothTypeElement.classList.add('moth-type');

        shieldsInput.oninput = function () {
            selectedMoth.shields = parseInt(shieldsInput.value, 10);
            selectedMoth.values_changed = true;
        };

        engineDamageInput.oninput = function () {
            selectedMoth.engine_damage = parseInt(engineDamageInput.value, 10);
            selectedMoth.values_changed = true;
        };

        structureDamageInput.oninput = function () {
            selectedMoth.structure_damage = parseInt(structureDamageInput.value, 10);
            selectedMoth.values_changed = true;
        };

        cpuDamageInput.oninput = function () {
            selectedMoth.cpu_damage = parseInt(cpuDamageInput.value, 10);
            selectedMoth.values_changed = true;
        };

        powerDamageInput.oninput = function () {
            selectedMoth.power_damage = parseInt(powerDamageInput.value, 10);
            selectedMoth.values_changed = true;
        };

        weaponsDamageInput.oninput = function () {
            selectedMoth.weapons_damage = parseInt(weaponsDamageInput.value, 10);
            selectedMoth.values_changed = true;
        };

        const pilotElement = document.getElementById('mothPilot');
        const pilotPointer = selectedMoth.pilot;
        let pilotName = pilotPointer === 0 ? "None" : `0x${pilotPointer.toString(16).toUpperCase()}`;

        let isRecognizedPilot = false;
        let matchedPilot = null;

        if (pilotPointer !== 0) {
            for (const pilotKey in pilots) {
                if (pilots[pilotKey].address === pilotPointer) {
                    matchedPilot = pilots[pilotKey];
                    pilotName = matchedPilot.name;
                    isRecognizedPilot = true;
                    break;
                }
            }
        }

        pilotElement.textContent = matchedPilot ? getPilotDisplayName(matchedPilot) : pilotName;

        if (isRecognizedPilot) {
            pilotElement.classList.remove('unrecognized-location');
            pilotElement.classList.add('recognized-location');

            pilotElement.replaceWith(pilotElement.cloneNode(true));
            const newPilotElement = document.getElementById('mothPilot');
            newPilotElement.addEventListener('click', function () {
                handlePilotClick(pilotName);
            });
        } else {
            pilotElement.classList.remove('recognized-location');
            pilotElement.classList.add('unrecognized-location');

            const newPilotElement = pilotElement.cloneNode(true);
            pilotElement.replaceWith(newPilotElement);
        }

        const formGroupPassenger = document.querySelector('#mothPassenger').closest('.form-group');

        if (selectedMoth.type === "Moon Moth") {
            formGroupPassenger.style.display = 'flex';

            const passengerElement = document.getElementById('mothPassenger');
            const passengerPointer = selectedMoth.passenger;
            let passengerName = passengerPointer === 0 ? "None" : `0x${passengerPointer.toString(16).toUpperCase()}`;

            let isRecognizedPassenger = false;
            let matchedPassenger = null;

            if (passengerPointer !== 0) {
                matchedPassenger = Object.values(pilots).find(pilot => pilot.address === passengerPointer);

                if (matchedPassenger) {
                    passengerName = matchedPassenger.name;
                    isRecognizedPassenger = true;
                }
            }

            passengerElement.textContent = matchedPassenger ? getPilotDisplayName(matchedPassenger) : passengerName;

            if (isRecognizedPassenger) {
                passengerElement.classList.remove('unrecognized-location');
                passengerElement.classList.add('recognized-location');

                passengerElement.onclick = function () {
                    handlePilotClick(passengerName);
                };
            } else {
                passengerElement.classList.remove('recognized-location');
                passengerElement.classList.add('unrecognized-location');

                // Remove click event if unrecognized
                passengerElement.onclick = null;
            }
        } else {
            formGroupPassenger.style.display = 'none';
        }

        const hangarElement = document.getElementById("mothHangar");

        const hangarPointer = selectedMoth.hangar;
        let hangarName = "";
        let hangarDisplayName = hangarPointer === 0 ? "None" : `0x${hangarPointer.toString(16).toUpperCase()}`;
        let isRecognizedHangar = false;

        if (hangarPointer !== 0) {
            for (const hangar in hangars) {
                if (hangars[hangar].address === hangarPointer) {
                    hangarName = hangars[hangar].name;
                    hangarDisplayName = hangars[hangar].display_name;
                    isRecognizedHangar = true;
                    break;
                }
            }
        }

        hangarElement.textContent = hangarDisplayName;

        if (isRecognizedHangar) {
            hangarElement.classList.remove('unrecognized-location');
            hangarElement.classList.add('recognized-location');

            hangarElement.replaceWith(hangarElement.cloneNode(true));
            const newHangarElement = document.getElementById('mothHangar');

            newHangarElement.addEventListener('click', function () {
                handleLocationClick(hangarName);
            });
        } else {
            hangarElement.classList.remove('recognized-location');
            hangarElement.classList.add('unrecognized-location');

            hangarElement.replaceWith(hangarElement.cloneNode(true));
            const newHangarElement = document.getElementById('mothHangar');

            newHangarElement.textContent = hangarDisplayName;
        }
    }
}

function handlePilotClick(pilotName) {
    if (pilotName !== "None" && !pilotName.startsWith("0x")) {
        showTab('pilots');
        const pilotDropdown = document.getElementById('pilotSelect');
        pilotDropdown.value = pilotName;
        pilotDropdown.customSelectSync?.();
        updatePilotInfo(pilotName);
    }
}

function handleMothClick(mothName) {
    if (moths[mothName]) {
        showTab('moths');
        const mothDropdown = document.getElementById('mothSelect');
        mothDropdown.value = mothName;
        updateMothInfo(mothName);
    }
}

function handleLocationClick(locationName) {
    let tabToActivate = '';
    let dropdownToSelect = '';

    if (hangars[locationName]) {
        tabToActivate = 'hangars';
        dropdownToSelect = 'hangarSelect';
    } else if (moths[locationName]) {
        tabToActivate = 'moths';
        dropdownToSelect = 'mothSelect';
    }

    if (tabToActivate && dropdownToSelect) {
        showTab(tabToActivate);

        const dropdown = document.getElementById(dropdownToSelect);
        dropdown.value = locationName;
        dropdown.dispatchEvent(new Event('change'));
    }
}

function readString(offset) {
    let result = '';
    while (true) {
        const char = dataView.getUint8(offset++);
        if (char === 0) break;
        result += String.fromCharCode(char);
    }
    return result;
}

function browseFile() {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.sav';
    fileInput.click();

    fileInput.onchange = function () {
        const file = fileInput.files[0];

        if (!file) {
            dataView = null;
            originalFilename = null;
            resetFormData();
            showSnackbar("No file selected.");
            return;
        }

        if (file.name.split('.').pop().toLowerCase() !== 'sav') {
            dataView = null;
            originalFilename = null;
            resetFormData();
            showSnackbar("Invalid file format. Please select a .sav file.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            const fileData = event.target.result;
            dataView = new DataView(fileData);

            if (!verifyVersion()) {
                dataView = null;
                originalFilename = null;
                resetFormData();
                showSnackbar("Invalid file version. The savegame file must be version UIM 6.");
                return;
            }

            resetFormData();
            document.getElementById("savegame").textContent = file.name;
            originalFilename = file.name.split('.').slice(0, -1).join('.');

            EOF_OFFSET = dataView.byteLength;

            moths = {};
            hangars = {};
            pilots = {};

            parseHangars();
            parseMoths();
            parsePilots();
            resolveHangarDisplayNames();
            resolveHangarWantedLists();

            populatePilotDropdown();
            populateMothDropdown();
            populateHangarDropdown();
        };

        reader.onerror = function () {
            showSnackbar("Error reading file");
        };

        reader.readAsArrayBuffer(file);
    };
}

function showSnackbar(message) {
    const snackbar = document.getElementById("snackbar");
    snackbar.textContent = message;
    snackbar.className = "show";
    setTimeout(function () {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
}

function applyChanges() {
    if (!dataView) {
        showSnackbar("No file selected!");
        return;
    }

    try {
        // Apply changes to pilots
        Object.values(pilots).forEach((pilot) => {
            if (pilot.values_changed) {
                dataView.setInt32(pilot.offset + PILOT_CASH_OFFSET, pilot.cash, true);
            }
        });

        // Apply changes to hangars
        Object.values(hangars).forEach((hangar) => {
            if (hangar.values_changed) {
                dataView.setInt32(hangar.offset + HANGAR_CASH_HELD_OFFSET, hangar.cash_held, true);
            }
        });

        // Apply changes to moths
        Object.values(moths).forEach((moth) => {
            if (moth.values_changed) {
                dataView.setInt32(moth.offset + MOTH_SHIELDS_OFFSET, moth.shields, true);
                dataView.setInt32(moth.offset + MOTH_ENGINE_DMG_OFFSET, moth.engine_damage, true);
                dataView.setInt32(moth.offset + MOTH_STRUCTURE_DMG_OFFSET, moth.structure_damage, true);
                dataView.setInt32(moth.offset + MOTH_CPU_DMG_OFFSET, moth.cpu_damage, true);
                dataView.setInt32(moth.offset + MOTH_POWER_DMG_OFFSET, moth.power_damage, true);
                dataView.setInt32(moth.offset + MOTH_WEAPONS_DMG_OFFSET, moth.weapons_damage, true);
            }
        });

        // Create a Blob from the buffer
        const blob = new Blob([dataView.buffer], { type: "application/octet-stream" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${originalFilename}_modified.sav`;

        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("Error modifying savegame: ", error);
        showSnackbar("Error modifying savegame.");
    }
}

function preventNonNumericalInput(e) {
    e = e || window.event;
    var charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
    var charStr = String.fromCharCode(charCode);

    if (!charStr.match(/^[0-9]+$/)) {
        e.preventDefault();
        showSnackbar("Invalid input: Please enter numbers only.");
    }
}

function preventNonNumericalPaste(e) {
    var pasteData = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+$/.test(pasteData)) {
        e.preventDefault();
        showSnackbar("Invalid input: Please enter numbers only.");
    }
}

function calculateItemPrice(basePrice, modifier) {
    return Math.floor((basePrice * modifier) / 0x4000);
}

function getBuyPrice(hangar, item) {
    const flags = dataView.getUint8(hangar.offset + 0x40);

    // Special pricing mode
    if ((flags & 0x02) !== 0) {
        return item.price; // stock record +0x04
    }

    const modifier = dataView.getInt32(hangar.offset + 0x8B4, true);
    return calculateItemPrice(item.price, modifier);
}

function getFitPrice(hangar, item) {
    const flags = dataView.getUint8(hangar.offset + 0x40);

    // Special pricing mode
    if ((flags & 0x02) !== 0) {
        return item.price + 100;
    }

    const modifier = dataView.getInt32(hangar.offset + 0x8B8, true);
    return calculateItemPrice(item.price, modifier);
}

function getItemInfo(item) {
    const definition = ITEM_DEFINITIONS[item.itemIndex];

    if (definition.cargoCount !== undefined &&
        definition.maxUnitsEach !== undefined) {
        return definition.info.replace('%d', definition.cargoCount).replace('%d', definition.maxUnitsEach);
    }

    return definition.info;
}

function isPoliceFaction(hangar) {
    if (!hangar) {
        return false;
    }

    const ownerAddress = dataView.getUint32(hangar.offset + HANGAR_OWNER_OFFSET, true);

    if (!ownerAddress) {
        return false;
    }

    const ownerHangar = Object.values(hangars).find(candidate => candidate.address === ownerAddress);

    return ownerHangar?.name === POLICE_HQ_NAME;
}

function openAboutModal() {
    $('#aboutModal').modal('show');
}

function openStockModal() {
    const selectedHangarName = document.getElementById('hangarSelect').value;
    const hangar = hangars[selectedHangarName];
    const stock = hangar.stock;

    const stockList = document.getElementById('stockList');
    const infoName = document.getElementById('stockInfoName');
    const infoText = document.getElementById('stockInfoText');

    stockList.innerHTML = '';
    infoName.textContent = '';
    infoText.textContent = 'Select an item to view information.';

    const hangarFlags = dataView.getUint8(hangar.offset + 0x40);
    const buyModifier = dataView.getInt32(hangar.offset + 0x8B4, true);
    const fitModifier = dataView.getInt32(hangar.offset + 0x8B8, true);

    stock.forEach(item => {
        const row = document.createElement('div');
        row.className = 'stock-row';

        const itemDefinition = ITEM_DEFINITIONS[item.itemIndex];

        let buyPrice;
        let fitPrice;

        if ((hangarFlags & 0x02) !== 0) {
            buyPrice = item.storedPrice;
            fitPrice = item.storedPrice + 100;
        } else {
            buyPrice = calculateItemPrice(itemDefinition.baseValue, buyModifier);
            fitPrice = calculateItemPrice(itemDefinition.baseValue, fitModifier);
        }

        const canFit = (itemDefinition.flags & 0x06) !== 0;

        row.innerHTML = `
            <span>${item.name}</span>
            <span class="stock-row-stock">${item.stock}</span>
            <span class="stock-row-price">$${buyPrice.toLocaleString()}</span>
            <span class="stock-row-price">${canFit ? `$${fitPrice.toLocaleString()}` : '-'}</span>
        `;

        row.addEventListener('click', () => {
            document.querySelectorAll('.stock-row.selected').forEach(selected => selected.classList.remove('selected'));

            row.classList.add('selected');

            infoName.textContent = item.name;
            infoText.textContent = getItemInfo(item);
        });

        stockList.appendChild(row);
    });

    if (stock.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'stock-row';
        empty.style.cursor = 'default';
        empty.textContent = 'No items in stock.';
        stockList.appendChild(empty);
    }

    $('#stockModal').modal('show');
}

function openEnemiesListModal() {
    const selectedHangarName = document.getElementById('hangarSelect').value;
    const hangar = hangars[selectedHangarName];

    if (!hangar) {
        showSnackbar('No hangar selected.');
        return;
    }

    document.getElementById('enemiesModalLabel').textContent = isPoliceFaction(hangar) ? 'Wanted List' : 'Enemies List';

    const ownerAddress = dataView.getUint32(hangar.offset + HANGAR_OWNER_OFFSET, true);

    if (!ownerAddress) {
        showSnackbar('This hangar has no owner.');
        return;
    }

    const ownerHangar = Object.values(hangars).find(candidate => candidate.address === ownerAddress);

    if (!ownerHangar) {
        showSnackbar('Could not resolve the hangar owner.');
        return;
    }

    const factionStateReference = dataView.getUint32(ownerHangar.offset + HANGAR_FACTION_STATE_OFFSET, true);
    const factionStateIndex = factionStateReference - 0x1000;

    if (factionStateIndex < 0 || factionStateIndex >= 400) {
        showSnackbar('Could not resolve the faction state.');
        return;
    }

    const factionStateOffset = dataView.getUint32(0x150 + (factionStateIndex * 4), true);
    const factionStateSize = dataView.getUint32(0x790 + (factionStateIndex * 4), true);

    if (!factionStateOffset || factionStateSize !== FACTION_STATE_SIZE || factionStateOffset + FACTION_STATE_SIZE > dataView.byteLength) {
        showSnackbar('Could not resolve the faction state.');
        return;
    }

    const pilotByAddress = new Map();

    Object.values(pilots).forEach(pilot => {
        pilotByAddress.set(pilot.address, pilot);
    });

    const enemyPilots = [];

    for (let index = 0; index < FACTION_ENEMIES_MAX_ENTRIES; index++) {
        const pilotAddress = dataView.getUint32(factionStateOffset + (index * 4), true);

        if (!pilotAddress) {
            continue;
        }

        const pilot = pilotByAddress.get(pilotAddress);

        // Some Enemies entries reference non-pilot game objects
        if (!pilot) {
            continue;
        }

        const ratingRaw = dataView.getInt32(
            factionStateOffset +
            FACTION_ENEMIES_RATINGS_OFFSET +
            (index * 4),
            true
        );

        const rating = Math.floor((ratingRaw * 100) / 0x4000);
        const reward = Math.floor((ratingRaw * 2000) / 0x4000);

        enemyPilots.push({
            name: pilot.name,
            rating,
            reward
        });
    }

    /*
        Render Enemies List.
    */
    const enemiesListBody = document.getElementById('enemiesList');
    enemiesListBody.innerHTML = '';

    if (enemyPilots.length === 0) {
        enemiesListBody.innerHTML = `
            <div class="enemies-empty">
                NO ENEMIES
            </div>
        `;
    } else {
        enemyPilots.forEach(pilot => {
            const row = document.createElement('div');
            row.className = 'enemies-row';

            row.innerHTML = `
                <div>${pilot.name}</div>
                <div>${pilot.rating}%</div>
                <div>$${pilot.reward.toLocaleString()}</div>
            `;

            enemiesListBody.appendChild(row);
        });
    }

    $('#enemiesModal').modal('show');
}

document.getElementById('pilotCash').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothShields').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothEngineDamage').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothStructureDamage').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothCpuDamage').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothPowerDamage').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('mothWeaponsDamage').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

document.getElementById('hangarCashHeld').addEventListener('input', function (e) {
    if (e.target.value === '') {
        e.target.value = 0;
    }
});

function showTab(tabId) {
    const tabs = document.querySelectorAll('.editor-tab');
    tabs.forEach(tab => tab.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';

    const tabLinks = document.querySelectorAll('.nav-link');
    tabLinks.forEach(link => link.classList.remove('active'));
    const activeLink = Array.from(tabLinks).find(link => link.innerText.toLowerCase() === tabId);
    if (activeLink) {
        activeLink.classList.add('active');
    }
}

function initializeCustomSelect(select) {
    // Don't initialize the same select twice
    if (select.dataset.customized === 'true') {
        return;
    }

    select.dataset.customized = 'true';

    // Wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'hw-select';

    // Visible selected value
    const display = document.createElement('button');
    display.type = 'button';
    display.className = 'hw-select-display';

    // Dropdown list
    const dropdown = document.createElement('div');
    dropdown.className = 'hw-select-dropdown';

    // Insert wrapper immediately before native select
    select.parentNode.insertBefore(wrapper, select);

    wrapper.appendChild(select);
    wrapper.appendChild(display);
    wrapper.appendChild(dropdown);

    // Hide native select visually
    select.classList.add('hw-native-select');

    function rebuild() {
        dropdown.innerHTML = '';

        Array.from(select.options).forEach(option => {
            const item = document.createElement('div');

            item.className = 'hw-select-option';
            item.textContent = option.textContent;
            item.dataset.value = option.value;

            if (option.value === select.value) {
                item.classList.add('selected');
            }

            item.addEventListener('click', function () {
                select.value = option.value;

                select.dispatchEvent(new Event('change', {
                    bubbles: true
                }));

                sync();

                wrapper.classList.remove('open');
            });

            dropdown.appendChild(item);
        });

        sync();
    }

    function sync() {
        const selectedOption = select.options[select.selectedIndex];

        display.textContent = selectedOption ? selectedOption.textContent : '';

        dropdown.querySelectorAll('.hw-select-option').forEach(item => {
            item.classList.toggle(
                'selected',
                item.dataset.value === select.value
            );
        });
    }

    display.addEventListener('click', function (event) {
        event.stopPropagation();

        // Close any other custom select
        document.querySelectorAll('.hw-select.open').forEach(other => {
            if (other !== wrapper) {
                other.classList.remove('open');
            }
        });

        wrapper.classList.toggle('open');
    });

    let searchBuffer = '';
    let searchTimeout = null;

    display.addEventListener('keydown', function (event) {
        const options = Array.from(select.options);

        if (!options.length) {
            return;
        }

        let index = select.selectedIndex;

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();

                if (index < options.length - 1) {
                    index++;
                }

                select.selectedIndex = index;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync();
                break;

            case 'ArrowUp':
                event.preventDefault();

                if (index > 0) {
                    index--;
                }

                select.selectedIndex = index;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync();
                break;

            case 'Enter':
            case ' ':
                event.preventDefault();
                wrapper.classList.toggle('open');
                break;

            case 'Escape':
                event.preventDefault();
                wrapper.classList.remove('open');
                break;

            case 'Home':
                event.preventDefault();

                select.selectedIndex = 0;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync();
                break;

            case 'End':
                event.preventDefault();

                select.selectedIndex = options.length - 1;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                sync();
                break;

            default:
                // Type-ahead search
                if (event.key.length === 1 && /^[a-z0-9 ]$/i.test(event.key)) {
                    event.preventDefault();

                    clearTimeout(searchTimeout);

                    const key = event.key.toLowerCase();

                    // Pressing the same letter repeatedly cycles through matches
                    if (searchBuffer === key) {
                        const startIndex = (select.selectedIndex + 1) % options.length;

                        for (let i = 0; i < options.length; i++) {
                            const index = (startIndex + i) % options.length;

                            if (options[index].textContent.toLowerCase().startsWith(key)) {
                                select.selectedIndex = index;
                                select.dispatchEvent(new Event('change', { bubbles: true }));
                                sync();
                                break;
                            }
                        }
                    } else {
                        searchBuffer += key;

                        const matchIndex = options.findIndex(option => option.textContent.toLowerCase().startsWith(searchBuffer));

                        if (matchIndex !== -1) {
                            select.selectedIndex = matchIndex;
                            select.dispatchEvent(new Event('change', { bubbles: true }));
                            sync();
                        }
                    }

                    searchTimeout = setTimeout(() => {
                        searchBuffer = '';
                    }, 700);
                }

                break;
        }
    });

    // Existing change events still work normally
    select.addEventListener('change', sync);

    // Expose helpers so dynamically populated selects can be rebuilt
    select.customSelectRebuild = rebuild;
    select.customSelectSync = sync;

    rebuild();
}

function initializeCustomSelects() {
    document.querySelectorAll(
        '#pilotSelect, #mothSelect, #hangarSelect'
    ).forEach(initializeCustomSelect);
}

// Close dropdown when clicking elsewhere
document.addEventListener('click', function () {
    document.querySelectorAll('.hw-select.open').forEach(select => {
        select.classList.remove('open');
    });
});

window.onload = function () {
    resetFormData();
    initializeCustomSelects();
};

showTab('pilots');