
module DataFields {
	class helper {
		private _className: string = "DataRow";
		constructor(className: string) {

			this._className = className;

		}
		getClassName() {

			return this._className;
		}
		throwErrorString(method:string, saythis: string) {
			return this._className + "." + method+" :: " + saythis;
		}
	}

	class DatasetRegistry {
		dataset: DataSet
	}
	
	
	export class DatasetManager extends helper {
		protected registry: DatasetRegistry [] = [];

		datasetMatch: {
			matchingRegister: string,
			columnName: string
		}[];
		constructor() {
			super("DatasetManager");
			
		}
		getRegistry(name: string = null) {
			if (!name) throw this.throwErrorString('getRegistry', 'name: ' + name + ' is not valid');
			else {
				var registry = this.registry;
				for (var i = 0, j = registry.length; i < j; i++) {
					if (registry[i].dataset.name === name) return registry[i];
				}
				return null;
			}
		}
		addRegistry(name: string = null, addThisRegistry: DatasetRegistry) {
			if (!name) throw this.throwErrorString('addRegistry', 'name: ' + name + ' is not valid');
			var registry = this.getRegistry(name)
			if (registry) throw this.throwErrorString('addRegistry', 'name: ' + name + ' already exists');
			this.registry.push(addThisRegistry);
		}
		getDataset(name: string = null) {
			
			var registry = this.getRegistry(name);
			if (!registry) return null;
			return registry.dataset;

		}
		getData(name: string = null) {

			if (!name) throw this.throwErrorString('getData', 'name: ' + name + ' is not valid');
			var dataset = this.getDataset(name);

			if (!dataset) return null;
			
			return dataset.getData();
		}
		addData(name: string, primaryKey: string | number , data:any[]) {


			if (!name) throw this.throwErrorString('addData', 'name: ' + name + ' is not valid');
			var dataset = new DataSet();
			
			
			
			dataset.setDataSource(data);
			dataset.primaryKey = primaryKey;
			dataset.name = name;
			var addThisRegistry = new DatasetRegistry();
			addThisRegistry.dataset = dataset;
			this.addRegistry(name, addThisRegistry);
			return dataset.getData();
		}
		addMatchDefinition(name: string, mdef: MatchDefinition) {
			if (!name) throw this.throwErrorString('addMatchDefinition', 'name: ' + name + ' is not valid');
			var registry = this.getRegistry(name);
			if (!registry) throw this.throwErrorString('addMatchDefinition', 'name: ' + name + ' does not exist, first add data using addData()');
			var dataSet = registry.dataset;
			dataSet.addMatchDefinition(mdef);
			dataSet.refresh();
		}
		linkColumnToData(nameOfContainingColumn: string, columnName: string, nameToLinkTo: string,  objectName: string = null){
			
			//validate
			if (!nameToLinkTo) throw this.throwErrorString('linkColumnToData', 'nameOfContainingColumn: ' + nameToLinkTo + ' is not valid');
			var linkToDataset = this.getDataset(nameToLinkTo);
			if (!linkToDataset) throw this.throwErrorString('linkColumnToData', 'name: ' + nameToLinkTo + ' does not exist');
			if(!objectName) objectName = linkToDataset.name;
			var containingColumnDataset = this.getDataset(nameOfContainingColumn);
			if (!containingColumnDataset) throw this.throwErrorString('linkColumnToData', 'columnNameCriteria: ' + nameOfContainingColumn + ' does not exist');
			
			//set object when key specified with columnName changes
			var mdef = new MatchDefinition();
			mdef.columnNameCriteria = '^' + columnName + '$';
			mdef.doThis = (newValue, oldValue, columnNamex, source, fields, arMatch) => {
				var name = arMatch[0];
				

				//console.log("MATCH in linkColumnToData", columnName, linkToDataset, containingColumnDataset);
				//}
				var linkToFieldData = linkToDataset.getData();
				var linkToIDField = linkToDataset.primaryKey;
				for (var i = 0, j = linkToFieldData.length; i < j; i++) {
					var IDfieldValue = linkToFieldData[i][linkToIDField];
					if (IDfieldValue === undefined) continue;
					if (newValue === IDfieldValue) {
						fields[objectName] = SetDisable.on;
						fields[objectName] = linkToFieldData[i];
						fields[objectName] = SetDisable.off;
						break;
					}
				}


			};
			this.addMatchDefinition(nameOfContainingColumn, mdef);

			//set key specified with columnName  when object changes
			var mdefObject = new MatchDefinition();
			mdefObject.columnNameCriteria = '^' + objectName + '$';
			mdefObject.doThis = (newValue, oldValue, columnNamex, source, fields, arMatch) => {
				//console.log('changed source');
				newValue = newValue || {};
				var linkToIDField = linkToDataset.primaryKey;
				fields[columnName] = SetDisable.on;
				fields[columnName] = newValue[linkToIDField];
				fields[columnName] = SetDisable.off;

			};
			this.addMatchDefinition(nameOfContainingColumn, mdefObject);

			containingColumnDataset.propertyConfigure(objectName);
		}
		//manager.linkColumnJSON('account', 'options', 'ob_options');
		linkColumnJSON(nameOfContainingColumn: string, columnName: string,  objectName: string = null) {

			//validate
			var containingColumnDataset = this.getDataset(nameOfContainingColumn);
			if (!containingColumnDataset) throw this.throwErrorString('linkColumnToData', 'columnNameCriteria: ' + nameOfContainingColumn + ' does not exist');
			
			////set object when key specified with columnName changes
			//var mdef = new MatchDefinition();
			//mdef.columnNameCriteria = '^' + columnName + '$';
			//mdef.doThis = (newValue, oldValue, columnNamex, source, fields, arMatch) => {
			//	var name = arMatch[0];
			//	fields[objectName] = SetDisable.on;
			//	fields[columnName] = SetDisable.on;
			//	try {
			//		fields[objectName] = JSON.parse(newValue);

			//	}catch(e){
			//		fields[objectName] = null;
			//	}
			//	fields[objectName] = SetDisable.off;
			//	fields[columnName] = SetDisable.off;

				
			//	//var linkToSourceData = linkToDataset.getSource();
			//	//var linkToIDField = linkToDataset.primaryKey;
			//	//for (var i = 0, j = linkToFieldData.length; i < j; i++) {
			//	//	var IDfieldValue = linkToFieldData[i][linkToIDField];
			//	//	if (IDfieldValue === undefined) continue;
			//	//	if (newValue === IDfieldValue) {
			//	//		fields[objectName] = SetDisable.on;
			//	//		fields[objectName] = linkToFieldData[i];
			//	//		fields[objectName] = SetDisable.off;
			//	//	}
			//	//}


			//};
			//this.addMatchDefinition(nameOfContainingColumn, mdef);


			containingColumnDataset.propertyConfigure(objectName);
			containingColumnDataset.propertyConfigure(columnName);

			//set key specified with columnName  when object changes
			var mdefObject = new MatchDefinition();
			mdefObject.columnNameCriteria = '^' + objectName + '$';
			mdefObject.doThis = (newValue, oldValue, columnNamex, source, fields, arMatch) => {
				//console.log('changed source');
				fields[columnName] = SetDisable.on;
				fields[objectName] = SetDisable.on;
				try {
					fields[columnName] = JSON.stringify(newValue);

				} catch (e) {
					fields[columnName] = null;
				}
				fields[objectName] = SetDisable.off;
				fields[columnName] = SetDisable.off;

			};
			this.addMatchDefinition(nameOfContainingColumn, mdefObject);
			
		}

	}
	export class DataSet extends helper{
		private dataSource: any = null;
		private dataRows: DataRow[] = [];
		private fieldRows: any[];
		private matchDefinitions: MatchDefinition[] = [];

