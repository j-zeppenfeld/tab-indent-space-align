'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Tab-Indent Space-Align activated.');
	
	// Insert tab or spaces depending on position of cursor in line.
	// Perform a tab and space preserving block indent over a selection.
	let indent = vscode.commands.registerCommand(
		'Alignment Preserving Indent',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			let tabSize = editor.options.tabSize as number;
			let tab = editor.options.insertSpaces
			        ? ' '.repeat(tabSize)
			        : '\t';
			
			editor.selections.forEach(it => {
				// Insert tab or spaces if the selection is empty.
				if(it.isEmpty) {
					// Insert tab if the line contains only tab characters prior
					// to the cursor.
					let line = document.lineAt(it.start.line).text;
					let indent = line.search(/[^\t]|$/);
					if(it.start.character <= indent) {
						edit.insert(it.active, tab);
					} else {
						// TODO: Determine tab-stops from surrounding lines.
						//       For now, pad to next multiple of tabSize.
						let used = (it.start.character - indent) % tabSize;
						edit.insert(it.active, ' '.repeat(tabSize - used));
					}
				// Otherwise perform a block indent.
				} else {
					// Include last line of selection if only one line is
					// selected or if a character on the last line is selected.
					let line = it.start.line;
					let end = it.end.line;
					if(end === line || it.end.character > 0) {
						++end;
					}
					// Insert a leading tab into each line of the selection.
					for(; line < end; ++line) {
						edit.replace(new vscode.Position(line, 0), tab);
					}
				}
			});
		});
	});
	context.subscriptions.push(indent);
	
	// Perform a tab and space preserving block outdent.
	let outdent = vscode.commands.registerCommand(
		'Alignment Preserving Outdent',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			let tab = editor.options.insertSpaces
			        ? ' '.repeat(editor.options.tabSize as number)
			        : '\t';
			
			editor.selections.forEach(it => {
				// Include last line of selection if only one line is selected
				// or if a character on the last line is selected.
				let line = it.start.line;
				let end = it.end.line;
				if(end === line || it.end.character > 0) {
					++end;
				}
				// Remove a leading tab from each line of the selection.
				for(; line < end; ++line) {
					if(document.lineAt(line).text.startsWith(tab)) {
						edit.delete(new vscode.Range(line, 0, line, tab.length));
					}
				}
			});
		});
	});
	context.subscriptions.push(outdent);
	
	// Copy indentation and alignment from previous line.
	// Preserves tabs for indentation and spaces for alignment.
	let newline = vscode.commands.registerCommand(
		'Alignment Preserving Newline',
		() =>
	{
		let editor = vscode.window.activeTextEditor;
		if(!editor) {
			return;
		}
		
		editor.edit((edit: vscode.TextEditorEdit) => {
			if(!editor) {
				return;
			}
			
			let document = editor.document;
			let tab = editor.options.insertSpaces
			        ? ' '.repeat(editor.options.tabSize as number)
			        : '\t';
			
			editor.selections.forEach(it => {
				// Retrieve leading whitespace from first line.
				let firstLine = document.lineAt(it.start.line).text;
				let indent = firstLine.search(/\S|$/);
				let prefix = firstLine.substring(0, indent);
				
				// Retrieve trailing whitespace from last line.
				let lastLine = document.lineAt(it.end.line).text;
				let endent = it.end.character
				           + lastLine.substring(it.end.character).search(/\S|$/);
				
				// Move selection start behind prefix.
				let beforeText : string;
				if(it.start.character < indent) {
					edit.delete(new vscode.Range(
						it.start.line, 0,
						it.start.line, it.start.character
					));
					edit.insert(it.start, prefix);
					beforeText = prefix;
				} else {
					beforeText = firstLine.substring(0, it.start.character);
				}
				
				// Delete selection and any whitespace after selection end.
				let afterText = lastLine.substring(endent);
				edit.delete(new vscode.Range(
					it.start.line, it.start.character,
					it.end.line, endent
				));
				
				// Retrieve the line one above the selection start.
				let oneBeforeText : string;
				if(it.start.line > 0) {
					oneBeforeText = document.lineAt(it.start.line - 1).text;
				} else {
					oneBeforeText = "";
				}
				
				// TODO: Auto-indent if surrounded by braces etc.
				console.log(
					JSON.stringify(prefix) +
					" " + JSON.stringify(oneBeforeText) +
					" " + JSON.stringify(beforeText) +
					" " + JSON.stringify(afterText)
				);
				let action : number = vscode.IndentAction.None;
				
				switch(action) {
				case vscode.IndentAction.Indent:
					edit.insert(it.start, '\n' + tab + prefix);
					break;
				case vscode.IndentAction.IndentOutdent:
					edit.insert(it.start, '\n' + tab + prefix);
					if(afterText.length > 0) {
						// Inserting text after the selection is a bit tricky
						// without affecting the selection, so insert text
						// after afterText, then delete up to that insertion.
						let after = it.end.translate(0, afterText.length);
						edit.insert(after, '\n' + prefix + afterText);
						edit.delete(new vscode.Range(it.end, after));
					}
					break;
				case vscode.IndentAction.Outdent:
					// Outdent only if there are leading tabs in the prefix.
					if(prefix.startsWith(tab)) {
						edit.insert(it.start, '\n' + prefix.substring(tab.length));
					} else {
						edit.insert(it.start, '\n' + prefix);
					}
					break;
				default:
					// Do not change indentation, just copy from above.
					edit.insert(it.start, '\n' + prefix);
					break;
				}
			});
		});
	});
	context.subscriptions.push(newline);
}
