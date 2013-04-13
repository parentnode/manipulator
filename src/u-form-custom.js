// Add new send types if required

Util.Form.customSend = new Object();

Util.Form.customSend["jdata"] = function(params) {

	object = u.f.convertNamesToJsonObject(params);

	return "jdata=" + escape(JSON.stringify(object));

}
