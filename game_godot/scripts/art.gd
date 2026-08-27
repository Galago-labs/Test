class_name Art
# Статические хелперы. Все пути начинаются с res://assets/

static func tex(path: String) -> Texture2D:
	return load("res://assets/" + path)

# Загружает серию кадров prefix + "f0..f{count-1}" + ".png"
static func frames(prefix: String, count: int) -> Array[Texture2D]:
	var out: Array[Texture2D] = []
	for i in count:
		out.append(tex(prefix + "f%d.png" % i))
	return out

# Собирает SpriteFrames из словаря {"idle": [tex...], "run": [tex...]}
static func make_sprite_frames(anims: Dictionary, fps: float = 8.0) -> SpriteFrames:
	var sf := SpriteFrames.new()
	sf.remove_animation("default")
	for anim_name in anims:
		sf.add_animation(anim_name)
		sf.set_animation_speed(anim_name, fps)
		sf.set_animation_loop(anim_name, true)
		for t in anims[anim_name]:
			sf.add_frame(anim_name, t)
	return sf

# Создаёт AnimatedSprite2D "ногами в точку" для персонажа размера w×h
static func make_char_sprite(anims: Dictionary, w: int, h: int) -> AnimatedSprite2D:
	var s := AnimatedSprite2D.new()
	s.sprite_frames = make_sprite_frames(anims)
	s.centered = false
	s.offset = Vector2(-w / 2.0, -h)
	s.play("idle")
	return s
