# PLAN.MD — «Крипта Забытого Доктора» (Crypt of the Lost Doc)

Подробный план разработки небольшой 2D pixel-art игры на **Godot 4.x (GDScript)** с ассетами из папки `assets/` (тайлсет 0x72 DungeonTilesetII v1.7).

Этот документ — **пошаговая инструкция для исполнителя**. Выполняй этапы строго по порядку (M0 → M8), после каждого этапа прогоняй «Проверку». Не переходи к следующему этапу, пока текущий не работает.

---

## 0. Концепт игры (что мы делаем)

* **Жанр:** аренный dungeon-survival (волны врагов в одной комнате подземелья).
* **Сюжет (кратко):** чумной доктор (спрайт `doc`) заперт в крипте и удерживает магический барьер у фонтана. Рыцарь (игрок) должен продержаться 5 волн нечисти и убить Большого Демона, чтобы доктор смог открыть дверь и оба выбрались наружу.
* **Цикл геймплея:** ходишь по комнате → рубишь врагов мечом (свинг оружия по дуге) → подбираешь монеты и зелья → между волнами открываешь сундук и получаешь оружие лучше → финальный босс → победа.
* **Проигрыш:** здоровье (сердечки) упало до нуля.
* **Победа:** убит босс `big_demon`, после чего игрок подходит к доктору → финальный диалог → экран победы.
* **Почему так:** одна комната без прокрутки камеры и без процедурной генерации = минимум точек отказа; при этом есть челлендж, прогрессия, сюжет, босс — всё, что нужно по критериям оценки.

**Осознанное решение:** НЕ делаем процедурную генерацию, НЕ делаем несколько уровней, НЕ используем редактор TileMap. Вся сцена строится кодом из ASCII-карты. Это резко снижает шанс сломать проект.

**Принцип объёма:** игра НЕБОЛЬШАЯ, но ЗАКОНЧЕННАЯ. Партия длится 5–8 минут. Ровно 8 типов врагов, 4 оружия, 3 вида пикапов, одна комната. Ничего сверх плана не добавлять. Если по ходу работы что-то не получается и надо резать — резать строго в этом порядке: шипы → реплики доктора → некромант (заменить на orc_warrior) → мини-босс ogre (заменить на 2 orc_warrior). Волны, босс, меню, пауза, победа/поражение и звук НЕ режутся никогда — без них игра не считается законченной.

---

## 1. Проверенный каталог ассетов (важно: тут исправлены ошибки старого описания)

Ассеты лежат в `plan/assets/`. Все PNG с прозрачностью. Анимации — отдельные файлы с суффиксами `_f0.._f3`.

### 1.1 Герои — `assets/characters/` (106 файлов)

| Персонаж | Префикс файлов | Размер | Анимации |
|---|---|---|---|
| Рыцарь (ИГРОК) | `knight_m_` | 16×28 | `idle` ×4, `run` ×4, `hit` ×1 |
| Доктор (NPC-сюжет) | `doc_` | 16×23 | `idle` ×4, `run` ×4 (без hit) |
| Ангел | `angel_` | 16×16 | `idle` ×4, `run` ×4 (без hit) |
| dwarf_m/f, elf_m/f, knight_f, lizard_m/f, wizzard_m/f | аналогично | 16×28 | idle ×4, run ×4, hit ×1 |

Пример имён: `knight_m_idle_anim_f0.png` … `f3`, `knight_m_run_anim_f0.png` … `f3`, `knight_m_hit_anim_f0.png` (один кадр!).

### 1.2 Враги — `assets/enemies/` (132 файла)

**Используем в игре** (проверенные размеры):

| Враг | Префикс | Размер | Кадры |
|---|---|---|---|
| tiny_zombie | `tiny_zombie_` | 16×16 | idle ×4 + run ×4 |
| goblin | `goblin_` | 16×16 | idle ×4 + run ×4 |
| skelet (скелет) | `skelet_` | 16×16 | idle ×4 + run ×4 |
| imp | `imp_` | 16×16 | idle ×4 + run ×4 |
| orc_warrior | `orc_warrior_` | 16×23 | idle ×4 + run ×4 |
| necromancer | `necromancer_` | 16×23 | ТОЛЬКО `necromancer_anim_f0..f3` (нет idle/run разделения) |
| ogre | `ogre_` | 32×36 | idle ×4 + run ×4 |
| big_demon (БОСС) | `big_demon_` | 32×36 | idle ×4 + run ×4 |

**ЛОВУШКИ в именах (не ошибись):**
* Скелет называется `skelet_`, а НЕ `skeleton_`.
* У `necromancer`, `ice_zombie`, `muddy`, `slug`, `swampy`, `tiny_slug` формат имени `имя_anim_f0..f3` — без слова `idle`/`run`.
* У обычного `zombie` кадры называются `zombie_anim_f1, f2, f3, f10` — нет `f0`! Поэтому обычного zombie в игре НЕ используем.
* `goblin`, `skelet`, `imp` — 16×16 (старое описание врало, что 16×23).
* `slug` — 16×23, хотя выглядит мелким.

Остальных врагов (big_zombie, chort, masked_orc, orc_shaman, pumpkin_dude, wogol, ice_zombie, muddy, slug, swampy, tiny_slug) — НЕ используем. 8 типов достаточно, больше не добавлять.

### 1.3 Окружение — `assets/environment/` (78 файлов), все тайлы 16×16 если не указано

