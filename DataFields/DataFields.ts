
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


	export class DatasetRegister extends helper {
		dataSet: any[];
		name: string = "null";
		constructor(source: any) {
			super("DatasetRegister");

		}

	}
	
	export class DatasetIDManager extends helper {
		protected registry: any = {};
		constructor() {
			super("DatasetIDManager");
			
		}
		getRegistry(name: string = null) {
			if (!name) return this.registry;
			else return this.registry[name];
		}
		getFieldData(name: string = null) {
			if (!name) return this.registry;
			var reg = this.registry[name];
			if (!reg) return null;
			return reg.getFieldData();
		}
		addDataSetRegister(name:string, data:any[]) {
			var dataSet = new DataSet();
			
			var mdef = new MatchDefinition();
			mdef.criteria = 'ID';
			mdef.doThis = (newValue, oldValue, key, source, fields, arMatch) => {
				var name = arMatch[0];
				var dataSet = this.registry[name];
				if (dataSet) {

					console.log("MATCH", name, dataSet );
				}

			};
			dataSet.addMatchDefinition(mdef);
			dataSet.setDataSource(data);
			this.registry[name] = dataSet;
			return dataSet.getFieldData();
		}
	}
	export class DataSet extends helper{
		private dataSource: any = null;
		private dataRows: DataRow[] = [];
		private fieldRows: any[];
		private matchDefinitions: MatchDefinition[] = [];
		constructor(source: any = null) {
			super("DataSet");
			if (source) this.setDataSource(source);

		}

		setDataSource(dataSource: any[]) {
		
			this.dataSource = dataSource;
			this.configureFromDataSource();
			
			

		}
		getDataSource(source: any) {

			return this.dataSource;

		}
		getFieldData() {
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
		
	   
	}
	export class MatchDefinition {

		criteria: string;
		doThis: any = function() { };
	}
	

	export class DataRow extends helper{
		private matchDefinitions: MatchDefinition[] = [];
		private source: any = null;
		private fields: any = null;
		
		constructor(source: any = {}) {
			super("DataRow");
			if(source) this.setSource(source);

		}
		
	
		addMatchDefinition(mdef: MatchDefinition) {
			
			this.matchDefinitions.push(mdef);

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
			var that = this;
			var propertyConfigure = function (key: string, value: any) {
				var valueHistory = new ValueHistory();

				Object.defineProperty(fields, key, {
					get: function () {
						console.log(key + "retrieved")
						return value;
					},
					set: function (newValue) {
						console.log(key + " changed OLD:", value, "NEW:", newValue);

						for (var mdef of that.matchDefinitions) {
							var criteria = new RegExp(mdef.criteria);
							var test = criteria.test(key)
							if (test) {
								var arMatch = key.split(mdef.criteria);
								mdef.doThis(newValue, value, key, source, fields, arMatch);
							}


						}

						value = newValue;
						valueHistory.add(newValue);
					},
					enumerable: true,
					configurable: true
				});

				fields[key] = value;
			}
			for (var key in source) {
				var value = source[key];
			   
				propertyConfigure(key, value);

			};


		}
		private 
		

	   
	}
	class valueObject {
		value: any;
	}
	class ValueHistory extends helper{
		undoHistory: valueObject[] = [];
		history: valueObject[] = [];
		currentValue: any;
		constructor(value: any = '~Ümqæiamnothing') {
			super("ValueHistory");
			if (value !== '~Ümqæiamnothing') {
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



