
s.options.memSize = 2000000;
s.latency = 0;

s.waitForBoot {
	var fxChain, delayTail, preEmphasis;
	var s, play, beat, trigger, playP, wait, master;
	s = Server.default;
	beat = 60 / 190;

	~fxBus = ~fxBus ?? { Bus.audio(s, 2) };
	~masterBus = ~masterBus ?? { Bus.audio(s, 2) };

	fxChain = { |snd, fx|
		Select.ar(DC.ar(fx), [
			(snd * 0.5) + (CombC.ar(snd, 0.1, 1 / 40, Rand(-0.1, -0.9)) * 0.5),
			Latch.ar(snd, Impulse.ar(4000 * IRand(1, 2))),
			PitchShift.ar(snd, 0.01, 1.2) * 4.dbamp,
			(snd * 0.5) + (CombC.ar(snd, 0.1, 1 / 90, 0.1) * 0.5),
			snd * SinOsc.ar(ZeroCrossing.ar(snd.sum).lag(0.01)) * 4.dbamp,
			GVerb.ar(snd.sum * -23.dbamp, 10, 1, maxroomsize: 15),
		]);
	};

	delayTail = {
    |snd, times|
    snd + DelayC.ar(HPF.ar(LPF.ar(snd, 3000), 200) * -20.dbamp, 0.2, times)
  };

	preEmphasis = {
    |snd, fn, db = 3|
		var shaped = BHiShelf.ar(BLowShelf.ar(snd, 200, 0.3, db.neg), 2000, 0.3, db.neg);
		BHiShelf.ar(BLowShelf.ar(fn.(shaped), 200, 0.3, db), 2000, 0.3, db);
	};

	~synthLevels = (
		kick: -8,
		kick2: -8,
		rim: -8,
		snare: -8,
		rim2: -8,
		clap: -8,
		bass: -9,
		pad: -13,
		fx: -4.5,
		glitch: -16,
		glitch2: -20,
	);

	SynthDef(\kick, {
		var snd;
		snd = SinOsc.ar(\freq.kr(60) * (Env.perc(0, 0.1, curve: -8).ar * 50).midiratio * XLine.ar(1, 0.5, 0.2));
		snd = snd * (1 + (10 * Env.perc(0, 0.001).ar));
		snd = snd + (Env.perc(0.001, 0.01).ar * HPF.ar(Hasher.ar(Sweep.ar), 3200));
		snd = snd.clip2 + (snd.fold2 * -10.dbamp);
		snd = snd * Env.perc(0.001, 0.4).ar;
		snd = delayTail.(snd, [31e-3, 41e-3]);
		snd = snd * Env.linen(0, 0.3, 0.1, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\kick].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

  SynthDef(\kick2, {
		var snd;
		snd = SinOsc.ar(Env.perc(0, 0.15).ar.linexp(0, 1, 60, 300) * XLine.ar(4, 1, 0.01) * XLine.ar(1, 0.7, 1.2));
		snd = snd * Env.perc(0.001, 0.5).ar;
		snd = snd + (Env.perc(0.001, 0.01).ar * Hasher.ar(Sweep.ar) * -10.dbamp);
		snd = snd * (1 + (3 * Env.perc(0.0, 0.1).ar));
		snd = snd.tanh;
		snd = BLowShelf.ar(snd, 200, 0.3, 4);
		snd = snd + LPF.ar(HPF.ar(DelayC.ar(snd * -30.dbamp, 0.02, [12e-3, 34e-3]), 200), 3000);
		snd = fxChain.(snd, \fx.kr(0));
		snd = snd * Env.linen(0.001, \duration.kr(0.3), 0.03, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\kick2].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\clap, {
		var snd;
		snd = { WhiteNoise.ar } ! 3;
		snd = BPF.ar(snd, 1230 * [0.9, 1, 1.1], 0.3);
		snd = snd * Env([0, 10, 2.0, 0], [0.001, 0.05, 0.3], curve: -4).delay([0.022, 0, 0.034]).ar;
		snd = snd * -3.dbamp;
		snd = snd.clip2;
		snd = BHiShelf.ar(snd, 3400, 0.3, -3);
		snd = Splay.ar(snd, 0.7);
		snd = snd + LPF.ar(GVerb.ar(snd.sum * -12.dbamp, 50, 5, maxroomsize: 55), 3240);
		snd = HPF.ar(snd, 400);

		snd = snd * Env.linen(0, 0, 5.0, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\clap].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\bass, {
		var snd, freq, duration;
		duration = \duration.kr(0.5);
		freq = \freq.kr(0) * { Rand(0.994, 1.006) }!2;
		snd = LFSaw.ar(freq/2);
		snd = snd * -8.dbamp;
		snd = MoogFF.ar(snd, XLine.kr(ExpRand(300, 3000), ExpRand(300, 3000), duration), Rand(2, 3.5)) * 20.dbamp;
		snd = MoogFF.ar(snd, XLine.kr(ExpRand(300, 3000), ExpRand(300, 3000), duration), Rand(1.5, 2.5)) * 5.dbamp;
		snd = snd + LFPulse.ar(freq/2 + { Rand(0.003, 0.2) }!3 );
		snd = Splay.ar(snd);
		snd = LeakDC.ar(snd);
		snd = snd * Env.perc(0.001, duration, curve: -4).ar(Done.freeSelf);
		snd = snd * \amp.kr(1) * ~synthLevels[\bass].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\rim, {
		var snd;
		snd = SinOsc.ar(\freq.kr(1700) * \scale.kr(1) * [0.9, 1, 0.7, 0.5, 2.6] * XLine.ar(1.3, 1, 0.002));
		snd = snd * Env.perc(0.001, [0.005, 0.003, 0.02, 0.01, 0.01]).ar;
		snd = snd.sum;
		snd = snd * (1 + (20 * Env.perc(0, 0.001).ar));
		snd = snd.clip2;
		snd = snd + (Env.linen(0, 0.01, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 6200, 0.3));
		snd = snd + (Env.linen(0, 0.005, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 8200, 0.3));
		snd = snd + PitchShift.ar(snd, 0.013, 1.3);
		snd = snd + PitchShift.ar(snd, 0.023, 1.5);
		snd = snd * (1 + (0.3 * Env.perc(0, 0.001).ar));
		snd = delayTail.(snd, [31e-3, 11e-3]);
		snd = snd * Env.linen(0, \duration.kr(0.1), 0.0, curve: -4).ar(Done.freeSelf);
		snd = fxChain.(snd, \fx.kr(0));
		snd = snd * ~synthLevels[\rim].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

  SynthDef(\rim2, {
		var snd, velocity;
		velocity = \velocity.kr(1);
		snd = SinOsc.ar(\freq.kr(3000) * [0.9, 1, 0.7, 0.5, 2.6] * XLine.ar(1.3, 1, 0.002));
		snd = snd * Env.perc(0.001, [0.005, 0.003, 0.02, 0.01, 0.01] * 0.5).ar;
		snd = snd.sum;
		snd = snd * (1 + (5 * Env.perc(0, 0.001).ar * velocity));
		snd = snd.clip2;
		snd = snd + (Env.linen(0, 0.02, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 1200, 0.3));
		snd = snd + (Env.linen(0, 0.03, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 4200, 0.3));
		snd = snd + PitchShift.ar(snd * velocity, 0.043, 2.0);
		snd = snd + PitchShift.ar(snd * velocity, 0.073, 2.5);
		snd = snd * (1 + (0.3 * Env.perc(0, 0.001).ar));
		snd = LPF.ar(snd, velocity.max(0.0001).linexp(0, 1, 100, 16000));
		snd = delayTail.(snd, [31e-3, 11e-3]);
		snd = snd * Env.linen(0, \duration.kr(0.1), 0.0, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\rim2].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\snare, {
		var snd, velocity;
		velocity = \velocity.kr(1);
		snd = SinOsc.ar(\freq.kr(2000) * \scale.kr(1) * [0.9, 1, 0.7, 0.5, 2.6] * XLine.ar(1.3, 1, 0.002));
		snd = snd * Env.perc(0.001, [0.005, 0.003, 0.02, 0.01, 0.01] * 0.5).ar;
		snd = snd.sum;
		snd = snd * (1 + (10 * Env.perc(0, 0.001).ar * velocity));
		snd = snd.clip2;
		snd = snd + (Env.linen(0, 0.05, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 2200, 0.3));
		snd = snd + (Env.linen(0, 0.01, 0).ar * BPF.ar(Hasher.ar(Sweep.ar), 3200, 0.3));
		snd = snd + PitchShift.ar(snd * velocity, 0.003, 1.3);
		snd = snd + PitchShift.ar(snd * velocity, 0.033, 1.5);
		snd = LPF.ar(snd, velocity.max(0.0001).linexp(0, 1, 100, 16000));
		snd = delayTail.(snd, [41e-3, 31e-3]);
		snd = snd * Env.linen(0, \duration.kr(0.1), 0.0, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\snare].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\glitch, {
		var snd;
		snd = SinOsc.ar(ExpRand(100, 16e3)) * Rand(0, 20);
		snd = SinOsc.ar(ExpRand(1000, 16e3), snd);
		snd = snd * (1 + (2 * Env.perc(0, \clickTime.kr(0.001)).ar));
		snd = Pan2.ar(snd, Rand(-0.5, 0.5));
		snd = snd * Env.linen(0, Rand(0.001, 0.03), 0.0, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\glitch].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\glitch2, {
		var snd;
		snd = SinOsc.ar(TIRand.ar(0, 1, Impulse.ar(300)).linexp(0, 1, ExpRand(100, 8000), ExpRand(2000, 8000)));
		snd = Pan2.ar(snd, Rand(-0.5, 0.5));
		snd = snd * Env.linen(0, ExpRand(0.001, 0.5), 0.0, curve: -4).ar(Done.freeSelf);
		snd = snd * ~synthLevels[\glitch2].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\pad, {
		var snd, notes, swell, filt, fadeIn;
		notes = [50.midicps, 57.midicps, Lag.kr(\note2.kr(60), 0.5).midicps, Lag.kr(\note3.kr(64), 0.5).midicps, 69.midicps];
		fadeIn = EnvGen.kr(Env([0, 1], [8], -2));
		swell = LFNoise1.kr(0.025).range(0.65, 1.0);
		filt = LFNoise1.kr(0.04).range(350, 1200);

		snd = Mix.fill(notes.size, { |i|
			var detune = LFNoise1.kr(Rand(0.02, 0.07)).range(-0.04, 0.04).midiratio;
			var n = notes[i] * detune;
			var width = LFNoise1.kr(Rand(0.015, 0.05)).range(0.4, 0.6);
			var puls = Pulse.ar(n, width) * 0.6;
			var wave = LFPulse.ar(n) * 0.4;
			Pan2.ar(puls + wave, Rand(-0.5, 0.5));
		}) * (1 / notes.size.sqrt);

		snd = LPF.ar(snd, filt);
		snd = snd * swell * fadeIn;
		snd = snd + GVerb.ar(snd.sum * -16.dbamp, 130, 6, maxroomsize: 100);
		snd = snd * \amp.kr(1) * ~synthLevels[\pad].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\fx, {
		var snd, wet, fb, trigger;
		snd = In.ar(~fxBus.index, 2);
		trigger = \trigger.tr;
		wet = snd;
		fb = LocalIn.ar(2);
		fb = DelayC.ar(fb, 1.0, TExpRand.kr(0.02, 0.1, trigger).lag(0.05));
		fb = fb * TRand.kr(0, -20, trigger).dbamp.lag(0.01);

		fb = BLowShelf.ar(fb, 200, 0.3, -5);
		fb = BHiShelf.ar(fb, 2000, 0.3, -5);
		fb = LeakDC.ar(fb);
		fb = Limiter.ar(fb);
		fb = HPF.ar(fb, 100);
		fb = LPF.ar(fb, 8000);
		wet = wet + fb;
		wet = wet + PitchShift.ar(wet, 0.1, SinOsc.ar(TExpRand.kr(0.3, 6, trigger)).linexp(-1, 1, 0.5, 3));
		wet = wet + PitchShift.ar(wet, 0.05, TExpRand.kr(0.5, 2, trigger));
		LocalOut.ar(wet);

		wet = SelectX.ar((TRand.kr(0, 1, trigger) < 0.3).lag(0.01), [wet, CombC.ar(LeakDC.ar(wet), 0.2, 1 / (35 * TIRand.kr(1, 4, trigger).pow(0.7)), -0.5)]);
		wet = SelectX.ar((TRand.kr(0, 1, trigger) < 0.3).lag(0.01), [wet, RLPF.ar(wet, LFNoise2.ar(0.3).linexp(-1, 1, 100, 8000), 0.5)]);
		wet = SelectX.ar((TRand.kr(0, 1, trigger) < 0.3).lag(0.01), [wet, PitchShift.ar(wet, 0.3, 1.5)]);

		wet = wet * EnvGen.ar(
			Env([0, 1, 1, 0], [\fadeIn.kr(0.01), \muteDelay.kr(1/4), 0.05], curve: [4, 0, -4]),
			gate: trigger
		);

		snd = preEmphasis.(snd, { |s| s + (((s * 2).tanh + s.fold2) * -3.dbamp) });

		snd = snd + SelectX.ar(\muteFx.kr(0).varlag(1/16), [wet, Silent.ar()]);
		snd = LeakDC.ar(snd);

		snd = preEmphasis.(snd, { |s| Limiter.ar(s) });
		snd = snd * ~synthLevels[\fx].dbamp;
		Out.ar(\out.kr(~masterBus.index), snd);
	}).add;

	SynthDef(\master, {
		var snd = In.ar(~masterBus.index, 2);
		Out.ar(0, Limiter.ar(snd, 1.0));
	}).add;

	0.2.wait;

	~volAmp = ~volAmp ?? 1;
	s.volume.volume = ~volAmp.ampdb - 8;

	~setTempo = { |bpm| TempoClock.default.tempo = bpm / 190 };
	~setVolume = { |amp| ~volAmp = amp; s.volume.volume = amp.ampdb - 8 };

	~isDay = ~isDay ?? 0;
	~bassThirdRoot = { if (~isDay > 0) { 42 } { 41 } };
	~setMusicMode = {
    |timeOfDay|
		~isDay = if (timeOfDay > 0.5) { 1 } { 0 };
		if (~pad.notNil) {
			~pad.set(\note2, if (~isDay > 0) { 61 } { 60 }, \note3, if (~isDay > 0) { 66 } { 64 });
		};
	};

	"CONTROLS_READY".postln;

	play = { |synthDef, duration, args = #[]|
		var dur = duration * beat;
		("FLASH:" ++ synthDef ++ ":" ++ dur).postln;
		s.bind { Synth(synthDef, [duration: dur] ++ args) };
		(duration * beat).wait;
	};

	playP = {
		|synthDef, duration, args = #[]|
		fork { play.(synthDef, duration, args) };
	};

	wait = { |duration|
		(duration * beat).wait;
	};

	master = Synth(\master);
	f = Synth(\fx);

	trigger = {
		s.bind { f.set(\trigger, 1, \muteDelay, (1/2) * beat, \fadeIn, (1/48) * beat) };
	};

	~mainRoutine = Routine({
		s.bind {
			~pad = Synth(\pad, [
				note2: if (~isDay > 0) { 61 } { 60 },
				note3: if (~isDay > 0) { 66 } { 64 },
			]);
		};

		~bassNote = {
			if (~isDay > 0, 42, 38);
		};

		~bassNote2 = {
			if (~isDay > 0, 40, 36);
		};

		fork {
			var bassNote, bassAmp;

			bassNote = { |base| if (0.15.coin, { base + ([-12, 0, 12].choose) }, { base }) };
			bassAmp = { rrand(0.75, 1.0) };

			inf.do {
				|iteration|
				if (0.5.coin, {
					trigger.();
					2.do { play.(\bass, 1/2, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.(), out: [~masterBus.index, ~fxBus.index].choose]) };
					trigger.();
					play.(\bass, 1/2, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.(), out: [~masterBus.index, ~fxBus.index].choose]);
				}, {
					trigger.();
					play.(\bass, 1, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.(), out: [~masterBus.index, ~fxBus.index].choose]);
					trigger.();
					play.(\bass, 1/2, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.(), out: ~fxBus.index]);
				});
				wait.(1/2);
				if (iteration % 2 < 1, { playP.(\clap, 1, [duration: 1]) });
				wait.(1/2);
				play.(\bass, 1, [freq: bassNote.(~bassNote2.()).midicps, amp: bassAmp.()]);
				play.(\bass, 1, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.()]);
				play.(\bass, 1/2, [freq: bassNote.(~bassNote2.()).midicps, amp: bassAmp.()]);
				if (0.1.coin, { playP.(\clap, 1, [duration: 1/4]) });
				if (0.2.coin, {
					play.(\bass, 1, [freq: bassNote.(~bassThirdRoot.()).midicps, amp: bassAmp.()]);
					play.(\bass, 2, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.()]);
				}, {
					play.(\bass, 3, [freq: bassNote.(~bassNote.()).midicps, amp: bassAmp.()]);
				});
			};
		};

		inf.do {
			|infCount|

			if ((infCount > 1) && (infCount % 4 < 1), {
				playP.(\kick, 1);
				6.do { play.(\glitch, 1/4) };
				play.(\snare, 1);
				trigger.();
				playP.(\kick, 1);
				[
					{ 12.do { play.(\glitch, 4.5 / 12) }},
					{ 18.do { play.(\glitch, 1/4) }},
				].choose.();
				play.(\clap, 1);
			}, {
				trigger.();
				play.(\kick, 1/4);
				play.(\snare, 1/4, [freq: 2000 + [5000, 0].wchoose([1, 0])]);
				wait.(1/2);
				play.(\rim, 1/2, [fx: rrand(0, 5)]);
				play.(\snare, 1/2);
				trigger.();
				play.(\kick, 1/2);
			});

			play.(\kick, 1/4);
			play.(\snare, 1/4);
			wait.(1/2);
			play.(\rim, 1/2, [fx: rrand(0, 5)]);
			play.(\snare, 1/2, [freq: 2000 + [5000, 0].wchoose([0.3, 0.7])]);
			play.(\kick, 1/2);
			play.(\snare, 1/2, [freq: 2000 + [5000, 0].wchoose([0.3, 0.7])]);
			4.do { play.(\glitch, 1/4) };

			3.do { play.(\kick, 1/2) };
			play.(\snare, 1);
			6.do { play.(\glitch, 1/4) };

			2.do {
				[
					\rim ! 2,
          \rim2 ! 1,
					\snare ! 4,
					\kick ! 2,
					\kick2 ! 3,
					\glitch ! 2,
					\glitch2 ! 2,
				].flatten.scramble.do {
					|synthDef|
					trigger.();
					play.(
						synthDef,
						1/2,
						if ([\rim, \kick2].includes(synthDef), { [fx: rrand(0, 5)] }, { [] })
					);
				};
			};


		};
	});
	~mainRoutine.play(quant:0.5);
}

