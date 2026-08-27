extends Node2D

var world: Node2D          # y_sort_enabled = true, тут живут все персонажи/объекты
var room: Dictionary
var player: Player
var hud: CanvasLayer

func _ready() -> void:
	randomize()
	
	# Настройка ввода
	setup_input_actions()
	
	world = Node2D.new()
	world.y_sort_enabled = true
	add_child(world)
	
	room = RoomBuilder.build(self)
	
	# Создаём игрока
	player = Player.new()
	player.position = room.player_pos
	world.add_child(player)
	
	# HUD
	hud = load("res://scripts/hud.gd").new()
	add_child(hud)
	
	# Запускаем игровой цикл
	GameState.state = GameState.State.PLAYING
	
	print("boot ok")

func _process(_delta: float) -> void:
	if player and hud:
		hud.set_hp(player.hp)
		hud.set_coins(GameState.coins)
		hud.set_wave(GameState.wave)

func setup_input_actions() -> void:
	var actions = ["move_left", "move_right", "move_up", "move_down"]
	for action in actions:
		if not InputMap.has_action(action):
			InputMap.add_action(action)
	
	# WASD + стрелки
	var keys = {
		"move_left": [KEY_A, KEY_LEFT],
		"move_right": [KEY_D, KEY_RIGHT],
		"move_up": [KEY_W, KEY_UP],
		"move_down": [KEY_S, KEY_DOWN]
	}
	for action in keys:
		for key in keys[action]:
			var event := InputEventKey.new()
			event.keycode = key
			InputMap.action_add_event(action, event)
