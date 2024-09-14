let EOF_OFFSET = 0;
let PILOT_LIST_START = 0;
let HANGAR_LIST_START = 0;
let dataView = null;
let originalFilename = '';

// Pilot constants and offsets
const PILOT_ITERATOR = 0x37C;
const PILOT_NAME_MAX_LENGTH = 19;
const PILOT_SIGNATURE_ADJUST = 0x44;
const PILOT_NAME_OFFSET = 0x4;
const PILOT_STATUS_OFFSET = 0x2C;
const PILOT_LOCATION_OFFSET = 0x30;
const PILOT_CASH_OFFSET = 0x3C;
const PILOT_TYPE_OFFSET = 0x40;
const PILOT_POINTER_OFFSET = 0x48;
const PILOT_FACTION_OFFSET = 0x298;
const PILOT_SIGNATURE = new Uint8Array([
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
]);
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
const MOTH_LIST_START = 0xE0C;
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
const NUM_HANGARS = 251;
const HANGAR_ITERATOR = 0x964;
const HANGAR_NAME_OFFSET = 0x10;
const HANGAR_ENEMIES_LIST_OFFSET = 0x3C;
const HANGAR_OWNER_OFFSET = 0x48;
const HANGAR_POINTER_OFFSET = 0x2C;
const HANGAR_CASH_HELD_OFFSET = 0x8BC;
const HANGAR_BAY_OFFSETS = [0x8D8, 0x8DC, 0x8E0, 0x8E4, 0x8E8, 0x8EC];
const LIMBO_HANGAR_SIGNATURE = new Uint8Array([
    0xE8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4C, 0x69, 0x6D, 0x62,
    0x6F, 0x21, 0x00, 0x00
]);

// Moth shield/damage constants
const MOTH_MAX_SHIELDS = 0x4000;
const MOTH_MAX_ENGINE_DMG = 0x4000;
const MOTH_MAX_STRUCTURE_DMG = 0x4000;
const MOTH_MAX_CPU_DMG = 0x4000;
const MOTH_MAX_POWER_DMG = 0x4000;
const MOTH_MAX_WEAPONS_DMG = 0x4000;

// Objects
let pilots = {};
let moths = {};
let hangars = {};

function resetFormData() {
    document.querySelectorAll('.form-control').forEach(el => el.value = '');
    document.querySelectorAll('.text-primary').forEach(el => el.textContent = '');
    document.querySelectorAll('.form-select').forEach(el => el.innerHTML = '<option value="">Select</option>');
    document.getElementById('savegame').textContent = "No file loaded";
}

function verifyVersion() {
    let versionString = '';
    for (let i = 0; i < 6; i++) {
        versionString += String.fromCharCode(dataView.getUint8(i));
    }
    return versionString === "UIM.06";
}

function getPilotBaseOffset() {
    const signatureLength = PILOT_SIGNATURE.length;

    for (let offset = PILOT_LIST_START; offset < EOF_OFFSET - signatureLength; offset++) {
        let match = true;

        for (let i = 0; i < signatureLength; i++) {
            if (dataView.getUint8(offset + i) !== PILOT_SIGNATURE[i]) {
                match = false;
                break;
            }
        }

        if (match) {
            // Check for valid ANSI string name
            const potentialName = readString((offset + PILOT_SIGNATURE_ADJUST) + PILOT_NAME_OFFSET);
            if (potentialName) {
                return (offset + PILOT_SIGNATURE_ADJUST);
            }
        }
    }

    return -1;
}

