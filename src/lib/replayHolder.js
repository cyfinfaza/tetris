import { get, writable } from "svelte/store";
import { inReplay } from "./stores";
import { tick } from "svelte/internal";

export let atIndex = 0;

export let timeline = [];
let stateHolders = {};

export const numStates = writable(0);

let overrideNow = null;
export let nowOffset = null;

export function overrideNowOffset(startTs) {
	if (startTs == null) nowOffset = null;
	else nowOffset = startTs - firstKnownTimestamp();
}

export function now() {
	if (overrideNow) return overrideNow;
	if (nowOffset && get(inReplay)) return Date.now() - nowOffset;
	return Date.now();
}

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
	// console.warn("recordState", stateholder);
	state = JSON.parse(JSON.stringify(state));
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
	let stateAtIndex = timeline[index]?.state;
	if (!stateAtIndex) return;
	Object.keys(stateHolders).forEach((key) => {
		const stateholder = stateHolders[key];
		// console.log(stateholder);
		for (let i = index; i >= 0; i--) {
			stateAtIndex = timeline[i].state;
			// console.log(key, stateAtIndex, i, typeof stateholder.stateFire, stateAtIndex[key]);
			if (typeof stateholder.stateFire === "function" && stateAtIndex[key]) {
				// console.log(key, JSON.parse(stateAtIndex[key]));
				stateholder.stateFire(JSON.parse(JSON.stringify(stateAtIndex[key])));
				break;
			}
		}
	});
	atIndex = index;
}

// export function fireEventAtIndex(index) {
// 	let eventAtIndex = timeline[index].event;
// 	if (!eventAtIndex) return;
// 	console.log(eventAtIndex);
// 	const stateholder = stateHolders[eventAtIndex.stateholder];
// 	console.log(stateholder);
// 	stateholder?.eventFire(eventAtIndex.event);
// }

export function step(applyTime = false) {
	// console.log(atIndex);
	let timelineAtIndex = timeline[atIndex + 1];
	// console.log(timelineAtIndex);
	if (!timelineAtIndex) return false;
	let eventAtIndex = timelineAtIndex.event;
	atIndex++;
	if (!eventAtIndex) return true;
	if (applyTime) overrideNow = timelineAtIndex.timestamp;
	const stateholder = stateHolders[eventAtIndex.stateholder];
	stateholder?.eventFire(eventAtIndex.event);
	return true;
}

function firstKnownTimestamp() {
	for (let i = 0; i < timeline.length; i++) {
		if (timeline[i].timestamp) return timeline[i].timestamp;
	}
	return 0;
}

export function getFrameTimestamp(offset = 0) {
	const nextStamp = timeline[atIndex + offset]?.timestamp;
	// console.log(nextStamp, firstKnownTimestamp());
	if (nextStamp) return nextStamp - firstKnownTimestamp();
	return 0;
}

async function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function* populateStatesGen() {
	goToIndex(0);
	let count = 1;
	await delay(0);
	// const stopinc = Math.floor(timeline.length / 20);
	while (step(true)) {
		// console.log(atIndex);
		// console.log(timeline);
		yield count++ / timeline.length;
		// await delay(0);
		await tick();
		if (count % 100 === 0) await delay(0);
	}
	overrideNow = null;
	console.log(timeline);
}

export async function populateStates() {
	for await (const _ of populateStatesGen()) {
	}
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
