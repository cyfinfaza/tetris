import { writable } from "svelte/store";

let atIndex = 0;

let timeline = [];
let stateHolders = {};

export const numStates = writable(0);

export function recordEvent(stateholder, event, args = []) {
	// console.warn("recordEvent", stateholder);
	timeline.push({ timestamp: Date.now() });
	atIndex = timeline.length - 1;
	timeline[atIndex].event = { stateholder, event };
	if (args.length) timeline[atIndex].args = args;
	numStates.set(timeline.length);
}

export function recordState(stateholder, state) {
	if (timeline.length === 0) timeline.push({ timestamp: Date.now(), state: {} });
	console.warn("recordState", stateholder);
	state = JSON.stringify(state);
	if (!timeline[atIndex].state) timeline[atIndex].state = {};
	// console.log(timeline.length);
	timeline[atIndex].state[stateholder] = state;
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
	let stateAtIndex = timeline[index].state;
	if (!stateAtIndex) return;
	Object.keys(stateHolders).forEach((key) => {
		const stateholder = stateHolders[key];
		// console.log(stateholder);
		for (let i = index; i >= 0; i--) {
			stateAtIndex = timeline[i].state;
			console.log(key, stateAtIndex, i, typeof stateholder.stateFire, stateAtIndex[key]);
			if (typeof stateholder.stateFire === "function" && stateAtIndex[key]) {
				console.log(key, JSON.parse(stateAtIndex[key]));
				stateholder.stateFire(JSON.parse(stateAtIndex[key]));
				break;
			}
		}
	});
}

// export function fireEventAtIndex(index) {
// 	let eventAtIndex = timeline[index].event;
// 	if (!eventAtIndex) return;
// 	console.log(eventAtIndex);
// 	const stateholder = stateHolders[eventAtIndex.stateholder];
// 	console.log(stateholder);
// 	stateholder?.eventFire(eventAtIndex.event);
// }

export function step() {
	let timelineAtIndex = timeline[atIndex];
	if (!timelineAtIndex) return false;
	let eventAtIndex = timelineAtIndex.event;
	atIndex++;
	if (!eventAtIndex) return true;
	const stateholder = stateHolders[eventAtIndex.stateholder];
	stateholder?.eventFire(eventAtIndex.event);
	return true;
}

async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function populateStates() {
	goToIndex(0);
	while (step()) {
		console.log(atIndex);
		// console.log(timeline);
		await delay(10);
	}
	console.log(timeline);
}

window.timeline = timeline;
window.goToIndex = goToIndex;
window.exportReplayTimeline = exportReplayTimeline;

function exportReplayTimeline(meta) {
	const replay = { meta };
	replay.initialState = timeline[0].state;
	replay.timeline = timeline.map((t) => ({
		timestamp: t.timestamp,
		event: t.event ? { stateholder: t.event.stateholder, event: t.event.event, args: t.event.args } : null,
	}));
	return replay;
}

export function importReplayTimeline(replay) {
	timeline = [{ state: replay.initialState }, ...replay.timeline];
}
