

function init() {

	var theme = "ace/theme/chrome";

	var outEditor = ace.edit("output");
	outEditor.$blockScrolling = Infinity;
	outEditor.setTheme(theme);
	outEditor.getSession().setMode("ace/mode/javascript");
	outEditor.setReadOnly(true);

	var inEditor = ace.edit("input");
	inEditor.$blockScrolling = Infinity;
	inEditor.setTheme(theme);
	inEditor.getSession().setMode("ace/mode/java");

	function ErrorListener() {
		this.errors = [];
	}

	ErrorListener.prototype.syntaxError = function(recognizer, offendingSymbol, line, column, msg, e) {
		this.errors.push({
			row: line,
			column: column,
			text: msg,
			type: "error" // also warning and information
		});
	};
	ErrorListener.prototype.reportAmbiguity = 
	ErrorListener.prototype.reportAttemptingFullContext = 
	ErrorListener.prototype.reportContextSensitivity = function() {};

	var timeout = 0;
	inEditor.getSession().on('change', function(e) {
		if(timeout)
			clearTimeout(timeout);
		timeout = setTimeout( update, 100);
	});
	function update() {
		var el = new ErrorListener();
		var jsrc = inEditor.getValue();
		var jtree = java2js.parse(jsrc, el);
		var jstree = java2js.transpile(jtree);
		var jssrc = java2js.genCode(jstree);
		inEditor.getSession().setAnnotations(el.errors);
		outEditor.setValue(jssrc);
		outEditor.selection.clearSelection();
	}
	update();
}
