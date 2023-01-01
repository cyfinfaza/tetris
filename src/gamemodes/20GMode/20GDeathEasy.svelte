<script>
	import InstaGravDeath from "./20GDeath.svelte"

	const sectionTargetTime = 75000; // 1:15.00

	const torikans = [
		{ level: 500, time: 284000 }, // 500 @ 4:44.00
		{ level: 1000, time: 568000} // 1000 @ 9:28.00
	]

	function garbageTargetCurve(level) {
		if (level < 500)  return null;
		if (level < 600)  return 25;
		if (level < 700)  return 18;
		if (level < 800)  return 12;
		if (level < 900)  return 9;
		if (level < 1000) return 8;
		return null;
	}

	function lockDelayCurve(level) {
		if (level < 200)  return 45;
		if (level < 300)  return 40;
		if (level < 400)  return 35;
		if (level < 500)  return 30;
		if (level < 600)  return 25;
		if (level < 1100) return 23;
		if (level < 1300) return 20;
		return 45;
	}
</script>

<InstaGravDeath
	{sectionTargetTime} {torikans} {garbageTargetCurve} {lockDelayCurve} gradePrefix=""
/>