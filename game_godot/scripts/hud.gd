extends CanvasLayer

var hp_container: VBoxContainer
var coin_label: Label
var wave_label: Label
var banner_label: Label

func _ready() -> void:
	# HUD слева сверху - сердечки
	hp_container = VBoxContainer.new()
	hp_container.position = Vector2(8, 6)
	hp_container.add_theme_constant_override("separation", 4)
	add_child(hp_container)
	
	for i in 3:
		var tr := TextureRect.new()
		tr.texture = Art.tex("ui/ui_heart_full.png")
		tr.custom_minimum_size = Vector2(26, 24)
		tr.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
		hp_container.add_child(tr)
	
	# Монеты справа сверху
	var coin_hbox := HBoxContainer.new()
	coin_hbox.position = Vector2(450, 6)
	coin_hbox.alignment = BoxContainer.ALIGNMENT_END
	
	var coin_icon := TextureRect.new()
	coin_icon.texture = Art.tex("items/coin_anim_f0.png")
	coin_icon.custom_minimum_size = Vector2(12, 14)
	coin_icon.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	coin_hbox.add_child(coin_icon)
	
	coin_label = Label.new()
	coin_label.text = "0"
	coin_label.add_theme_font_size_override("font_size", 16)
	coin_hbox.add_child(coin_label)
	
	add_child(coin_hbox)
	
	# Волна по центру сверху
	wave_label = Label.new()
	wave_label.position = Vector2(240, 6)
	wave_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	wave_label.add_theme_font_size_override("font_size", 16)
	wave_label.text = "Волна 0/5"
	add_child(wave_label)
	
	# Баннер (скрыт по умолчанию)
	banner_label = Label.new()
	banner_label.position = Vector2(240, 100)
	banner_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	banner_label.add_theme_font_size_override("font_size", 24)
	banner_label.modulate.a = 0
	add_child(banner_label)

func set_hp(new_hp: int) -> void:
	for i in hp_container.get_child_count():
		var tr: TextureRect = hp_container.get_child(i)
		var heart_val = i * 2 + 2
		if new_hp >= heart_val:
			tr.texture = Art.tex("ui/ui_heart_full.png")
		elif new_hp == heart_val - 1:
			tr.texture = Art.tex("ui/ui_heart_half.png")
		else:
			tr.texture = Art.tex("ui/ui_heart_empty.png")

func set_coins(n: int) -> void:
	coin_label.text = str(n)

func set_wave(n: int) -> void:
	wave_label.text = "Волна %d/5" % n

func banner(text: String) -> void:
	banner_label.text = text
	var tween := create_tween()
	tween.tween_property(banner_label, "modulate:a", 1.0, 0.2)
	tween.tween_interval(1.2)
	tween.tween_property(banner_label, "modulate:a", 0.0, 0.3)
