# HardWar Savegame Editor
This is a savegame editor for the cyberpunk retro game HardWar. This editor was created as an experiment on the highly dynamic data structures of its savegame file. While it mostly serves as a savegame parser,
it does have the ability to edit basic information like pilot cash, moth health/shields, and hangar cash.

## Instructions
To use this editor, simply navigate to the deployment page [Here](https://julianozelrose.github.io/HardWar-SaveEdit/#). You can begin editing a savegame by clicking 'Browse', then selecting your savegame file.
Note that this editor only supports UIM 6 savegames. Use the tab control to navigate between moths, pilots and hangars. Use the dropdown to select the moth, hangar, or pilot you wish to edit. Click 'Save' when you are done,
and the editor will generate a new savegame file based on the modifications made.

![HardWar-SaveEdit-UI](https://github.com/user-attachments/assets/4231fb54-d1d0-440b-82b3-8f08ad45f905)


# Savegame data structures
The data structures of the HardWar savegame are highly dynamic. Almost nothing is stored statically on the
file. There are a few exceptions, namely the dynamic player pointer offset and the moth entity list start offset.
Because the entity lists for hangars and pilots are both dynamically allocated themselves, as well as nested
between more dynamic data, it presents many challenges for accurately parsing the game information.

| **Data Structure** | **Iterator** | **Start**    |
| :---               | :---         | :---         |
| Moth               | 0x458        | 0xE0C        |
| Hangar             | 0x964        | Dynamic      |
| Pilot              | 0x37C        | Dynamic      |

## Moths
The moth entity list begins on offset 0xE0C. With each moth data structure being 0x37C in size, this
value can be used as an iterator to step through the moth entity list. Stored at the end of the moth data structure is
a pointer to the dynamic address of the next moth in the entity list.

When a moth is destroyed, it is removed from the moth entity list. So the moth "array" is more than likely
a vector, rather than an array. This is also useful to know when the moth entity list has ended, as you can
break the loop when a moth with impossible values are detected.

| **Offset** | **Type** | **Description**      |
| :---       | :---     | :---                 |
| 0x1D0      | UInt32   | Hangar               |
| 0x1DC      | UInt32   | Type                 |
| 0x294      | Int32    | Shields              |
| 0x298      | Int32    | Engine Damage        |
| 0x29C      | Int32    | Structure Damage     |
| 0x2A0      | Int32    | CPU Damage           |
| 0x2A4      | Int32    | Power Damage         |
| 0x2A8      | Int32    | Weapons Damage       |
| 0x2DC      | UInt32   | Pilot                |
| 0x2E0      | UInt32   | Passenger            |

For the moth data structure itself, the value on offset 0x1D0 points to the hangar that the moth is currently parked in.
If the moth is not in a hangar, then it becomes a null pointer. Similarly, the values on offsets 0x2DC and 0x2E0 are
both pointers that point to the pilot and the passenger, respectively. If there is no pilot or passenger, they also
become null pointers. The value stored on offset 0x1DC stores the "type" of moth (see the table below). The remaining offsets hold the values of shields and damage.

| **Value**     | **Moth**              |
| :---          | :---                  |
| 1             | Moon Moth             |
| 2             | Silver Y              |
| 3             | NeoTiger              |
| 4             | Hawk                  |
| 5             | Deaths Head           |
| 6             | Police Moth           |
| 7             | Alien                 |
| 8             | Swallow               |

## Hangars
The hangar entity list is stored after the moth entity list. However, there is more dynamic data between the hangar entity list and the moth entity list. Since there are
a fixed number of hangars, with the Limbo! hangar being the first in the hangar list, it is simpler to do a signature search for the Limbo! hangar to identify the start
of the hangar entity list:

```
const LIMBO_HANGAR_SIGNATURE = new Uint8Array([
    0xE8, 0x03, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4C, 0x69, 0x6D, 0x62,
    0x6F, 0x21, 0x00, 0x00
]);
```

A search for this pattern should yield exactly 1 result, with the first offset being the start of the Limbo! hangar, and the hangar entity list itself as well. With the offset of
the first hangar in the entity list, it is then possible to step through the hangar entity list using the iterator 0x964. Since there are a fixed number of hangars in the game,
you can terminate the loop after 251 iterations.

## Pilots
After the hangar entity list is the final entity list; pilots. Since there is more dynamic data between the hangar entity list and the pilot entity list, it is difficult to determine
the exact start with accuracy. However, it is possible to search for the unique signature that precedes the pilot data structure to find the first index of the entity list:

```
const PILOT_SIGNATURE = new Uint8Array([
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,
    0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF
]);
```

This signature appears to be some sort of "memory end region", as it consistently precedes each pilot entity. If you do a check for invalid pilot names (invalid character or exceeding max length)
you can continue to step through the pilot entity list until the end of the file. This seems to work well, as the pilot entity list is the final entity list in the savegame. It appears to be followed
by V-tables.
