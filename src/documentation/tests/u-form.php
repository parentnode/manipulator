<? $page_title = "Forms tests" ?>
<? $body_class = "tests" ?>
<? include_once("../php/header.php") ?>

	<style type="text/css">

	</style>
	<script type="text/javascript">
		Util.Objects["test"] = new function() {
			this.init = function(form) {


				// var json_test = {"test_1":"fisk","object":{"test_2":"fisk2","test_3":"fisk6"}};
				// u.bug(json_test.object.test_2)
				// 
				// var json_test = {
				//   "navn" : "Test navn",
				//   "apps" : [
				//     {
				//       "app1" : {
				//         "id" : "1",
				//         "navn" : "App 1"
				//       }
				//     },
				//     {
				//       "app2" : {
				//         "id" : "2",
				//         "navn" : "App 2"
				//       }
				//     }
				//   ]
				// };
				// 
				// u.bug(json_test.apps[0].app1.id)
// //				var json_test = {"test_1":"fisk","object":{"test_2":"fisk2","test_3":"fisk6"}};
// 				var json_test = new Object();
// 				json_test.test_1 = "fisk";
// 				json_test.array = new Object();
// 				json_test.array.test_2 = "fisk2";
// 				json_test.array.test_3 = "fisk6";
// 
// 				u.bug("1:object length:" + json_test.array.length);
// 
// 				u.bug("1:json_test##" + json_test.test_1 + "##" + json_test.array + "##" + json_test.array.test_2);
// 				var json_string = JSON.stringify(json_test);
// 				u.bug("1:json_string:" + json_string + ":" + json_string.array);
// 				var json_obj = eval("("+json_string+")");
// 				u.bug("1:json_obj:" + json_obj + ":" + json_obj.array + ":" + json_obj.array.test_2);
// 
// 				u.bug("------");


//				var json_test = {"test_1":"fisk","array":[{"test_2":"fisk2"},{"test_3":"fisk6"}]};
				// var json_test = new Object();
				// json_test["test_1"] = "fisk";
				// json_test["apps"] = new Array();
				// json_test["apps"][0] = new Object()
				// json_test["apps"][0]["id"] = "fisk2";
				// json_test["apps"][0]["name"] = "fisk2";
				// json_test["apps"][15] = new Array()
				// json_test["apps"][15][0] = new Object()
				// 
				// json_test["apps"][15][0]["id"] = "fisk6";
				// json_test["apps"][15][0]["name"] = new Object()
				// json_test["apps"][15][0]["name"]["fus"] = "fisk6";

//				json_test.array["100"] = "fisk6";

//				u.bug("2:array length:" + json_test.apps.length);

//				u.bug("2:json_test##" + json_test.test_1 + "##" + json_test.apps + "##" + json_test.apps["test_3"]);
				// var json_string = JSON.stringify(json_test);
				// u.bug("json_string:" + json_string);

//				var json_obj = eval("("+json_string+")");
//				u.bug("2:json_obj:" + json_obj + ":" + json_obj.apps + ":" + json_obj.apps["test_3"]);



				u.f.init(form);

				form.submitted = function(iN) {
//					u.bug("submitted:" + this.submitButton);
					u.bug(u.f.getParams(this, {"ignore":"fisk"}));
					u.bug(u.f.getParams(this, {"type":"json"}));
					u.bug(u.f.getParams(this, {"type":"jdata"}));

//					alert("fisk")

//					u.bug(u.listObjectContent(u.f.getParams(this, {"type":"object"})));
//					u.bug(u.f.getParams(this, {"type":"json"}));
				}
				form.changed = function(iN) {
					u.bug("changed:" + iN.name)
				}
				form.updated = function(iN) {
					u.bug("updated:" + iN.name)
				}
			}

		}
	</script>

	<div id="content" class="events">
		<h2>Form</h2>
		<div class="scene">

			<form name="test1" action="#" method="get" class="i:test">
				<input type="hidden" name="hidden" value="hidden value" class="ignoreinput" />
				<fieldset>
					<div class="field string">
						<label for="test1_string1">String 1</label>
						<input type="text" name="string1" id="test1_string1" class="fisk" />
					</div>

					<div class="field string">
						<label for="test1_string2">String 2</label>
						<input type="text" name="string2" id="test1_string2" />
					</div>

					<div class="field string email">
						<label for="test1_email">Email</label>
						<input type="email" name="email" id="test1_email" />
					</div>

					<div class="field string password">
						<label for="test1_password">Password</label>
						<input type="password" name="password" id="test1_password" />
					</div>

					<div class="field select">
						<label for="test1_select_1">select</label>
						<select name="select_1" id="test1_select_1">
							<option value="">-</option>
							<option value="option_1">option 1</option>
							<option value="option_2">option 2</option>
						</select>
					</div>

					<div class="field select">
						<label for="test1_select_2">select</label>
						<select name="select_2" id="test1_select_2">
							<option value="option_1">option 1</option>
							<option value="option_2">option 2</option>
						</select>
					</div>

					<div class="field text">
						<label for="test1_text">Text</label>
						<textarea name="text" id="test1_text"></textarea>
					</div>

					<div class="field boolean">
						<label for="test1_boolean">Boolean</label>
						<input type="hidden" name="boolean" value="0" />
						<input type="checkbox" name="boolean" id="test1_boolean" value="true" />
					</div>
					<div class="field checkbox">
						<label for="test1_checkbox">Checkbox</label>
						<input type="checkbox" name="checkbox" id="test1_checkbox" value="true" />
					</div>

					<div class="field radio">
						<span>
							<label for="test1_radio_1_a">Radio 1 a</label>
							<input type="radio" name="radio_1" id="test1_radio_1_a" />
						</span>
						<span>
							<label for="test1_radio_1_b">Radio 1 b</label>
							<input type="radio" name="radio_1" id="test1_radio_1_b" />
						</span>
					</div>

					<div class="field radio">
						<label for="test1_radio_2_a">Radio 2 a</label>
						<input type="radio" name="radio_2" id="test1_radio_2_a" />
					</div>
					<div class="field radio">
						<label for="test1_radio_2_b">Radio 2 b</label>
						<input type="radio" name="radio_2" id="test1_radio_2_b" />
					</div>

					<ul class="actions">
						<li><input type="button" value="button with name" name="button_name" /></li>
						<li><input type="button" value="button without name" /></li>
						<li><input type="submit" value="submit with name 1" name="submit_name_1" /></li>
						<li><input type="submit" value="submit without name" /></li>
					</ul>

				</fieldset>
			</form>

			<form name="test2" action="#" method="post" class="i:test">
				<input type="hidden" name="hidden" value="hidden value" />
				<fieldset>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="string2[test3]" id="test2_string2" value="string2_test3" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="string2[test2]" id="test2_string2" value="string2_test2" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="string2[test1][fisk]" id="test2_string2" value="string2_test1_fisk" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="string2[test1][1][name]" id="test2_string2" value="string2_test1_1_name" />
					</div>

				</fieldset>

				<ul class="actions">
					<li><input type="submit" value="submit with name 2" name="submit_name_2" /></li>
					<li><input type="submit" value="submit without name" /></li>
				</ul>
			</form>
			
			
			
			<form name="test3" action="#" method="post" class="i:test">
				<input type="hidden" name="hidden" value="hidden value" />
				<fieldset>

		
					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="navn" id="test2_string2" value="Test navn" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app1][id]" id="test2_string2" value="1" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app1][navn]" id="test2_string2" value="App 1" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app2][id]" id="test2_string2" value="1" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app2][navn]" id="test2_string2" value="App 2" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app3][navn]" id="test2_string2" value="App 3 navn" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app3][id][gas][kat][trold]" id="test2_string2" value="App 3 id gas hund fisk" />
					</div>
					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app3][id][gas][hund][trold]" id="test2_string2" value="App 3 id gas hund fisk" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app3][id][gas][hund][fisk]" id="test2_string2" value="App 3 id gas hund fisk" />
					</div>
					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app3][id][gas][hund][torsk]" id="test2_string2" value="App 3 id gas hund fisk" />
					</div>

					<div class="field string">
						<label for="test2_string2">String 2</label>
						<input type="text" name="apps[app4]" id="test2_string2" value="App 4" />
					</div>

				</fieldset>

				<ul class="actions">
					<li><input type="submit" value="submit with name 2" name="submit_name_2" /></li>
					<li><input type="submit" value="submit without name" /></li>
				</ul>
			</form>

		</div>
		
		<div class="comments"></div>

	</div>

<? include_once("../php/footer.php") ?>