		primaryKey: string | number = null;
		name: string = "null";

		constructor(source: any = null) {
			super("DataSet");
			if (source) this.setDataSource(source);

		}
		refresh() {
			var dataRows = this.dataRows;
			for (var i = 0, j = dataRows.length; i < j; i++) {
				dataRows[i].refresh();
			}
		};
		setDataSource(dataSource: any[]) {
		
			this.dataSource = dataSource;
			this.configureFromDataSource();
			
			

		}
		getSource(source: any) {

			return this.dataSource;

		}
		getData() {
			return this.fieldRows;
		}
		configureFromDataSource() {
			var dataSource = this.dataSource;
			var dataRows = this.dataRows = [];
			var fieldRows = this.fieldRows = [];

			for (var row of dataSource) {
				var dataRow = new DataRow(row);
				dataRows.push(dataRow);
				fieldRows.push(dataRow.getFields());
				

			};
			for (var matchDefinition of this.matchDefinitions) {
				for (var dataRow of this.dataRows) {
					dataRow.addMatchDefinition(matchDefinition);

				}
			}

		}
		addMatchDefinition(matchDefinition: MatchDefinition) {
			this.matchDefinitions.push(matchDefinition);
			for (var dataRow of this.dataRows) {
				dataRow.addMatchDefinition(matchDefinition);
				
			}
		}
		propertyConfigure(key: string) {
			var dataRows = this.dataRows;
			for (var row of dataRows) {

				row.propertyConfigure(key);


			};
		}
	   
	}
	export class MatchDefinition {
		alias: string;
		columnNameCriteria: string;
		doThis: any = function() { };
	}
	