* Полы: `floor_1.png` … `floor_8.png` (вариации камня), `floor_stairs.png`, `floor_ladder.png`, `hole.png`.
* Шипы-ловушка: `floor_spikes_anim_f0..f3` (f0 = убраны, f3 = полностью выдвинуты).
* Стены: `wall_mid.png` (лицевая), `wall_top_mid.png` (верх), `wall_left.png`, `wall_right.png`, углы `wall_edge_*`, `wall_outer_*`, `wall_hole_1/2.png`, `wall_goo.png`+`wall_goo_base.png`.
* Декор: баннеры `wall_banner_blue/green/red/yellow.png`, череп `skull.png`, ящик `crate.png` (16×24), колонна `column.png` (16×48), `column_wall.png` (16×48).
* Фонтан (анимированный, 3 кадра): верх `wall_fountain_top_1/2/3.png`, середина `wall_fountain_mid_blue_anim_f0..f2` (и red), бассейн `wall_fountain_basin_blue_anim_f0..f2` (и red).
* Дверь: створка `doors_leaf_closed.png` / `doors_leaf_open.png` (32×32), рама `doors_frame_left/right.png` (16×32), `doors_frame_top.png` (32×16).
* Механизмы: `button_red/blue_up/down.png`, `lever_left/right.png` — лежат ЗДЕСЬ, а не в ui/.

### 1.4 Предметы — `assets/items/` (24 файла)

* Монета: `coin_anim_f0..f3` (6×7 px — очень маленькая!).
* Зелья 16×16: `flask_red/blue/green/yellow.png` и `flask_big_red/blue/green/yellow.png`.
* Сундуки 16×16 (3 кадра открытия): `chest_full_open_anim_f0..f2` (f0 = закрыт), `chest_empty_open_anim_f0..f2`, `chest_mimic_open_anim_f0..f2`.
* Бомба: `bomb_f0..f2` (не используем, опционально).

### 1.5 UI — `assets/ui/` (ровно 3 файла!)

`ui_heart_full.png`, `ui_heart_half.png`, `ui_heart_empty.png` — 13×12. Больше в этой папке НИЧЕГО нет.

### 1.6 Оружие — `assets/weapons/` (27 файлов, статичные картинки «остриём вверх»)

Используем ровно 5 файлов: `weapon_rusty_sword.png` (10×21), `weapon_regular_sword.png` (10×21), `weapon_knight_sword.png` (10×29), `weapon_red_gem_sword.png` (10×21), `weapon_knife.png` (6×13, как вражеский магический снаряд). Остальное оружие не трогаем.

---

## 2. Технический фундамент (правила для исполнителя)

1. **Godot 4, GDScript.** Синтаксис Godot 4: `@export`, `@onready`, `move_and_slide()` БЕЗ аргументов, `AnimatedSprite2D` (не AnimatedSprite), твины через `create_tween()`, `randf()`/`randi_range()`. НЕ использовать синтаксис Godot 3 (`onready var`, `yield`, `KinematicBody2D`).
2. **Всё строим кодом.** В редакторе руками ничего не расставляем. Единственная сцена `main.tscn` содержит корневой Node2D со скриптом; все остальные узлы создаются в `_ready()` и функциями-фабриками.
3. **Никаких выдуманных путей к ассетам.** Использовать только имена из раздела 1. Перед использованием файла — свериться со списком.
4. **Пиксель-арт:** в настройках проекта фильтрация текстур = Nearest (см. M0). Никогда не масштабировать спрайты дробно, только целыми числами (у нас масштаб 1, растяжение делает движок).
5. **Позиционирование персонажей:** спрайты разной высоты (16, 23, 28, 36). У всех `AnimatedSprite2D` ставим `offset.y` так, чтобы НОГИ стояли на позиции узла: `offset = Vector2(-w/2, -h)` при `centered = false`. Тогда position узла = точка на полу.
6. **Y-сортировка:** у корневого узла игровых объектов `y_sort_enabled = true`, чтобы персонажи ниже по экрану рисовались поверх.
7. После каждого этапа: запуск `godot --headless --import .` (нет ошибок импорта) и обычный запуск — в консоли не должно быть красных ошибок.

### 2.1 Структура проекта (создать ровно такую)

```
game_godot/                  <- новая папка проекта (рядом с plan/)
  project.godot
  main.tscn
  assets/                    <- КОПИЯ plan/assets целиком
    characters/ enemies/ environment/ items/ ui/ weapons/
  scripts/
    main.gd          # корень: строит комнату, управляет состояниями игры
    art.gd           # статические хелперы загрузки кадров/SpriteFrames
    room_builder.gd  # строит комнату из ASCII-карты
    player.gd        # игрок
    weapon.gd        # оружие в руке + свинг + хитбокс
    enemy.gd         # универсальный враг (данные из таблицы)
    projectile.gd    # вражеский снаряд
    pickup.gd        # монета/зелье
    chest.gd         # сундук с апгрейдом
    spikes.gd        # шипы-ловушка
    doc_npc.gd       # доктор (сюжет)
    hud.gd           # сердечки, монеты, номер волны, баннеры волн
    menus.gd         # главное меню / пауза / победа / поражение
    waves.gd         # ДАННЫЕ волн (константы)
    sfx.gd           # автозагрузка: программный синтез звуков
    game_state.gd    # автозагрузка: глобальное состояние (очки, hp, стейт)
```

### 2.2 Точное содержимое `project.godot`

```ini
config_version=5

[application]
config/name="Crypt of the Lost Doc"
run/main_scene="res://main.tscn"

[autoload]
GameState="*res://scripts/game_state.gd"
Sfx="*res://scripts/sfx.gd"

[display]
window/size/viewport_width=480
window/size/viewport_height=270
window/size/window_width_override=960
window/size/window_height_override=540
window/stretch/mode="canvas_items"
window/stretch/aspect="keep"

[rendering]
textures/canvas_textures/default_texture_filter=0
```

(`default_texture_filter=0` — это Nearest, пиксели будут чёткими.)

### 2.3 Точное содержимое `main.tscn`

```
[gd_scene load_steps=2 format=3]

[ext_resource type="Script" path="res://scripts/main.gd" id="1"]

[node name="Main" type="Node2D"]
script = ExtResource("1")
```

Больше в tscn-файле ничего не писать. Все узлы создаёт `main.gd`.

### 2.4 Слои коллизий (константы, использовать везде одинаково)

| Слой (бит) | Что |
|---|---|
| 1 | стены/препятствия |
| 2 | игрок |
| 3 | враги |
| 4 | хитбокс оружия игрока (Area2D) |
| 5 | вражеские снаряды (Area2D) |
| 6 | подбираемые предметы (Area2D) |