function parsePilots() {
    const pilotBaseOffset = getPilotBaseOffset();

    if (pilotBaseOffset === -1) {
        console.warn("Unable to find pilot base offset.");
        return;
    }

    let pilotOffset = pilotBaseOffset;

    while (pilotOffset < EOF_OFFSET) {
        let isPilot = true;
        for (let i = 0; i < PILOT_SIGNATURE.length; i++) {
            if (dataView.getUint8(pilotOffset + i - PILOT_SIGNATURE_ADJUST) !== PILOT_SIGNATURE[i]) {
                isPilot = false;
            }
        }

        if (isPilot) {
            const name = readString(pilotOffset + PILOT_NAME_OFFSET);

            // Skip if the name length exceeds max name length
            if (name.length > PILOT_NAME_MAX_LENGTH) {
                pilotOffset += PILOT_ITERATOR;
                continue;
            }

            const status = dataView.getUint8(pilotOffset + PILOT_STATUS_OFFSET);
            const cash = dataView.getInt32(pilotOffset + PILOT_CASH_OFFSET, true);
            const location = dataView.getUint32(pilotOffset + PILOT_LOCATION_OFFSET, true);
            const faction = dataView.getUint32(pilotOffset + PILOT_FACTION_OFFSET, true);
            const type = dataView.getUint8(pilotOffset + PILOT_TYPE_OFFSET, true);
            const address = dataView.getUint32(pilotOffset - PILOT_POINTER_OFFSET, true);
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

            // Append "(You)" to main player display string
            if (type == 1) {
                pilots[name].name += " (You)";
                pilots[name].is_main_player = true;
            }

        }

        pilotOffset += PILOT_ITERATOR;
    }

    console.log(`Pilots (${Object.keys(pilots).length}):`, pilots);
}

function parseMoths() {
    let currentOffset = MOTH_LIST_START;
    let index = 0;

    // Loop until the first invalid moth is reached
    while (currentOffset <= HANGAR_LIST_START) {
        const pilot = dataView.getUint32(currentOffset + MOTH_PILOT_OFFSET, true);
        const passenger = dataView.getUint32(currentOffset + MOTH_PASSENGER_OFFSET, true);
        const shields = dataView.getInt32(currentOffset + MOTH_SHIELDS_OFFSET, true);
        const engine_damage = dataView.getInt32(currentOffset + MOTH_ENGINE_DMG_OFFSET, true);
        const structure_damage = dataView.getInt32(currentOffset + MOTH_STRUCTURE_DMG_OFFSET, true);
        const cpu_damage = dataView.getInt32(currentOffset + MOTH_CPU_DMG_OFFSET, true);
        const power_damage = dataView.getInt32(currentOffset + MOTH_POWER_DMG_OFFSET, true);
        const weapons_damage = dataView.getInt32(currentOffset + MOTH_WEAPONS_DMG_OFFSET, true);
        const hangar = dataView.getUint32(currentOffset + MOTH_HANGAR_OFFSET, true);
        const address = dataView.getUint32(currentOffset - MOTH_POINTER_OFFSET, true);
        const type = dataView.getUint8(currentOffset + MOTH_TYPE_OFFSET, true);
        const name = `MOTH_0x${index == 0 ? '????????' : address.toString(16).toUpperCase()}`;   // First moth isn't preceded by dynamic address
        const values_changed = false;

        // Break loop on first invalid moth type
        if (!MOTH_TYPE[type]) {
            break;
        }

        // Break loop on first invalid moth shield/damage values
        if (shields < 0 || engine_damage < 0 || structure_damage < 0 || cpu_damage < 0 || power_damage < 0 || weapons_damage < 0
            || shields > MOTH_MAX_SHIELDS || engine_damage > MOTH_MAX_ENGINE_DMG || structure_damage > MOTH_MAX_STRUCTURE_DMG
            || cpu_damage > MOTH_MAX_CPU_DMG || power_damage > MOTH_MAX_POWER_DMG || weapons_damage > MOTH_MAX_WEAPONS_DMG) {
            break;
        }

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

        currentOffset += MOTH_ITERATOR;
        index++;
    }

    console.log(`Moths (${Object.keys(moths).length}): `, moths);
}