	export class DataRow extends helper{
		private matchDefinitions: MatchDefinition[] = [];
		private source: any = {};
		private fields: any = {};
		
		constructor(source: any = {}) {
			super("DataRow");
			if(source) this.setSource(source);

		}
		
	
		addMatchDefinition(mdef: MatchDefinition) {
			
			this.matchDefinitions.push(mdef);

		}
		refresh() {
			var fields = this.fields;
			for (var i in fields) {
				fields[i] = fields[i];
			}
		}
		
		setSource(source: any) {

			if (!source || typeof source !== 'object' || source instanceof Array) throw this.throwErrorString("setSource", "param must be an object that is not an array or null");
			this.source = source;
			this.configureFromSource();
		}
		getSource(source: any) {

			return this.source;

		}
		getFields() {

			return this.fields;

		}
		configureFromSource() {
			var source = this.source;
			var fields = this.fields = {};
			
			for (var key in source) {
				//var value = source[key];
			   
				this.propertyConfigure(key);

			};


		}
		propertyConfigure = function (key: string) {
			
			var fields = this.fields;
			var Descriptor = Object.getOwnPropertyDescriptor(fields, key);
			if (Descriptor && !Descriptor.configurable) return;

			var valueHistory = new ValueHistory();
			var source = this.source;
			var value = source[key];
			
			var that = this;
			var is_disabled = false;

			Object.defineProperty(fields, key, {
				get: function () {
					//console.log(key + "retrieved")
					return value;
				},
				set: function (newValue) {
					//console.log(key + " changed OLD:", value, "NEW:", newValue);
					if (newValue === SetDisable.on) { is_disabled = true; return }
					if (newValue === SetDisable.off) { is_disabled = false; return }
					
					value = newValue;
					valueHistory.add(newValue);
					if (Object.keys(source).indexOf(key) !== -1) source[key] = value;
					if (is_disabled) return;
					
					for (var mdef of that.matchDefinitions) {
						var criteria = new RegExp(mdef.columnNameCriteria);
						var test = criteria.test(key)
						if (test) {
							var arMatch = key.split(mdef.columnNameCriteria);
							mdef.doThis(newValue, value, key, source, fields, arMatch);
						}


					}

					
				},
				enumerable: true,
				configurable: false
			});

			fields[key] = value;
		}
		

	   
	}
	class SetDisable {
		static on: string = "}■■☻";
		static off: string = "}☻♥☻";
	}
	class valueObject {
		value: any;
	}
	class ValueHistory extends helper{
		undoHistory: valueObject[] = [];
		history: valueObject[] = [];
		currentValue: any;
		constructor(value: any = SetDisable.on) {
			super("ValueHistory");
			if (value !== SetDisable.on) {
				this.add(value);
			}
			return this;

		}
		add(value) {
			this._addCore(value);
			this.undoHistory = [];
		}
		private _addCore(value) {
			this.history.push({ value: value });
			this.currentValue = value;
		}
		undo() {
			this.undoHistory.push(this.history.pop());
		}
		redo() {
			this._addCore(this.undoHistory.pop());
		}
	}
}