* Игрок: layer=2, mask=1|3 (двигается, упирается в стены и врагов).
* Враг: layer=3, mask=1|2|3 (упирается в стены, игрока и друг в друга — не слипаются в одну точку).
* Оружие (Area2D): layer=4, mask=3 — ловит врагов.
* Снаряд (Area2D): layer=5, mask=1|2 — ловит игрока и стены.
* Pickup (Area2D): layer=6, mask=2.

---

## 3. Этапы разработки

---

### M0. Каркас проекта

1. Создать папку `game_godot/` рядом с `plan/`.
2. Скопировать ассеты: `cp -R plan/assets game_godot/assets`.
3. Создать `project.godot` (из 2.2) и `main.tscn` (из 2.3).
4. Создать `scripts/game_state.gd`:

```gdscript
extends Node
# Глобальное состояние. Автозагрузка "GameState".

enum State { MENU, PLAYING, PAUSED, DIALOG, GAME_OVER, VICTORY }
var state: State = State.MENU
var coins: int = 0
var wave: int = 0          # текущая волна (1..5)
var kills: int = 0

func reset() -> void:
    coins = 0
    wave = 0
    kills = 0
```

5. Создать `scripts/sfx.gd` — пока заглушка `extends Node` с пустыми методами `play(name: String) -> void: pass` (реализация в M7).
6. Создать `scripts/main.gd` — пока: `extends Node2D`, в `_ready()` напечатать `print("boot ok")`.
7. Запустить `godot --headless --import .` из папки проекта, затем `godot .` — окно 960×540, в консоли `boot ok`, ошибок нет.

**Проверка M0:** проект открывается, ошибок импорта нет.

---

### M1. Хелперы графики + комната из ASCII-карты

#### 3.1 `scripts/art.gd` — загрузка кадров

```gdscript
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
```

#### 3.2 ASCII-карта комнаты

Комната 28×15 тайлов по 16 px = 448×240 px. Viewport 480×270 → комната видна целиком, камера не нужна (мир рисуем со смещением `Vector2(16, 24)`, чтобы отцентрировать; сверху остаётся место под HUD).

Карта (ровно 15 строк по 28 символов). Легенда: `#` стена-периметр, `.` пол, `S` шипы, `C` ящик, `K` череп-декор, `F` фонтан (синий), `D` дверь (в центре верхней стены), `1..4` точки спавна врагов, `P` старт игрока, `X` сундук, `O` позиция доктора.

```
############D###############
#..........................#
#.1......................2.#
#....C..............C......#
#..........................#
#......S..........S........#
#............P.............#
#..........................#
#......S..........S........#
#...C..................C...#
#..........................#
#.3......................4.#
#.....K....................#
#.........X.....O..........#
############################
```

(Фонтан `F` не в карте: он рисуется НА верхней стене, см. ниже. Дверь `D` — тоже часть верхней стены.)

#### 3.3 `scripts/room_builder.gd`

`class_name RoomBuilder`, статическая функция `build(parent: Node2D) -> Dictionary`, которая:

1. Держит карту как `const MAP: Array[String]` (строки выше).
2. Создаёт три контейнера: `floor_layer` (Node2D, z_index=-10), `walls_layer` (Node2D, z_index=-5), возвращает словарь `{ "player_pos": Vector2, "spawn_points": [Vector2×4], "chest_pos": Vector2, "doc_pos": Vector2, "spike_cells": [Vector2...], "crate_cells": [...] }` в мировых координатах (клетка → `Vector2(col*16, row*16) + WORLD_OFFSET`, `WORLD_OFFSET = Vector2(16, 24)`).
3. **Пол:** для каждой клетки, которая не `#`, ставит `Sprite2D` с текстурой: 80% `floor_1.png`, иначе случайно `floor_2..floor_8` (использовать `randi()`). `centered = false`.
4. **Стены (упрощённая, но опрятная схема):**
   * Верхняя строка (row 0): в каждой клетке ставим ДВА спрайта: `wall_top_mid.png` в самой клетке и `wall_mid.png` в клетке ниже визуально не нужно — вместо этого: row 0 = `wall_top_mid`, а в row 1 над полом рисуем лицевую часть `wall_mid` СДВИНУТУЮ на позицию row 0? — НЕ УСЛОЖНЯЙ. Делаем так: клетка row 0 col c получает `wall_mid.png`, а над ней (позиция y - 16) рисуем `wall_top_mid.png`. Верхний ряд «шапок» частично выйдет за комнату — это нормально, offset мира это учитывает (24 px сверху).
   * Нижняя строка (row 14): `wall_top_mid.png` в каждой клетке (вид на стену сверху).
   * Левый/правый столбцы (col 0 и 27, rows 1..13): `wall_mid.png`.
   * Углы можно не выделять — с этой схемой смотрится нормально.
5. **Декор на верхней стене** (спрайты поверх wall_mid в row 0): баннеры `wall_banner_red` на col 5, `wall_banner_blue` на col 22; фонтан на col 9: `wall_fountain_mid_blue_anim_f0..f2` как `AnimatedSprite2D` (fps 6, autoplay) в row 0 и `wall_fountain_basin_blue_anim_f0..f2` в row 1 (на полу); `wall_goo` на col 17 (и `wall_goo_base` в row 1 под ним).
6. **Дверь:** на клетках col 12-13 row 0 рисуем `doors_leaf_closed.png` (32×32, поставить так, чтобы низ совпал с низом стены). Сохранить ссылку на этот Sprite2D в возвращаемом словаре (`"door_sprite"`), в финале заменим текстуру на `doors_leaf_open.png`.
7. **Коллизия стен:** один `StaticBody2D` (layer=1) с 4 `CollisionShape2D` (RectangleShape2D) по периметру внутренней области. Внутренняя область пола: x от 16 до 432, y от 16 до 224 (в координатах карты до применения WORLD_OFFSET; проще посчитать в мировых: floor-прямоугольник = `Rect2(WORLD_OFFSET + Vector2(16,16), Vector2(416, 208))`). Толщина стенок 16.
8. **Ящики `C`:** `StaticBody2D` (layer=1) + `Sprite2D` `crate.png` (16×24, centered=false, offset.y = -8 чтобы низ сел в клетку) + RectangleShape2D 14×12. Ящики — просто статичные препятствия навсегда (разрушаемость не делаем). Родитель — общий `world` узел с y_sort.
9. **Череп `K`:** просто Sprite2D, без коллизии.
10. **Шипы `S` и сундук `X`, доктор `O`, спавны `1..4`, старт `P`:** в этой миссии только вернуть их координаты (объекты создаст main.gd в следующих этапах).

