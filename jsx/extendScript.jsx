$.runScript = {
	importFolderCopyTemp: function (checkBoxValue, defaultLocation) {
		//define the project
		var proj = app.project;
		//get path to project file
		var folder = new Folder(proj.path)
		//define regular expressions
		var regEx = new RegExp("\/[^\/]*$");
		var regEx2 = new RegExp("[^\/]*$");
		//execute regluar expression 1
		var regEx1Return1 = regEx.exec(folder);
		regEx1Return1 = folder.toString().replace(regEx1Return1, '');
		//execute regluar expression 2
		var regEx1Return2 = regEx.exec(regEx1Return1);
		regEx1Return2 = regEx1Return1.toString().replace(regEx1Return2, '');
		//execute regluar expression 3
		var regEx1Return3 = regEx.exec(regEx1Return2);
		regEx1Return3 = regEx1Return2.toString().replace(regEx1Return3, '');
		//create path to footage folder
		var defaultFolder = new Folder(defaultLocation);
		//open import dialog
		var folderToImport = defaultFolder.selectDlg("Please select a folder to import");
		if (folderToImport == null) {
			return "null"
		}
		// execute regular expression 4
		// returns name of bin to create
		var newBinNameReturn = regEx2.exec(folderToImport);
		var newBinName = newBinNameReturn.toString();
		//get every file to import
		var theFiles = folderToImport.getFiles();
		//define empty array
		var importArr = [];
		//loop though files adding file system name to array
		for (var i = 0; i < theFiles.length; i++) {
			importArr[i] = theFiles[i].fsName;
		}
		//create new bin
		var newBin = proj.rootItem.createBin(newBinName);
		//import files into new bin
		proj.importFiles(importArr, 1, newBin, 0);

		if (checkBoxValue == "Ticked") {
			//find "-Template" and copy it into new bin
			try {
				var _error = false
				for (i = 0; _error != true; i++) {
					try {
						if (proj.sequences[i].name == "-Template") {
							try { proj.sequences[i].clone(); } catch (err) { }
						}
					} catch (err) {
						var _error = true
					}
				}
				for (i = 0; i < proj.rootItem.children.numItems; i++) {
					if (proj.rootItem.children[i].name == "-Template Copy") {
						var newTeplate = proj.rootItem.children[i]
					}
				}
				newTeplate.moveBin(newBin);
				newTeplate.name = newBinName;
				var _error = false
				for (i = 0; _error != true; i++) {
					try {
						if (proj.sequences[i].name == "-Template Copy") {
							try {
								var seqToDelete = proj.sequences[i]
								proj.deleteSequence(seqToDelete);
							} catch (err) { }
						}
					} catch (err) {
						var _error = true
					}
				}
			} catch (err) {
				alert("There is no -Template sequence to copy\nPlease create a -Template sequence or untick the box")
			}
		}
	}

}

function addToQueue(outputPath, presetPath, renderOptions, removeFromQueue) {
	var proj = app.project;
	outputPath = new Folder(outputPath);
	presetPath = new File(presetPath);
	function getSep(){
		if (Folder.fs == "Macintosh"){
			return "/";
		} else {
			return "\\";
		}
	}
	if (outputPath.exists && presetPath.exists){
		var activeSeq = proj.activeSequence
		var outputExtension = activeSeq.getExportFileExtension(presetPath.fsName);
		var outputFilePath = outputPath.fsName + getSep() + activeSeq.name + "." + outputExtension;
		var outputFileExists = new File(outputFilePath);
		if (outputFileExists.exists) {
			var deleteExisting = confirm("A file with that name already exists, do you want to overwrite it?", true, "Are you sure?")
			if (deleteExisting) {
				outputFileExists.remove();
				outputFileExists.close();
			}
		}
		app.encoder.encodeSequence(app.project.activeSequence, outputFilePath, presetPath.fsName, renderOptions, removeFromQueue);
		app.encoder.startBatch()
	}
}

function addBinsToQueue(outputPath, presetPath, renderOptions, removeFromQueue, binColour) {
	var proj = app.project;
	outputPath = new Folder(outputPath);
	presetPath = new File(presetPath);
	function getSep() {
		if (Folder.fs == "Macintosh") {
			return "/";
		} else {
			return "\\";
		}
	}
	var deleteExistingAsked = false;
	for (i = 0; i < proj.rootItem.children.numItems; i++) {
		if (proj.rootItem.children[i].getColorLabel() == binColour) {
			var currentColourItem = proj.rootItem.children[i]
			if (currentColourItem.type == 2) {
				var currentBin = proj.rootItem.children[i]
				for (j = 0; j < currentBin.children.numItems; j++) {
					var _error = false
					try {
						for (k = 0; _error != true; k++) {
							if (proj.sequences[k].name == currentBin.children[j].name) {
								if (outputPath.exists && presetPath.exists) {
									proj.activeSequence = proj.sequences[k]
									var activeSeq = proj.activeSequence
									var outputExtension = activeSeq.getExportFileExtension(presetPath.fsName);
									var outputFilePath = outputPath.fsName + getSep() + activeSeq.name + "." + outputExtension;
									var outputFileExists = new File(outputFilePath);
									if (outputFileExists.exists) {
										if (!deleteExistingAsked) {
											var deleteExisting = confirm("A file with that name already exists, do you want to overwrite it?\n(This will apply to all files)", true, "Are you sure?")
											if (deleteExisting) {
												outputFileExists.remove();
												outputFileExists.close();
											}
											deleteExistingAsked = true
										} else {
											if (deleteExisting) {
												outputFileExists.remove();
												outputFileExists.close();
											}
										}
									}
									app.encoder.encodeSequence(app.project.activeSequence, outputFilePath, presetPath.fsName, renderOptions, removeFromQueue);
									app.encoder.startBatch()
								}
							}
						}
					} catch (err) {
						_error = true
					}
				}
			}
		}
	}
}

