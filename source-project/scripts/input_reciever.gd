extends Node2D

var timescale_temp: int = 6
signal set_timescale

func _process(delta: float) -> void:
	handle_submit()
	handle_reset()

func setup_grapher() -> void:
	Global.open_page("res://scenes/grapher.tscn","/root/@Node2D@13")
	#$"/root/@Node2D@13/Grapher"

func handle_submit() -> void:
	if Input.is_action_just_released("submit"):
		Global.user_in = $"Layout/Panel_Box/Margin/V_Box/Text_Edit".text
		
		Global.user_in = trim_whitespace(Global.user_in)
		
		print(Global.user_in)
		
		if $"Layout/Panel_Box/Margin/V_Box/HBox/HBox/Text_Edit".text != "":
			timescale_temp = int($"Layout/Panel_Box/Margin/V_Box/HBox/HBox/Text_Edit".text)
		print("\nTimescale temp: " + str(timescale_temp))
		
		check_time_ctrls()

		await setup_grapher()
		$"/root/@Node2D@13/Grapher".timescale = timescale_temp
		set_timescale.emit()
		
		queue_free()

func trim_whitespace(string: String):
	#Add stuff here, not yet tho work on fundamentals first.
	return string

func check_time_ctrls():
	if not $"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox/Check".button_pressed:
		Global.classical = false
	if not $"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox2/Check".button_pressed:
		Global.rapid = false
	if $"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox3/Check".button_pressed:
		Global.blitz = true

func handle_reset():
	if Input.is_action_just_released("reset"):
		$"Layout/Panel_Box/Margin/V_Box/Text_Edit".text = ""
		
		$"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox/Check".button_pressed = true
		$"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox2/Check".button_pressed = true
		$"Layout/Panel_Box/Margin/V_Box/HBox/VBox/HBox3/Check".button_pressed = false
		
		$"Layout/Panel_Box/Margin/V_Box/HBox/HBox/Text_Edit".text = ""