#### 3.4 `main.gd` на этом этапе

```gdscript
extends Node2D

var world: Node2D          # y_sort_enabled = true, тут живут все персонажи/объекты
var room: Dictionary

func _ready() -> void:
    world = Node2D.new()
    world.y_sort_enabled = true
    add_child(world)
    room = RoomBuilder.build(self)   # слои пола/стен добавляет сам билдер
```

**Проверка M1:** при запуске видна замкнутая комната с полом, стенами, дверью, баннерами, анимированным фонтаном, ящиками. Ошибок нет.

---

### M2. Игрок + HUD сердечек

#### `scripts/player.gd` (`class_name Player extends CharacterBody2D`)

* Константы: `SPEED := 90.0`, `MAX_HP := 6` (1 ед. = половина сердца → 3 сердца).
* Поля: `hp := MAX_HP`, `invuln := 0.0` (сек), `speed_boost := 0.0`.
* Создание (в `_ready()` или фабрикой из main):
  * `CollisionShape2D`: RectangleShape2D 10×8, position `Vector2(0, -4)` (коллизия по ногам). layer=2, mask=1|3.
  * `AnimatedSprite2D` через `Art.make_char_sprite({"idle": Art.frames("characters/knight_m_idle_anim_", 4), "run": Art.frames("characters/knight_m_run_anim_", 4)}, 16, 28)`.
* `_physics_process(delta)`:
  * Если `GameState.state != PLAYING` — `velocity = Vector2.ZERO; return`.
  * Ввод: `Input.get_vector("move_left","move_right","move_up","move_down")` — actions создать кодом в main при старте через `InputMap.add_action` + `InputMap.action_add_event` (WASD и стрелки), это надёжнее правки project.godot.
  * `velocity = dir * (SPEED * (1.4 if speed_boost > 0 else 1.0))`; `move_and_slide()`.
  * Анимация: `run` если velocity.length() > 5 иначе `idle`. Флип: `sprite.flip_h = velocity.x < 0` (менять только когда |velocity.x| > 1).
  * Таймеры `invuln -= delta`, `speed_boost -= delta`. Пока invuln > 0 — мигание: `sprite.visible = int(invuln * 12) % 2 == 0` (в конце вернуть visible = true).
* `func take_damage(amount: int) -> void:`
  * если `invuln > 0` — return.
  * `hp -= amount; invuln = 0.9; Sfx.play("hurt")`.
  * Показать кадр удара: временно `sprite.stop()` и подменить текстуру нельзя — проще: `sprite.modulate = Color(3,3,3)` на 0.1 c (твин обратно к белому) + отдача: оттолкнуть `velocity` от источника 1 кадр.
  * Тряска камеры (см. M7, пока пропустить).
  * если `hp <= 0`: `die()`.
* `func die() -> void:` — `GameState.state = GAME_OVER`; твин: `modulate -> красный`, `rotation -> PI/2`, `scale -> 0.7`, длительность 0.6; сигнал `died` (main покажет экран поражения).
* `func heal(amount)` — clamp до MAX_HP, зелёная вспышка modulate.

#### `scripts/hud.gd` (`extends CanvasLayer`)

* Создаёт кодом: `HBoxContainer` в левом верхнем углу (позиция 8,6) с 3 `TextureRect` сердечками; функция `set_hp(hp: int)` — для сердца i: full если hp >= i*2+2, half если == i*2+1, иначе empty. Масштаб ×2 (`custom_minimum_size`, `stretch_mode = STRETCH_SCALE`… проще `TextureRect.texture` + `scale = Vector2(2,2)` у контейнера).
* Справа сверху: `TextureRect` c `coin_anim_f0.png` (scale ×2) + `Label` количества монет. Функция `set_coins(n)`.
* По центру сверху: `Label` «Волна 1/5» — `set_wave(n)`.
* Функция `banner(text: String)` — большой Label по центру экрана, появляющийся твином (alpha 0→1→подождать 1.2с→0). Использовать для «Волна N», «BOSS», реплик.
* Шрифт: дефолтный, но `add_theme_font_size_override("font_size", 16)`; у баннера 24. Текст на русском.

#### Связка в main.gd

* Создать player на `room.player_pos`, добавить в `world`. Создать hud. Подключить обновление hud (каждый `_process` дешёво: `hud.set_hp(player.hp)` и т.д.).
* Пока для теста: `GameState.state = State.PLAYING` сразу (меню появится в M6).

**Проверка M2:** рыцарь ходит по комнате WASD/стрелками, не проходит сквозь стены и ящики, анимации idle/run переключаются, спрайт зеркалится, сердечки видны.

---

### M3. Оружие и атака (обыгрываем отсутствие анимации атаки)

Атаку делаем «свингом» спрайта оружия — это стандартный приём для этого тайлсета.

#### Таблица оружия (константа в `weapon.gd`)

| id | текстура | урон | радиус (px) | дуга | кулдаун |
|---|---|---|---|---|---|
| rusty | weapon_rusty_sword.png | 1 | 16 | 100° | 0.45 |
| regular | weapon_regular_sword.png | 2 | 16 | 100° | 0.45 |
| knight | weapon_knight_sword.png | 3 | 20 | 130° | 0.40 |
| gem | weapon_red_gem_sword.png | 4 | 20 | 130° | 0.35 |