function setDefaultLocation(defaultLocation) {
	var defaultLocation = new Folder(defaultLocation);
	var newDefaultFolder = defaultLocation.selectDlg("Please select a new default folder");
	if (newDefaultFolder == null) {
		return "null"
	}
	return newDefaultFolder.fsName
}
function setOutputFolder(outputPath) {
	var outputPath = new Folder(outputPath);
	var newDefaultFolder = outputPath.selectDlg("Please select a new output folder");
	if (newDefaultFolder == null) {
		return "null"
	}
	return newDefaultFolder.fsName
}

function setOutputPreset(outputPath) {
	var outputPath = new File(outputPath);
	var newDefaultFolder = File.openDialog("Please select a new output preset");
	if (newDefaultFolder == null) {
		return "null"
	}
	return newDefaultFolder.fsName
}


function getDefaultLocation(valueToReturn) {
	var proj = app.project;
	var folder = new Folder(proj.path)
	var regEx = new RegExp("\/[^\/]*$");
	var regEx2 = new RegExp("[^\/]*$");
	var regEx1Return1 = regEx.exec(folder);
	regEx1Return1 = folder.toString().replace(regEx1Return1, '');
	var regEx1Return2 = regEx.exec(regEx1Return1);
	regEx1Return2 = regEx1Return1.toString().replace(regEx1Return2, '');
	var regEx1Return3 = regEx.exec(regEx1Return2);
	regEx1Return3 = regEx1Return2.toString().replace(regEx1Return3, '');
	var defaultFolder = new Folder(regEx1Return3 + "/1_Video/1_Footage");
	var defaultFolderName = "1_Footage"
	if (!defaultFolder.exists) {
		var defaultFolder = new Folder(regEx1Return1);
		var defaultFolderName = regEx2.exec(regEx1Return1);
	}
	defaultFolderName = defaultFolderName.toString().replace("%20", ' ');
	if (valueToReturn == "Name") {
		return defaultFolderName
	} else if (valueToReturn == "Path") {
		return defaultFolder.fsName
	}
}

function getOutputFolder(valueToReturn) {
	var proj = app.project;
	var folder = new Folder(proj.path)
	var regEx = new RegExp("\/[^\/]*$");
	var regEx2 = new RegExp("[^\/]*$");
	var regEx1Return1 = regEx.exec(folder);
	regEx1Return1 = folder.toString().replace(regEx1Return1, '');
	var regEx1Return2 = regEx.exec(regEx1Return1);
	regEx1Return2 = regEx1Return1.toString().replace(regEx1Return2, '');
	var regEx1Return3 = regEx.exec(regEx1Return2);
	regEx1Return3 = regEx1Return2.toString().replace(regEx1Return3, '');
	var outputFolder = new Folder(regEx1Return3 + "/**Final Files**");
	var outputFolderName = "**Final Files**"
	if (!outputFolder.exists) {
		var outputFolder = new Folder(regEx1Return1);
		var outputFolderName = regEx2.exec(regEx1Return1);
	}
	outputFolderName = outputFolderName.toString().replace("%20", ' ');
	if (valueToReturn == "Name") {
		return outputFolderName
	} else if (valueToReturn == "Path") {
		return outputFolder.fsName
	}
}

function getPreset(valueToReturn) {
	var proj = app.project;
	var folder = new Folder(proj.path)
	var regEx = new RegExp("\/[^\/]*$");
	var regEx2 = new RegExp("[^\/]*$");
	var regEx1Return1 = regEx.exec(folder);
	regEx1Return1 = folder.toString().replace(regEx1Return1, '');
	var regEx1Return2 = regEx.exec(regEx1Return1);
	regEx1Return2 = regEx1Return1.toString().replace(regEx1Return2, '');
	var regEx1Return3 = regEx.exec(regEx1Return2);
	regEx1Return3 = regEx1Return2.toString().replace(regEx1Return3, '');
	var presetFile = new File(regEx1Return3 + "/8_Encoder Presets/2 Pass - 12-14.epr");
	var presetFileName = "2 Pass - 12-14.epr"
	if (!presetFile.exists) {
		var presetFile = new Folder(regEx1Return1)
		var presetFileName = "Please choose a preset"
	}
	presetFileName = presetFileName.toString().replace("%20", ' ');
	if (valueToReturn == "Name") {
		return presetFileName
	} else if (valueToReturn == "Path") {
		return presetFile.fsName
	}
}