function parseHangars() {
    HANGAR_LIST_START = getHangarListStart();

    if (HANGAR_LIST_START == -1) {
        showSnackbar("Error parsing hangar data.");
        return;
    }

    let hangarOffsets = [];
    hangarOffsets[0] = HANGAR_LIST_START;

    for (let i = 1; i < NUM_HANGARS + 1; i++) {
        hangarOffsets[i] = hangarOffsets[i - 1] + HANGAR_ITERATOR;
    }

    PILOT_LIST_START = hangarOffsets[NUM_HANGARS] + HANGAR_ITERATOR;

    hangarOffsets.forEach(hangarOffset => {
        const name = readString(hangarOffset + HANGAR_NAME_OFFSET, true);
        const owner = dataView.getUint32(hangarOffset + HANGAR_OWNER_OFFSET, true);
        const cash_held = dataView.getInt32(hangarOffset + HANGAR_CASH_HELD_OFFSET, true);
        const address = dataView.getInt32(hangarOffset - HANGAR_POINTER_OFFSET, true);
        const values_changed = false;

        const bays = HANGAR_BAY_OFFSETS.map(offset => {
            const bayAddress = dataView.getUint32(hangarOffset + offset, true);
            if (bayAddress === 0) {
                return "Empty";
            } else if (moths[bayAddress]) {
                return moths[bayAddress].name;
            } else {
                return `0x${bayAddress.toString(16).toUpperCase()}`; // Fallback to the dynamic address if no moth is found
            }
        });

        hangars[name] = {
            name: name,
            offset: hangarOffset,
            address: address,
            owner: `0x${owner.toString(16).toUpperCase()}`,
            cash_held: cash_held,
            bays: bays,
            values_changed: values_changed
        };
    });

    const finalHangarOffset = hangarOffsets[NUM_HANGARS];
    setLimboHangarAddress(finalHangarOffset);

    console.log(`Hangars (${Object.keys(hangars).length}): `, hangars);
}

function setLimboHangarAddress(finalHangarOffset) {
    const limboHangarPointerAddressOffset = finalHangarOffset + HANGAR_ITERATOR;
    const limboHangarPointerAddress = dataView.getUint32(limboHangarPointerAddressOffset, true);
    const limboHangar = hangars["Limbo!"];
    limboHangar.address = limboHangarPointerAddress;
}

// function findAllOffsets(signature) {
//     const memoryContent = new Uint8Array(dataView.buffer.slice(0, EOF_OFFSET));
//     const offsets = [];
//     for (let offset = 0; offset < memoryContent.length - signature.length; offset++) {
//         let match = true;
//         for (let i = 0; i < signature.length; i++) {
//             if (memoryContent[offset + i] !== signature[i]) {
//                 match = false;
//                 break;
//             }
//         }
//         if (match) {
//             offsets.push(offset);
//         }
//     }
//     return offsets;
// }

function getHangarListStart() {
    const memoryContent = new Uint8Array(dataView.buffer.slice(0, EOF_OFFSET));
    const signature = LIMBO_HANGAR_SIGNATURE;
    const signatureLength = signature.length;

    for (let offset = 0; offset <= memoryContent.length - signatureLength; offset++) {
        let match = true;

        for (let i = 0; i < signatureLength; i++) {
            if (memoryContent[offset + i] !== signature[i]) {
                match = false;
                break;
            }
        }

        if (match) {
            return offset;
        }
    }

    console.warn("Unable to find hangar entity list.");
    return -1;
}

function populatePilotDropdown() {
    const dropdown = document.getElementById('pilotSelect');
    dropdown.innerHTML = '';
    let mainPilotIndex = 0;

    Object.keys(pilots).forEach((pilotName, index) => {
        const option = document.createElement('option');
        option.value = pilotName;

        // Append "(You)" to the main player's name
        if (pilots[pilotName].is_main_player) {
            option.textContent = `${pilotName} (You)`;
            mainPilotIndex = index;
        } else {
            option.textContent = pilotName;
        }

        dropdown.appendChild(option);
    });

    dropdown.selectedIndex = mainPilotIndex;
    updatePilotInfo(dropdown.value);

    dropdown.addEventListener('change', function () {
        updatePilotInfo(dropdown.value);
    });
}

function populateMothDropdown() {
    const dropdown = document.getElementById('mothSelect');
    dropdown.innerHTML = '';

    Object.keys(moths).forEach(mothPointer => {
        const moth = moths[mothPointer];
        const option = document.createElement('option');
        option.value = mothPointer;
        option.textContent = moth.name;
        dropdown.appendChild(option);
    });

    dropdown.addEventListener('change', function () {
        const selectedMothName = dropdown.value;
        updateMothInfo(selectedMothName);
    });

    dropdown.dispatchEvent(new Event('change'));
}

