import { writable } from "svelte/store";

let timeline = [];
let stateHolders = {};

export const numStates = writable(0);

export function recordEvent(stateholder, event, args = []) {
	console.warn("recordEvent", stateholder);
	timeline.push({ timestamp: Date.now() });
	timeline[timeline.length - 1].event = { stateholder, event };
	if (args.length) timeline[timeline.length - 1].args = args;
	numStates.set(timeline.length);
}

export function recordState(stateholder, state) {
	if (timeline.length === 0) timeline.push({ timestamp: Date.now(), state: {} });
	console.warn("recordState", stateholder);
	state = JSON.stringify(state);
	if (!timeline[timeline.length - 1].state) timeline[timeline.length - 1].state = {};
	console.log(timeline.length);
	timeline[timeline.length - 1].state[stateholder] = state;
	numStates.set(timeline.length);
}

export function reset() {
	timeline = [];
	numStates.set(0);
}

export function registerStateholder(stateholder, { eventFire, stateFire }) {
	stateHolders[stateholder] = { eventFire, stateFire };
}

export function goToIndex(index) {
	const stateAtIndex = timeline[index].state;
	if (stateAtIndex) {
		Object.keys(stateHolders).forEach((key) => {
			const stateholder = stateHolders[key];
			// console.log(stateholder);
			if (typeof stateholder.stateFire === "function" && stateAtIndex[key]) {
				console.log(key, stateAtIndex[key]);
				stateholder.stateFire(JSON.parse(stateAtIndex[key]));
			}
		});
	}
}

window.timeline = timeline;
window.goToIndex = goToIndex;
