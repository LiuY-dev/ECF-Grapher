extends Node2D #We fixed the CORS. Publish.

const proxy: String = "https://corsproxy.io/?url="

var current_focus: String = "S"

var classical: bool = true
var rapid: bool = true
var blitz: bool = false

var user_in: String = ""

var ratings: Dictionary = {
	"S":{},
	"R":{},
	"B":{}
}

func open_page(filepath: String, nodepath: String) -> void: #No errors. This code can actually be reused in other projects
	var scene = load(filepath)
	get_node(nodepath).add_child(scene.instantiate())
	
func call_api(path: String):
	$"/root/@Node2D@13/HTTPRequest".request(path)


func _on_http_request_request_completed(result: int, response_code: int, headers: PackedStringArray, body: PackedByteArray) -> void:
	
	var json = (body.get_string_from_utf8())
	json = JSON.parse_string(json)
	
	print(json)
	
	if json["success"] == false:
		if json["msg"] == "Player has no ratings for the given date":
			print("\nNo rating found for a given date")
		else:
			print("Request unsuccessful")
	else:
		Global.ratings[Global.current_focus][json["effective_date"]] = json["revised_rating"]
	print("\n" + str(json))
