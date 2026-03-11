/**
 * Naija Pidgin commentary translations for F1 race control messages.
 *
 * Rules are evaluated top-to-bottom; first match wins.
 * Returns null if no Pidgin line is available (don't show subtitle).
 */

const RULES: [RegExp, string][] = [
	// Flags / Session states
	[/red flag/i,                          "Dem don stop race! Red flag o! 🔴"],
	[/chequered flag/i,                    "Race don finish! Chequered flag don wave! 🏁"],
	[/track clear/i,                       "Track don clear — race dey continue! 🟢"],
	[/green flag/i,                        "Green light! Make una go! 🟢"],
	[/race resum/i,                        "Race don resume — buckle up! 🟢"],

	// Virtual Safety Car — MUST come before generic Safety Car rules
	// ("VIRTUAL SAFETY CAR DEPLOYED" contains "safety car deployed" as a substring)
	[/virtual safety car deployed/i,       "Virtual Safety Car don activate — slow down! 🟡"],
	[/virtual safety car ending/i,         "VSC don end — prepare to push! 🟡"],
	[/virtual safety car/i,               "Na Virtual Safety Car dem call 🟡"],

	// Safety Car
	[/safety car deployed/i,               "Safety Car don enter track o! 🟡"],
	[/safety car in this lap/i,            "Safety Car go enter this lap 🟡"],
	[/safety car period end/i,             "Safety Car don leave track! Time to attack! 🏎️"],
	[/safety car/i,                        "Na Safety Car situation 🟡"],

	// DRS
	[/drs enabled/i,                       "DRS don open — overtake season! 🏎️💨"],
	[/drs disabled/i,                      "DRS don close, e don be like that 🔒"],

	// Lap record / Fastest
	[/fastest lap/i,                       "Driver set fastest lap! Dem dey fly! 💜"],
	[/new lap record/i,                    "New lap record! E be like magic! 💜⚡"],

	// Penalties / Investigations
	[/drive[\s-]through penalty/i,         "Dem don give drive-through penalty o! 📋"],
	[/stop[\s-]and[\s-]go penalty/i,       "Stop and go penalty! Wahala for driver 📋"],
	[/time penalty/i,                      "Time penalty don land on driver o! ⏱️"],
	[/penalty/i,                           "Penalty don enter — referee don blow whistle 📋"],
	[/no further action/i,                 "Dem say nothing do am! Investigation don close ✅"],
	[/under investigation/i,               "Dem dey investigate the matter 🔍"],
	[/investigation/i,                     "Stewards dey look into something 🔍"],
	[/reprimand/i,                         "Dem don give driver official warning 📋"],

	// Pit lane
	[/pit lane open/i,                     "Pit lane don open! Go change tyres 🔧"],
	[/pit lane closed/i,                   "Pit lane don close — no pit for now 🔧"],

	// Yellow flags
	[/double yellow/i,                     "Double yellow! Danger ahead — reduce speed! ⚠️⚠️"],
	[/yellow/i,                            "Yellow flag! Take am easy for that sector ⚠️"],

	// Sector incidents
	[/incident/i,                          "Incident don happen somewhere on track 👀"],
	[/collision/i,                         "Collision! Cars don touch! 💥"],
	[/retirement/i,                        "Driver don retire — park the car o 🏁"],
	[/mechanical/i,                        "Mechanical wahala don affect driver 🔧"],

	// Car
	[/debris/i,                            "Debris dey on track — watch yourself 🗑️"],
	[/car stopped/i,                       "Car don stop for track — danger zone ahead ⚠️"],
	[/car on track/i,                      "Car on track — slow down! ⚠️"],
];

export function pidginTranslate(message: string): string | null {
	for (const [pattern, translation] of RULES) {
		if (pattern.test(message)) return translation;
	}
	return null;
}