Прогрессия: стартуем с rusty; сундук после волн 1, 2 и 3 выдаёт следующее оружие (regular → knight → gem). Ровно 4 оружия, больше не добавлять. Перед боссом (после волны 4) сундук выдаёт `flask_big_red` (полное лечение) — см. M5.

#### `scripts/weapon.gd` (`class_name Weapon extends Node2D`) — ребёнок игрока

* Структура: `Weapon (Node2D, position=(0,-10) — уровень рук)` → `pivot (Node2D)` → `sprite (Sprite2D, centered=true, position=(0,-12))` + `hitbox (Area2D + CollisionShape2D CircleShape2D radius=10, position=(0,-14))`.
  Логика: `pivot.rotation` направляет оружие; текстуры нарисованы остриём вверх, поэтому «направление» = pivot.rotation, а спрайт просто смещён вдоль оси.
* Каждый кадр (вне атаки): `pivot.rotation = (get_global_mouse_position() - global_position).angle() + PI/2` — оружие смотрит на курсор. `z_index` = 1 если мышь ниже игрока, иначе -1 (оружие за спиной).
* `hitbox.monitoring = false` вне атаки.
* `func set_weapon(id: String)` — меняет текстуру, статы, длину (position спрайта/хитбокса = -(высота_текстуры)/2 - 4).
* Атака (`attack()` по ЛКМ или пробелу, если кулдаун прошёл):
  1. `attacking = true`, `hitbox.monitoring = true`, `already_hit = []`.
  2. Базовый угол `a = угол на мышь + PI/2`; твин `pivot.rotation` от `a - deg_to_rad(arc/2)` до `a + deg_to_rad(arc/2)` за 0.12 сек (`TRANS_SINE`).
  3. По завершении твина: `hitbox.monitoring = false`, `attacking = false`.
  4. `Sfx.play("swing")`.
* Сигнал `hitbox.area_entered` не нужен — врагов ловим через `body_entered` (враги CharacterBody2D): проверить `body is Enemy`, если body не в `already_hit`: добавить, вызвать `body.take_damage(damage, направление_от_игрока)`.
* Ввод: в main через `_unhandled_input` или в player: `Input.is_action_just_pressed("attack")` (action на ЛКМ и пробел).

**Проверка M3:** оружие в руке рыцаря поворачивается за мышью, по клику делает видимый взмах по дуге со звуком-заглушкой (тишина — ок), кулдаун работает.

---

### M4. Враги (+ смерть без анимации смерти)

#### Таблица врагов (константа `ENEMIES` в `enemy.gd`)

```gdscript
const ENEMIES := {
  "tiny_zombie": {"w":16,"h":16,"hp":2, "speed":55.0,"dmg":1,"coins":1,"prefix":"tiny_zombie_","two_anims":true},
  "goblin":      {"w":16,"h":16,"hp":3, "speed":70.0,"dmg":1,"coins":1,"prefix":"goblin_","two_anims":true},
  "skelet":      {"w":16,"h":16,"hp":4, "speed":50.0,"dmg":1,"coins":2,"prefix":"skelet_","two_anims":true},
  "imp":         {"w":16,"h":16,"hp":2, "speed":95.0,"dmg":1,"coins":2,"prefix":"imp_","two_anims":true},
  "orc_warrior": {"w":16,"h":23,"hp":8, "speed":55.0,"dmg":2,"coins":3,"prefix":"orc_warrior_","two_anims":true},
  "necromancer": {"w":16,"h":23,"hp":5, "speed":40.0,"dmg":1,"coins":4,"prefix":"necromancer_","two_anims":false,"ranged":true},
  "ogre":        {"w":32,"h":36,"hp":25,"speed":40.0,"dmg":2,"coins":10,"prefix":"ogre_","two_anims":true},
  "big_demon":   {"w":32,"h":36,"hp":60,"speed":45.0,"dmg":2,"coins":30,"prefix":"big_demon_","two_anims":true,"boss":true},
}
```

`two_anims=true` → кадры `prefix+"idle_anim_f0..3"` и `prefix+"run_anim_f0..3"`; `false` → только `prefix+"anim_f0..3"` (использовать один набор и как idle, и как run).

#### `scripts/enemy.gd` (`class_name Enemy extends CharacterBody2D`)

* Фабрика: `static func create(id: String, pos: Vector2, player: Player) -> Enemy`.
* Коллизия: RectangleShape2D примерно (w-6)×8 по ногам, layer=3, mask=1|2|3.
* Спавн-эффект (чтобы враги не появлялись из ниоткуда): при создании `modulate.a = 0`, `scale = Vector2(0.3,0.3)`; твин к норме за 0.4 c; первые 0.5 c враг не двигается и не наносит урон (`spawning = true`).
* ИИ (в `_physics_process`, только при `GameState.state == PLAYING`):
  * Обычный: `velocity = (player.global_position - global_position).normalized() * speed`; `move_and_slide()`. flip_h по знаку velocity.x. Анимация run/idle по скорости.
  * `ranged` (некромант): если дистанция до игрока > 90 — идти к игроку; если < 60 — отходить; каждые 2.0 сек — выстрел `Projectile` в игрока, `Sfx.play("cast")`.
  * `boss` (big_demon): как обычный, НО каждые 4 сек — веер из 8 снарядов по кругу; при hp < 50% — «ярость»: скорость ×1.3, веер каждые 2.5 сек, `modulate` слегка красный. Никакого призыва миньонов — не усложнять.