function populateHangarDropdown() {
    const dropdown = document.getElementById('hangarSelect');
    dropdown.innerHTML = '';

    Object.keys(hangars).forEach(hangarName => {
        const option = document.createElement('option');
        option.value = hangarName;
        option.textContent = hangarName;
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
        }
    });

    dropdown.dispatchEvent(new Event('change'));
}

function updateHangarOwner(elementId, ownerAddress) {
    const element = document.getElementById(elementId);

    if (ownerAddress === "None" || ownerAddress === 0 || ownerAddress == 0x0) {
        element.textContent = "None";
        element.style.color = 'black';
        element.style.cursor = 'default';

        const newElement = element.cloneNode(true);
        element.replaceWith(newElement);

    } else {
        const ownerPilot = Object.values(pilots).find(pilot => pilot.address === parseInt(ownerAddress, 16));

        if (ownerPilot) {
            element.textContent = ownerPilot.name;
            element.style.color = '#007bff';
            element.style.cursor = 'pointer';

            element.replaceWith(element.cloneNode(true));
            const newElement = document.getElementById(elementId);
            newElement.addEventListener('click', function () {
                handlePilotClick(ownerPilot.name);
            });

        } else {
            const ownerHangar = Object.values(hangars).find(hangar => hangar.address === parseInt(ownerAddress, 16));

            if (ownerHangar) {
                element.textContent = ownerHangar.name;
                element.style.color = '#007bff';
                element.style.cursor = 'pointer';

                element.replaceWith(element.cloneNode(true));
                const newElement = document.getElementById(elementId);
                newElement.addEventListener('click', function () {
                    handleLocationClick(ownerHangar.name);
                });

            } else {
                element.textContent = `0x${parseInt(ownerAddress, 16).toString(16).toUpperCase()}`;
                element.style.color = 'black';
                element.style.cursor = 'default';

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
        newElement.style.color = 'black';
        newElement.style.cursor = 'default';
    } else {
        const matchingMoth = Object.values(moths).find(moth => moth.address === bayAddressNumber);

        if (matchingMoth) {
            newElement.textContent = matchingMoth.name;
            newElement.style.color = '#007bff';
            newElement.style.cursor = 'pointer';
            newElement.addEventListener('click', function () {
                handleMothClick(matchingMoth.name);
            });
        } else {
            newElement.textContent = `0x${bayAddressNumber.toString(16).toUpperCase()}`;
            newElement.style.color = 'black';
            newElement.style.cursor = 'default';
        }
    }
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
        const isRecognizedLocation = !locationName.startsWith("0x");

        locationElement.textContent = locationName;
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
                    newFactionElement.style.cursor = 'pointer';
                    newFactionElement.style.color = '#007bff';
                    newFactionElement.classList.remove('unrecognized-faction');
                    newFactionElement.classList.add('recognized-faction');

                    newFactionElement.addEventListener('click', function () {
                        handleLocationClick(hangarName);
                    });

                    isRecognizedFaction = true;
                    break;
                }
            }

            if (!isRecognizedFaction) {
                newFactionElement.textContent = `0x${factionAddress.toString(16).toUpperCase()}`;
                newFactionElement.classList.add('unrecognized-faction');
                newFactionElement.classList.remove('recognized-faction');
                newFactionElement.style.cursor = 'default';
                newFactionElement.style.color = 'black';
            }

        } else {
            newFactionElement.textContent = "None";
            newFactionElement.classList.add('unrecognized-faction');
            newFactionElement.classList.remove('recognized-faction');
            newFactionElement.style.cursor = 'default';
            newFactionElement.style.color = 'black';
        }

        if (isRecognizedLocation) {
            locationElement.classList.remove('unrecognized-location');
            locationElement.style.cursor = 'pointer';
            locationElement.style.color = '#007bff';

            locationElement.replaceWith(locationElement.cloneNode(true));
            const newLocationElement = document.getElementById('pilotLocation');
            newLocationElement.addEventListener('click', function () {
                handleLocationClick(locationName);
            });
        } else {
            locationElement.classList.add('unrecognized-location');
            locationElement.style.cursor = 'default';

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
        mothTypeElement.style.color = "black !important";

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
        let pilotName = `0x${pilotPointer.toString(16).toUpperCase()}`;

        let isRecognizedPilot = false;

        if (pilotPointer === 0) {
            pilotName = "None";
        } else {
            for (const pilotKey in pilots) {
                if (pilots[pilotKey].address === pilotPointer) {
                    pilotName = pilots[pilotKey].name;
                    isRecognizedPilot = true;
                    break;
                }
            }
        }

        pilotElement.textContent = pilotName;

        if (isRecognizedPilot) {
            pilotElement.classList.remove('unrecognized-location');
            pilotElement.style.cursor = 'pointer';
            pilotElement.style.color = '#007bff';

            pilotElement.replaceWith(pilotElement.cloneNode(true));
            const newPilotElement = document.getElementById('mothPilot');
            newPilotElement.addEventListener('click', function () {
                handlePilotClick(pilotName);
            });
        } else {
            pilotElement.classList.add('unrecognized-location');
            pilotElement.style.cursor = 'default';
            pilotElement.style.color = 'black';

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

            if (passengerPointer !== 0) {
                const matchedPilot = Object.values(pilots).find(pilot => pilot.address === passengerPointer);
                if (matchedPilot) {
                    passengerName = matchedPilot.name;
                    isRecognizedPassenger = true;
                }
            }

            passengerElement.textContent = passengerName;

            if (isRecognizedPassenger) {
                passengerElement.classList.remove('unrecognized-location');
                passengerElement.style.cursor = 'pointer';
                passengerElement.style.color = '#007bff';

                passengerElement.onclick = function () {
                    handlePilotClick(passengerName);
                };
            } else {
                passengerElement.classList.add('unrecognized-location');
                passengerElement.style.cursor = 'default';
                passengerElement.style.color = 'black';

                // Remove click event if unrecognized
                passengerElement.onclick = null;
            }
        } else {
            formGroupPassenger.style.display = 'none';
        }

        const hangarElement = document.getElementById("mothHangar");

        const hangarPointer = selectedMoth.hangar;
        let hangarName = "";
        let isRecognizedHangar = false;

        if (hangarPointer === 0) {
            hangarName = "None";
        } else {
            for (const hangar in hangars) {
                if (parseInt(hangars[hangar].address) === hangarPointer) {
                    hangarName = hangars[hangar].name;
                    isRecognizedHangar = true;
                    break;
                }
            }
        }

        hangarElement.textContent = hangarName;

        if (isRecognizedHangar) {
            hangarElement.classList.remove('unrecognized-location');
            hangarElement.style.cursor = 'pointer';
            hangarElement.style.color = '#007bff';

            hangarElement.replaceWith(hangarElement.cloneNode(true));
            const newHangarElement = document.getElementById('mothHangar');

            newHangarElement.addEventListener('click', function () {
                handleLocationClick(hangarName);
            });
        } else {
            hangarElement.classList.add('unrecognized-location');
            hangarElement.style.cursor = 'default';
            hangarElement.style.color = 'black';

            hangarElement.replaceWith(hangarElement.cloneNode(true));
            const newHangarElement = document.getElementById('mothHangar');

            newHangarElement.textContent = "None";
        }
    }
}

function handlePilotClick(pilotName) {
    // Remove the "(You)" suffix if it exists
    const cleanedPilotName = pilotName.replace(' (You)', '');

    if (cleanedPilotName !== "None" && !cleanedPilotName.startsWith("0x")) {
        showTab('pilots');
        const pilotDropdown = document.getElementById('pilotSelect');
        pilotDropdown.value = cleanedPilotName;
        updatePilotInfo(cleanedPilotName);
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

function openAboutModal() {
    $('#aboutModal').modal('show');
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

window.onload = resetFormData;
showTab('pilots');