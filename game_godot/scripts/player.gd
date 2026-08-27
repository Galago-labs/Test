class_name Player extends CharacterBody2D

const SPEED := 90.0
const MAX_HP := 6  # 1 ед. = половина сердца → 3 сердца

var hp: int = MAX_HP
var invuln: float = 0.0
var speed_boost: float = 0.0

@onready var sprite: AnimatedSprite2D
@onready var collision_shape: CollisionShape2D

func _ready() -> void:
	# Создаём спрайт
	var idle_frames := Art.frames("characters/knight_m_idle_anim_", 4)
	var run_frames := Art.frames("characters/knight_m_run_anim_", 4)
	sprite = Art.make_char_sprite({"idle": idle_frames, "run": run_frames}, 16, 28)
	add_child(sprite)
	
	# Коллизия
	collision_shape = CollisionShape2D.new()
	var shape := RectangleShape2D.new()
	shape.size = Vector2(10, 8)
	collision_shape.shape = shape
	collision_shape.position = Vector2(0, -4)
	add_child(collision_shape)
	
	collision_layer = 2
	collision_mask = 1 | 3

func _physics_process(delta: float) -> void:
	if GameState.state != GameState.State.PLAYING:
		velocity = Vector2.ZERO
		return
	
	var dir := Input.get_vector("move_left", "move_right", "move_up", "move_down")
	velocity = dir * (SPEED * (1.4 if speed_boost > 0 else 1.0))
	move_and_slide()
	
	# Анимация
	if velocity.length() > 5:
		sprite.play("run")
	else:
		sprite.play("idle")
	
	# Флип спрайта
	if abs(velocity.x) > 1:
		sprite.flip_h = velocity.x < 0
	
	# Таймеры
	invuln -= delta
	speed_boost -= delta
	
	# Мигание при неуязвимости
	if invuln > 0:
		sprite.visible = (int(invuln * 12) % 2 == 0)
	else:
		sprite.visible = true

func take_damage(amount: int, from_dir: Vector2 = Vector2.ZERO) -> void:
	if invuln > 0:
		return
	
	hp -= amount
	invuln = 0.9
	Sfx.play("hurt")
	
	# Вспышка урона
	sprite.modulate = Color(3, 3, 3)
	var tween := create_tween()
	tween.tween_property(sprite, "modulate", Color.WHITE, 0.12)
	
	# Отдача
	if from_dir != Vector2.ZERO:
		velocity = from_dir * 100
	
	if hp <= 0:
		die()

func die() -> void:
	GameState.state = GameState.State.GAME_OVER
	var tween := create_tween()
	tween.tween_property(self, "modulate", Color.RED, 0.3)
	tween.tween_property(self, "rotation", PI / 2, 0.3)
	tween.tween_property(self, "scale", Vector2(0.7, 0.7), 0.3)

func heal(amount: int) -> void:
	hp = clamp(hp + amount, 0, MAX_HP)
	sprite.modulate = Color(1, 2, 1)
	var tween := create_tween()
	tween.tween_property(sprite, "modulate", Color.WHITE, 0.2)