* **Контактный урон:** таймер `touch_cd`; если `spawning == false` и пересекается с игроком (проверять дистанцию: `global_position.distance_to(player.global_position) < (w/2 + 8)`) и `touch_cd <= 0`: `player.take_damage(dmg)`, `touch_cd = 0.8`. (Дистанция-проверка проще и надёжнее, чем отдельная Area2D.)
* `func take_damage(amount: int, from_dir: Vector2) -> void:`
  * `hp -= amount`; `Sfx.play("hit")`.
  * Вспышка: `modulate = Color(4,4,4)`, твин к белому за 0.12.
  * Отброс: `global_position += from_dir * 6` (или velocity-импульс с затуханием).
  * Хит-стоп: `get_tree().paused` НЕ трогать; вместо этого `Engine.time_scale = 0.05` на 0.04 сек реального времени (через `get_tree().create_timer(0.04, true, false, true)` — таймер, игнорирующий time_scale), потом вернуть 1.0. Обернуть в статический хелпер в main.
  * если hp <= 0 → `die()`.
* **Смерть (обыгрываем отсутствие анимации):** `die()`:
  1. отключить коллизию и ИИ (`set_physics_process(false)`, `collision.disabled = true` через `set_deferred`).
  2. Твин 0.4 c: `rotation -> PI/2 * (влево/вправо от удара)`, `modulate -> Color(1,0.3,0.3,0)`, `scale -> 1.2`.
  3. Частицы «кровь/пыль»: `CPUParticles2D`, one_shot, 12 частиц, gravity (0, 60), цвет тёмно-красный, lifetime 0.5, `emitting = true`; удалить таймером.
  4. Крупные враги (ogre, big_demon) оставляют декал `skull.png` (Sprite2D, modulate.a твином до 0.6, z_index=-1).
  5. Дроп: `coins` монет + 15% шанс `flask_red` (лечит 2), 8% шанс `flask_blue` (спидбуст 4 c).
  6. `GameState.kills += 1`; сигнал `died(enemy)` — его слушает волновой менеджер.
  7. `queue_free()` по завершении твина; `Sfx.play("die")`.

#### `scripts/projectile.gd` (`class_name Projectile extends Area2D`)

* Sprite2D `weapon_knife.png`, `modulate = Color(1,0.4,1)` (магический), `rotation` по направлению (+PI/2, т.к. нож нарисован вверх). Скорость 120, layer=5, mask=1|2.
* `body_entered`: если Player → `take_damage(1)`, free; если стена (StaticBody2D) → free. Время жизни 3 сек.

(Ящики остаются просто статичными препятствиями — разрушаемость НЕ делаем, это лишний объём.)

**Проверка M4:** временно заспавнить в main 3 гоблинов и некроманта — они бегут к игроку/стреляют, получают урон со вспышкой и отбросом, красиво умирают с частицами, роняют монеты; игрок получает урон с миганием и теряет сердечки; смерть игрока переводит в GAME_OVER (пока просто print).

---

### M5. Пикапы, сундук, волны, босс, доктор

#### `scripts/pickup.gd` (`class_name Pickup extends Area2D`)

* Ровно 3 типа: `"coin"` (AnimatedSprite2D coin_anim_f0..3, fps 8), `"flask_red"`, `"flask_blue"` (Sprite2D). (`flask_big_red` не пикап: сундук перед боссом просто показывает её спрайт над крышкой на 1 сек и вызывает `player.heal(6)` напрямую.)
* При спавне — разлёт: твин position от точки смерти в случайную точку в радиусе 12, с подпрыгиванием (две стадии scale/offset — упрощённо можно просто твин позиции).
* layer=6, mask=2. `body_entered` (Player):
  * coin → `GameState.coins += 1`, `Sfx.play("coin")`.
  * flask_red → `player.heal(2)`; flask_blue → `player.speed_boost = 4.0`; `Sfx.play("potion")`.
  * Твин исчезновения (взлёт вверх + alpha 0), `queue_free()`.
* Магнит: если дистанция до игрока < 24 — лететь к игроку со скоростью 140 (для монет).

#### `scripts/chest.gd` (`class_name Chest extends StaticBody2D`)

* Sprite2D `chest_full_open_anim_f0` (закрыт), layer=1 (препятствие), плюс детекция игрока по дистанции < 20 и `Input.is_action_just_pressed("interact")` (клавиша E) ЛИБО автооткрытие при касании — выбрать вариант с клавишей E, над сундуком показывать Label «E» когда игрок рядом.
* Открытие: проиграть кадры f0→f1→f2 вручную (таймер 0.1с), `Sfx.play("chest")`, выдать награду, показать баннер, после — сундук остаётся открытым и неактивным до конца перерыва (перед следующим перерывом заряжается заново: снова f0 и активен).
* Награды по порядку открытий: 1-е — regular_sword, 2-е — knight_sword, 3-е — gem_sword (баннер «Новое оружие: …!»), 4-е (перед боссом) — `flask_big_red`: полное лечение, баннер «Ты готов. Он идёт.».

#### `scripts/waves.gd` — данные волн

```gdscript
class_name Waves
const WAVES := [
  ["tiny_zombie","tiny_zombie","tiny_zombie","goblin","goblin"],                      # 1
  ["goblin","goblin","skelet","skelet","imp","imp","tiny_zombie","tiny_zombie"],      # 2
  ["orc_warrior","orc_warrior","necromancer","imp","imp","skelet","skelet"],          # 3
  ["ogre","orc_warrior","necromancer","necromancer","imp","imp"],                     # 4
  ["big_demon","imp","imp"],                                                          # 5 (босс)
]
const BETWEEN_WAVES_DELAY := 4.0
```

#### Волновой менеджер (внутри `main.gd`)

Состояния боя: `wave_idle` (перерыв) / `wave_active`.

1. Старт игры: волна 0, баннер с сюжетом (см. ниже), через 3 c → `start_wave(1)`.
2. `start_wave(n)`: `GameState.wave = n`; hud.set_wave; баннер «Волна n/5» (для 5-й — «БОСС: ПОВЕЛИТЕЛЬ КРИПТЫ»); враги списка спавнятся по одному каждые 0.7 c в случайной из 4 точек `room.spawn_points`; вести `alive_count`.
3. На сигнал `enemy.died`: `alive_count -= 1`; когда 0 → `end_wave()`.
4. `end_wave()`: баннер «Волна зачищена!»; `Sfx.play("wave")`; перезарядить сундук (после волн 1–4, награды по списку из chest.gd); реплика доктора (см. ниже); следующая волна стартует не по таймеру, а когда игрок открыл сундук (плюс 2 сек), а если сундук игнорируют 10 сек — стартует сама. После 5-й → `victory_sequence()`.
5. Босс: hud рисует полоску HP босса (ColorRect красный поверх серого, ширина по hp/max) вверху экрана.

