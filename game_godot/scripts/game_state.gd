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
