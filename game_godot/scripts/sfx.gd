extends Node
# Автозагрузка Sfx - программный синтез звука

const RATE := 22050
var sounds: Dictionary = {}
var players: Array[AudioStreamPlayer] = []

func _ready() -> void:
	for i in 8:
		var p := AudioStreamPlayer.new()
		add_child(p)
		players.append(p)
	
	sounds["swing"]  = _make(0.12, func(t, n): return _noise() * exp(-t * 30.0) * 0.4)
	sounds["hit"]    = _make(0.15, func(t, n): return _square(220.0 - t * 400.0, t) * exp(-t * 20.0) * 0.5)
	sounds["hurt"]   = _make(0.25, func(t, n): return _square(110.0, t) * exp(-t * 10.0) * 0.5)
	sounds["die"]    = _make(0.30, func(t, n): return (_square(160.0 - t * 300.0, t) + _noise() * 0.3) * exp(-t * 8.0) * 0.4)
	sounds["coin"]   = _make(0.20, func(t, n): return _square(880.0 if t < 0.08 else 1320.0, t) * exp(-t * 12.0) * 0.3)
	sounds["potion"] = _make(0.30, func(t, n): return _square(440.0 + t * 800.0, t) * exp(-t * 6.0) * 0.3)
	sounds["chest"]  = _make(0.35, func(t, n): return _square(330.0 + floor(t * 10.0) * 55.0, t) * exp(-t * 5.0) * 0.3)
	sounds["cast"]   = _make(0.25, func(t, n): return _square(660.0 - t * 900.0, t) * exp(-t * 9.0) * 0.3)
	sounds["wave"]   = _make(0.50, func(t, n): return _square(523.0 if t < 0.15 else (659.0 if t < 0.3 else 784.0), t) * exp(-t * 3.0) * 0.3)
	sounds["boom"]   = _make(0.60, func(t, n): return _noise() * exp(-t * 6.0) * 0.7)
	sounds["click"]  = _make(0.05, func(t, n): return _noise() * exp(-t * 60.0) * 0.3)

func _square(freq: float, t: float) -> float:
	return 1.0 if fmod(t * freq, 1.0) < 0.5 else -1.0

func _noise() -> float:
	return randf() * 2.0 - 1.0

func _make(dur: float, f: Callable) -> AudioStreamWAV:
	var n := int(RATE * dur)
	var data := PackedByteArray()
	data.resize(n * 2)
	for i in n:
		var v: float = clampf(f.call(float(i) / RATE, i), -1.0, 1.0)
		var s := int(v * 32000.0)
		data.encode_s16(i * 2, s)
	var wav := AudioStreamWAV.new()
	wav.format = AudioStreamWAV.FORMAT_16_BITS
	wav.mix_rate = RATE
	wav.data = data
	return wav

func play(name: String) -> void:
	if not sounds.has(name):
		return
	for p in players:
		if not p.playing:
			p.stream = sounds[name]
			p.play()
			return
