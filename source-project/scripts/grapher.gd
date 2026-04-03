extends Node2D

@export var timescale: int

var highest_ratings: Array = []
var input_type: String = "U"
var times: Array = []
var c_ratings: Array = []
var r_ratings: Array = []
var b_ratings: Array = []
@onready var graph_2d: Graph2D = get_node("Layout/PanelContainer/MarginContainer/Graph2D")

func _ready() -> void:
	await $"/root/@Node2D@13/Input_Reciever".set_timescale
	hide_graph_init()
	await retrieve_data()
	await collect_data()
	await show_stuff()
	plot_graph()

func _process(delta: float) -> void:
	if Input.is_action_just_released("reset"):
		reset()

func retrieve_data() -> void: #No errors. calls all the api's and gets the data
	sort_input_type()
	if input_type == "C":
		make_list_with_times()
		
		print("\n" + str(Global.classical))
		print(Global.rapid)
		print(Global.blitz)
		
		if Global.classical:
			Global.current_focus = "S"
			for month in times: #adding ratings to the dictionary
				Global.call_api(Global.proxy + "https://rating.englishchess.org.uk/v2/new/api.php?v2/ratings/S/" + Global.user_in[0] + Global.user_in[1] + Global.user_in[2] + Global.user_in[3] + Global.user_in[4] + Global.user_in[5] + "/" + month)
				await get_node("/root/@Node2D@13/HTTPRequest").request_completed
		
		if Global.rapid:
			Global.current_focus = "R"
			for month in times: #adding ratings to the dictionary
				Global.call_api(Global.proxy + "https://rating.englishchess.org.uk/v2/new/api.php?v2/ratings/R/" + Global.user_in[0] + Global.user_in[1] + Global.user_in[2] + Global.user_in[3] + Global.user_in[4] + Global.user_in[5] + "/" + month)
				await get_node("/root/@Node2D@13/HTTPRequest").request_completed
		
		if Global.blitz:
			Global.current_focus = "B"
			for month in times: #adding ratings to the dictionary
				Global.call_api(Global.proxy + "https://rating.englishchess.org.uk/v2/new/api.php?v2/ratings/B/" + Global.user_in[0] + Global.user_in[1] + Global.user_in[2] + Global.user_in[3] + Global.user_in[4] + Global.user_in[5] + "/" + month)
				await get_node("/root/@Node2D@13/HTTPRequest").request_completed
				
	else:
		#Don't do this, save it for the end. Also this sector needs to check if the name is in the database
		pass
	
	print("\n" + str(Global.ratings))
	
	
func sort_input_type() -> void: #No errors, sorts rating codes or name
	if Global.user_in[0].is_valid_int():
		input_type = "C"
	else:
		input_type = "N"

func make_list_with_times(): #This makes a list with the past n times, e.g. 2026-03-1, 2026-02-01. No errors
	print("\nTimescale: " + str(timescale))
	
	var current_time = Time.get_date_string_from_system()
	var month: int = 0
	var year: int = 0
	
	month = int(current_time.get_slice("-",1)) + 1
	year = int(current_time.get_slice("-",0))
	
	for i in range(timescale):
		month -= 1
		if month == 0:
			month = 12
			year -= 1
		
		if month < 10:
			times.append(str(year) + "-0" + str(month) + "-01")
		else:
			times.append(str(year) + "-" + str(month) + "-01")
	
	print("\n" + str(times))

func plot_graph() -> void:
	highest_ratings.append(c_ratings.max())
	highest_ratings.append(r_ratings.max())
	highest_ratings.append(b_ratings.max())
	
	graph_2d.x_max = timescale - 1
	#graph_2d.y_min = c_ratings.min() - 50
	graph_2d.y_max = highest_ratings.max() + 50

	add_grid_lines()

	plot_points()

func hide_graph_init() -> void:
	$"Layout/PanelContainer/MarginContainer".visible = false
	$"ECF Rating".visible = false
	$"Time".visible = false
	$"Layout/PanelContainer/Reset".visible = false
	
	$"Layout/HBox/B".visible = false
	$"Layout/HBox/R".visible = false
	$"Layout/HBox/S".visible = false
	
	$"Layout/PanelContainer/Text".visible = true
	$"Layout/PanelContainer/Tip".visible = true
	$"Layout/PanelContainer/Reset2".visible = true
	
func show_stuff() -> void:
	$"Layout/PanelContainer/MarginContainer".visible = true
	$"ECF Rating".visible = true
	$"Time".visible = true
	$"Layout/PanelContainer/Reset".visible = true
	
	$"Layout/HBox/B".visible = true
	$"Layout/HBox/R".visible = true
	$"Layout/HBox/S".visible = true
	
	$"Layout/PanelContainer/Text".visible = false
	$"Layout/PanelContainer/Tip".visible = false
	$"Layout/PanelContainer/Reset2".visible = false

func collect_data() -> void:
	for time in times:
		if not time in Global.ratings["S"]:
			c_ratings.append(0)
		else:
			c_ratings.append(Global.ratings["S"][time])
		
		if not time in Global.ratings["R"]:
			r_ratings.append(0)
		else:
			r_ratings.append(Global.ratings["R"][time])
			
		if not time in Global.ratings["B"]:
			b_ratings.append(0)
		else:
			b_ratings.append(Global.ratings["B"][time])
		
	print("\nClassical Ratings: " + str(c_ratings))
	print("\nRapid Ratings: " + str(r_ratings))
	print("\nBlitz Ratings: " + str(b_ratings))

func add_grid_lines():
	for i in range(0,graph_2d.y_max,100): #Add the horizontal lines
		var line = graph_2d.add_plot_item(" ",Color.from_rgba8(255,255,255,150), 2)
		line.add_point(Vector2(0,i))
		line.add_point(Vector2(timescale-1,i))
		
func plot_points():
	if Global.classical:
		var c_plot = graph_2d.add_plot_item(" ", Color.RED, 3)
		for i in range(len(c_ratings)):
			c_plot.add_point(Vector2(timescale-1-i,c_ratings[i]))
	
	if Global.rapid:
		var r_plot = graph_2d.add_plot_item("  ", Color.GREEN, 3)
		for i in range(len(r_ratings)):
			r_plot.add_point(Vector2(timescale-1-i,r_ratings[i]))
	
	if Global.blitz:		
		var b_plot = graph_2d.add_plot_item("   ", Color.DODGER_BLUE, 3)
		for i in range(len(b_ratings)):
			b_plot.add_point(Vector2(timescale-1-i,b_ratings[i]))

func reset() -> void:
	Global.open_page("res://scenes/input_reciever.tscn","/root/@Node2D@13")
	queue_free()