#### `scripts/doc_npc.gd` — доктор (сюжет, дёшево и сердито)

* AnimatedSprite2D `doc_idle_anim_f0..3` на позиции `O` из карты, стоит всю игру (не имеет коллизии с врагами; враги его игнорируют).
* Метод `say(text: String)`: Label над головой (маленький, жёлтый) с текстом на 3 сек (твин alpha).
* Реплики (вызывает волновой менеджер):
  * Старт: «Рыцарь! Барьер держится, пока я у фонтана. Защити меня — и я открою дверь!»
  * После волны 1: «Отлично! Возьми оружие из сундука — оно тебе понадобится.»
  * После волны 2: «Они идут из глубин… Держись!»
  * После волны 3: «Чувствую тяжёлую поступь… Огр близко!»
  * После волны 4: «Это он… Повелитель крипты! Убей его — и мы свободны!»
  * После босса: «Путь открыт! Подойди ко мне, уходим!»
* `victory_sequence()`: заменить текстуру двери на `doors_leaf_open.png`, реплика доктора, включить у доктора «зону победы» (дистанция < 20 от игрока → `GameState.state = VICTORY`, показать экран победы).

**Проверка M5:** полная партия играется от 1-й волны до босса; сундук выдаёт оружие по очереди; зелья лечат; после босса дверь открывается, подход к доктору даёт победу; смерть в любой момент даёт поражение.

---

### M6. Меню: главное, пауза, победа, поражение

#### `scripts/menus.gd` (`extends CanvasLayer`, `layer = 10`)

Всё кодом, единый стиль: фон — `ColorRect` (чёрный, alpha 0.75) на весь экран; по центру `VBoxContainer` с Label-заголовком (size 28) и кнопками (`Button`, min размер 160×28). Функции:

* `show_main_menu()`: заголовок «КРИПТА ЗАБЫТОГО ДОКТОРА», под ним подзаголовок-лор (2 строки: «Доктор заперт в крипте. Продержись 5 волн и убей Повелителя крипты.»), управление («WASD — движение, мышь/ЛКМ — атака, E — сундук, Esc — пауза»), кнопки: «Играть», «Выход». Декор: два AnimatedSprite2D (рыцарь idle слева, big_demon idle справа, scale ×3) — атмосферно и бесплатно.
* `show_pause()`: «ПАУЗА», кнопки «Продолжить», «В главное меню», «Выход».
* `show_game_over()`: «ТЫ ПАЛ В КРИПТЕ…», статистика (`Волн пройдено: X, Убийств: Y, Монет: Z`), кнопки «Ещё раз», «В меню».
* `show_victory()`: «СВОБОДА! Доктор спасён!», та же статистика + «Итоговый счёт: монеты×10 + убийства×5», кнопки «Ещё раз», «В меню».
* `hide_all()`.

#### Логика состояний (main.gd)

* Пауза: по Esc в PLAYING → `get_tree().paused = true`, `GameState.state = PAUSED`, `menus.show_pause()`. У menus `process_mode = Node.PROCESS_MODE_ALWAYS`, у корня мира — дефолтный (PAUSABLE). Продолжить → снять паузу.
* «Играть»/«Ещё раз» → `restart_game()`: `get_tree().paused = false; GameState.reset();` удалить узел `world` целиком (`queue_free`) и пересоздать всё заново (комната, игрок, hud-значения, волны). Пересоздание с нуля — самый надёжный рестарт, никакого ручного сброса полей.
* Победа/поражение: показывать оверлей через 1 сек после события (таймер), чтобы игрок увидел смерть/открытую дверь.

**Проверка M6:** игра стартует в меню; Играть → партия; Esc — пауза и продолжение; смерть → экран поражения → «Ещё раз» работает без ошибок и утечек (повторить 3 раза подряд); победа → экран победы со счётом.

---

### M7. Соль и перец: звук (программный синтез), тряска, шипы, полировка эффектов

#### `scripts/sfx.gd` — синтез звука кодом (без внешних файлов)

Идея: заранее (в `_ready`) сгенерировать PCM-волны в `AudioStreamWAV` и проигрывать через пул `AudioStreamPlayer`.

```gdscript
extends Node
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
```

Подключить вызовы `Sfx.play(...)` во все места, помеченные в M2–M6. На кнопки меню — `"click"` (сигнал `pressed`).

#### Тряска камеры

В main: `Camera2D` (создать кодом, `position = Vector2(240,135)`, `enabled=true`). Поле `shake := 0.0`. В `_process`: `camera.offset = Vector2(randf_range(-1,1), randf_range(-1,1)) * shake; shake = move_toward(shake, 0.0, 20.0 * delta)`. Функция `add_shake(v)`: удар по врагу +1.5, урон игроку +4, смерть огра/босса +8, взрыв — +6. Вызывать из player/enemy через группу или ссылку на main (`get_tree().get_first_node_in_group("main")` — main добавить в группу "main").

#### `scripts/spikes.gd` — шипы

* AnimatedSprite2D с кадрами `floor_spikes_anim_f0..3`, НЕ autoplay. Цикл таймером: 1.6 c убраны (кадр f0) → выдвижение f1→f2→f3 по 0.08 c → 1.0 c выдвинуты (f3) → обратно. Фазу каждого экземпляра сдвинуть случайно (`start_delay = randf() * 2.0`).
* Пока выдвинуты (кадр == 3): проверять дистанцию до игрока < 8 → `player.take_damage(1)`; и до врагов < 8 → `enemy.take_damage(1, Vector2.ZERO)` не чаще раза в 0.5 c на жертву (враги тоже боятся шипов — это тактика для игрока!). z_index ниже персонажей (рисуются на полу: положить в floor_layer поверх пола).
* Создать шипы на всех клетках `S` из карты (main, этап M5-территория — если ещё не сделано, сделать сейчас).

