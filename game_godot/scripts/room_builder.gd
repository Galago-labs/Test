class_name RoomBuilder

const MAP: Array[String] = [
	"############D###############",
	"#..........................#",
	"#.1......................2.#",
	"#....C..............C......#",
	"#..........................#",
	"#......S..........S........#",
	"#............P.............#",
	"#..........................#",
	"#......S..........S........#",
	"#...C..................C...#",
	"#..........................#",
	"#.3......................4.#",
	"#.....K....................#",
	"#.........X.....O..........#",
	"############################"
]

const WORLD_OFFSET := Vector2(16, 24)
const TILE_SIZE := 16

static func build(parent: Node2D) -> Dictionary:
	var floor_layer := Node2D.new()
	floor_layer.name = "floor_layer"
	floor_layer.z_index = -10
	parent.add_child(floor_layer)
	
	var walls_layer := Node2D.new()
	walls_layer.name = "walls_layer"
	walls_layer.z_index = -5
	parent.add_child(walls_layer)
	
	var result := {
		"player_pos": Vector2.ZERO,
		"spawn_points": [],
		"chest_pos": Vector2.ZERO,
		"doc_pos": Vector2.ZERO,
		"spike_cells": [],
		"crate_cells": [],
		"door_sprite": null
	}
	
	var wall_body := StaticBody2D.new()
	wall_body.name = "WallCollision"
	wall_body.collision_layer = 1
	wall_body.collision_mask = 0
	walls_layer.add_child(wall_body)
	
	# Периметр коллизии
	var perim_rects = [
		Rect2(WORLD_OFFSET + Vector2(0, 0), Vector2(448, 16)),           # верх
		Rect2(WORLD_OFFSET + Vector2(0, 224), Vector2(448, 16)),         # низ
		Rect2(WORLD_OFFSET + Vector2(0, 0), Vector2(16, 240)),           # лево
		Rect2(WORLD_OFFSET + Vector2(432, 0), Vector2(16, 240))          # право
	]
	for r in perim_rects:
		var shape := RectangleShape2D.new()
		shape.size = r.size
		var cs := CollisionShape2D.new()
		cs.shape = shape
		cs.position = r.get_center()
		wall_body.add_child(cs)
	
	for row in range(MAP.size()):
		var line := MAP[row]
		for col in range(line.length()):
			var ch := line[col]
			var world_pos := Vector2(col * TILE_SIZE, row * TILE_SIZE) + WORLD_OFFSET
			
			if ch == "#":
				# Стена
				if row == 0:
					# Верхняя стена - шапка и лицо
					var top := Sprite2D.new()
					top.texture = Art.tex("environment/wall_top_mid.png")
					top.centered = false
					top.position = world_pos + Vector2(0, -16)
					walls_layer.add_child(top)
					
					var mid := Sprite2D.new()
					mid.texture = Art.tex("environment/wall_mid.png")
					mid.centered = false
					mid.position = world_pos
					walls_layer.add_child(mid)
				elif row == MAP.size() - 1:
					# Нижняя стена
					var top := Sprite2D.new()
					top.texture = Art.tex("environment/wall_top_mid.png")
					top.centered = false
					top.position = world_pos
					walls_layer.add_child(top)
				elif col == 0 or col == line.length() - 1:
					# Боковые стены
					var mid := Sprite2D.new()
					mid.texture = Art.tex("environment/wall_mid.png")
					mid.centered = false
					mid.position = world_pos
					walls_layer.add_child(mid)
			
			elif ch == ".":
				# Пол
				var floor := Sprite2D.new()
				floor.centered = false
				floor.position = world_pos
				if randf() < 0.8:
					floor.texture = Art.tex("environment/floor_1.png")
				else:
					var idx := randi_range(2, 8)
					floor.texture = Art.tex("environment/floor_%d.png" % idx)
				floor_layer.add_child(floor)
			
			elif ch == "S":
				# Пол + шипы (шипы создадим отдельно)
				result.spike_cells.append(world_pos)
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
			
			elif ch == "C":
				# Пол + ящик
				result.crate_cells.append(world_pos)
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
			
			elif ch == "K":
				# Пол + череп декор
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
				
				var skull := Sprite2D.new()
				skull.texture = Art.tex("environment/skull.png")
				skull.centered = false
				skull.position = world_pos
				walls_layer.add_child(skull)
			
			elif ch == "P":
				# Пол + позиция игрока
				result.player_pos = world_pos
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
			
			elif ch == "X":
				# Пол + позиция сундука
				result.chest_pos = world_pos
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
			
			elif ch == "O":
				# Пол + позиция доктора
				result.doc_pos = world_pos
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
			
			elif ch == "D":
				# Дверь в верхней стене
				var top := Sprite2D.new()
				top.texture = Art.tex("environment/wall_top_mid.png")
				top.centered = false
				top.position = world_pos + Vector2(0, -16)
				walls_layer.add_child(top)
				
				var mid := Sprite2D.new()
				mid.texture = Art.tex("environment/wall_mid.png")
				mid.centered = false
				mid.position = world_pos
				walls_layer.add_child(mid)
			
			elif ch.is_valid_int():
				# Точка спавна врагов (1-4)
				var floor := Sprite2D.new()
				floor.texture = Art.tex("environment/floor_1.png")
				floor.centered = false
				floor.position = world_pos
				floor_layer.add_child(floor)
				
				var idx := int(ch) - 1
				while result.spawn_points.size() <= idx:
					result.spawn_points.append(Vector2.ZERO)
				result.spawn_points[idx] = world_pos
	
	# Декор верхней стены (только один раз)
	# Баннеры
	var banner_red := Sprite2D.new()
	banner_red.texture = Art.tex("environment/wall_banner_red.png")
	banner_red.centered = false
	banner_red.position = Vector2(5 * TILE_SIZE, 0 * TILE_SIZE) + WORLD_OFFSET + Vector2(0, -8)
	walls_layer.add_child(banner_red)
	
	var banner_blue := Sprite2D.new()
	banner_blue.texture = Art.tex("environment/wall_banner_blue.png")
	banner_blue.centered = false
	banner_blue.position = Vector2(22 * TILE_SIZE, 0 * TILE_SIZE) + WORLD_OFFSET + Vector2(0, -8)
	walls_layer.add_child(banner_blue)
	
	# Фонтан на col 9
	var fountain_mid_frames := Art.frames("environment/wall_fountain_mid_blue_anim_", 3)
	var fountain_mid_sf := Art.make_sprite_frames({"fountain": fountain_mid_frames}, 6.0)
	var fountain_mid := AnimatedSprite2D.new()
	fountain_mid.sprite_frames = fountain_mid_sf
	fountain_mid.centered = false
	fountain_mid.offset = Vector2(-8, -16)
	fountain_mid.position = Vector2(9 * TILE_SIZE, 0 * TILE_SIZE) + WORLD_OFFSET
	fountain_mid.play("fountain")
	walls_layer.add_child(fountain_mid)
	
	var fountain_basin_frames := Art.frames("environment/wall_fountain_basin_blue_anim_", 3)
	var fountain_basin_sf := Art.make_sprite_frames({"basin": fountain_basin_frames}, 6.0)
	var fountain_basin := AnimatedSprite2D.new()
	fountain_basin.sprite_frames = fountain_basin_sf
	fountain_basin.centered = false
	fountain_basin.offset = Vector2(-8, -16)
	fountain_basin.position = Vector2(9 * TILE_SIZE, 1 * TILE_SIZE) + WORLD_OFFSET
	fountain_basin.play("basin")
	walls_layer.add_child(fountain_basin)
	
	# wall_goo на col 17
	var goo := Sprite2D.new()
	goo.texture = Art.tex("environment/wall_goo.png")
	goo.centered = false
	goo.position = Vector2(17 * TILE_SIZE, 0 * TILE_SIZE) + WORLD_OFFSET + Vector2(0, -8)
	walls_layer.add_child(goo)
	
	var goo_base := Sprite2D.new()
	goo_base.texture = Art.tex("environment/wall_goo_base.png")
	goo_base.centered = false
	goo_base.position = Vector2(17 * TILE_SIZE, 1 * TILE_SIZE) + WORLD_OFFSET
	walls_layer.add_child(goo_base)
	
	# Дверь (створки) на col 12-13
	var door_leaf := Sprite2D.new()
	door_leaf.texture = Art.tex("environment/doors_leaf_closed.png")
	door_leaf.centered = false
	door_leaf.position = Vector2(12 * TILE_SIZE, 0 * TILE_SIZE) + WORLD_OFFSET
	walls_layer.add_child(door_leaf)
	result.door_sprite = door_leaf
	
	return result
