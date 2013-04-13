// if(typeof(JSON) == "object") {
// 	
// 	
// }



/*

				for(i = 0; checkbox = checkboxes[i]; i++) {
					// do not include template item
					if(!checkbox.parentNode.className.match(/template/g)) {
						var field_object = checkbox.name.split("[");
						if(field_object.length == 2) {
							if(!var_object[field_object[0]]) {
//								u.bug("new")
								var_object[field_object[0]] = new Array();
							}
	//						u.bug("1:" + field_object[1])
//							u.bug("2:" + field_object[1].replace(/]/g, ""))
							var_object[field_object[0]][field_object[1].replace(/]/g, "")] = (checkbox.checked ? checkbox.value : 0);
						}
					}
				}
	//			var agreement_id = u.
			}

//			u.bug(JSON.stringify(var_object));
//			u.bug(var_object.toJSON());
			
			var params = form.toJsonString(var_object);



			u.toJsonString = function(object) {

				var s = "{";
				for(name in object) {
					if(typeof(object[name]) == "object") {
						s += '"'+name+'":['+this.toJsonString(object[name])+']';
					}
					else {
						s += '"' + name + '":"' + object[name] + '",';
					}
				}

				s += "}";
				return s;
			}
			
*/