#### Мелкая полировка (обязательно)

* Частицы при взмахе: маленький след — не обязательно; вместо этого при попадании — 6 белых искр CPUParticles2D в точке врага.
* Смерть босса: `Engine.time_scale = 0.2` на 0.5 реального времени + вспышка всего экрана (ColorRect белый alpha 0.6 → 0 твином) + `Sfx.play("boom")` + сильная тряска.
* Монеты: у HUD-счётчика лёгкий «пульс» scale 1.2→1.0 при подборе.
* Фонтан и баннеры уже анимированы — проверить, что работают.

**Проверка M7:** все действия озвучены; удары дают тряску и хит-стоп; шипы работают по циклу и ранят и игрока, и врагов; смерть босса выглядит эффектно.

---

### M8. Финальное QA (пройти весь чек-лист)

1. Полное прохождение: меню → 5 волн → босс → дверь → доктор → экран победы. Без ошибок в консоли.
2. Смерть на волне 1 и на боссе → экран поражения, «Ещё раз» — играбельно, «В меню» — меню.
3. Пауза во время боя, в перерыве волн, во время баннера — везде корректно снимается.
4. 3 рестарта подряд — память/узлы не текут (нет ошибок «previously freed»).
5. Игрок не может выйти за стены, застрять в ящике, сундуке, дверях.
6. Некромант не убегает в стену навечно (если упёрся — стоит и стреляет: допустимо).
7. Все звуки слышны, ни один не «щёлкает» бесконечно.
8. При сворачивании фокуса игра не крашится.
9. В консоли за всю партию нет ни одной красной ошибки и ни одного жёлтого warning про отсутствующие текстуры.
10. Проверить, что НИ ОДИН load() не указывает на несуществующий файл: `grep -rn "res://assets" scripts/` и сверить каждый путь с разделом 1.

---

## 4. Известные подводные камни (прочитать ДО написания кода)

1. **Godot 3 vs 4.** Не писать `onready`, `export`, `yield`, `KinematicBody2D`, `move_and_slide(velocity)`. Только Godot 4 API. Твины — ТОЛЬКО `create_tween()`, узел Tween не существует.
2. **`class_name` + автозагрузка.** У автозагрузок (`game_state.gd`, `sfx.gd`) НЕ писать `class_name` — обращаться по имени автозагрузки (`GameState`, `Sfx`).
3. **Изменение физики в колбэках.** `collision.disabled = true` и `queue_free()` внутри сигналов физики — только через `set_deferred` / `call_deferred`, иначе ошибки «Can't change this state while flushing queries».
4. **Пауза.** Меню должны иметь `process_mode = PROCESS_MODE_ALWAYS`, иначе кнопки в паузе не нажмутся. Хит-стоп через `Engine.time_scale` — таймер для возврата создавать с `ignore_time_scale = true` (4-й аргумент `create_timer`).
5. **Имена файлов.** `skelet_`, а не `skeleton_`; `wizzard_` с двумя z; у некроманта нет `idle`/`run` в имени; у zombie нет `f0` (не использовать его вовсе).
6. **Размеры спрайтов разные** (16/23/28/36 в высоту) — всегда ставить ноги в точку узла (см. `Art.make_char_sprite`), иначе враги будут «летать».
7. **Y-сортировка** работает только если `y_sort_enabled = true` у ОБЩЕГО родителя, и у детей z_index = 0. Декали/пол держать в отдельных слоях с отрицательным z_index.
8. **Флип оружия.** Не отражать спрайт оружия по X — вращения pivot достаточно; при взмахе влево картинка может быть «вверх ногами» на долю секунды, на пиксель-арте это незаметно. Не усложнять.
9. **randomize()** вызвать один раз в `main._ready()` (`randomize()`), иначе одинаковые «случайные» полы.
10. **Частицы CPUParticles2D**: обязательно `one_shot = true`, `emitting = true`, и удалять узел таймером (`get_tree().create_timer(1.0).timeout.connect(node.queue_free)`), иначе накопятся сотни узлов.
11. **AudioStreamWAV.data** — 16-бит little-endian PCM; писать через `encode_s16`. Громкость держать ≤ 0.5, иначе клиппинг.
12. **Не переусердствовать.** Если этап работает — НЕ рефакторить и не добавлять фичи сверх плана. Лучше рабочая простая игра, чем сломанная сложная.

---

## 5. Соответствие критериям оценки (самопроверка)

| Критерий | Чем закрываем |
|---|---|
| Креативность | Защита NPC + барьер, прогрессия оружия из сундуков, шипы как обоюдоострая тактика |
| Качество реализации | Пошаговые этапы с проверками, минимум движущихся частей, QA-чек-лист M8 |
| Геймплей | 5 волн с ростом сложности, огр-мини-босс, босс с веером снарядов и яростью, зелья, кайт некромантов |
| История | Лор в меню, реплики доктора между волнами, финальное спасение |
| Полнота | Меню, пауза, победа, поражение, рестарт, статистика — при компактном объёме (партия 5–8 минут) |
| Ассеты | 8 типов врагов, 4 оружия, сундук, зелья, монеты, фонтан, баннеры, шипы, дверь, черепа-декали, доктор-NPC |
| Визуальные эффекты | Вспышки урона, хит-стоп, тряска, частицы смерти/искры, спавн-фейд, слоу-мо на боссе, вспышка экрана |
| Звук | 11 программно синтезированных SFX (см. M7) |

---

## 6. Порядок работы (сводка для исполнителя)

```
M0 каркас → M1 комната → M2 игрок+HUD → M3 атака → M4 враги →
M5 волны/сундук/босс/доктор → M6 меню → M7 звук+эффекты+шипы → M8 QA
```

После каждого M: запустить игру, выполнить «Проверку», убедиться в пустой консоли ошибок — и только потом продолжать.
