import { Component, EventEmitter } from './core.js';

import "./vendor/jquery.min.js";
import "./vendor/bootstrap.min.js";
import "./vendor/datatables.min.js";

export class TableComponent extends Component
{
	constructor(tableSelector, props) {
		super(props);
		this.__scrollY = '50vh';

		if (tableSelector === undefined || tableSelector === null) {
			tableSelector = 'table';
		}
		this.__tableSelector = tableSelector;
		this.__paginationTextClass = "";
		this.__selectedBackgroundClass = "";
		this.__options = {};
		this.__columns = [];
	}

	limitChars(text, max) {
		if (text.length > max) {
			return text.substr(0, max - 3) + '...';
		}
		return text;
	}

	setOption(key, value) {
		this.__options[key] = value;
	}

	getOption(key) {
		return this.__options[key];
	}
	
	create({ id, header, data, fields, footer, table_class, thead_class, tr_class, td_class, columns, tr, td }) {
		if (header === null || header === undefined) {
			header = [];
		}
		if (data === null || data === undefined) {
			data = [];
		}
		if (fields === null || fields === undefined) {
			fields = {};
		}
		if (footer === null || footer === undefined) {
			footer = [];
		}
		if (table_class === null || table_class === undefined) {
			table_class = "";
		}
		if (columns === null || columns === undefined) {
			columns = header.map(i => {
				return {
					width: "auto",
					visible: true
				};
			});
		} else {
			columns = columns.map(c => {
				return {
					width: c.width ?? "auto",
					visible: c.visible ?? true
				};
			});
		}
		if (thead_class === null || thead_class === undefined) {
			thead_class = '';
		}
		if (tr_class === null || tr_class === undefined) {
			tr_class = '';
		}
		if (td_class === null || td_class === undefined) {
			td_class = '';
		}
		if (tr === null || tr === undefined) {
			tr = r => '';
		}
		if (td === null || td === undefined) {
			td = (f, v) => '';
		}
		const format = fields;

		fields = [];
		table_class = `table ${ table_class }`;
		
		for (let key in format) {
			fields.push(key);
		}
		this.__columns = columns;

		return /*html*/`
			<div class="table-responsive">
				<table ${ id ? "id=" + id : "" } class="${ table_class } w-100">
					<thead class="thead ${ thead_class }">
						${
							header.map(
								th => /*html*/`
									<th style="display: table-data !important">
										${ th }
									</th>
								`
							).join('')
						}
					</thead>
					
					<tbody class="tbody">
						${
							data.map(
								(row, index) => /*html*/`
									<tr class="${ tr_class }" ${ tr(row, index) }>
										${
											fields.map(
												(field, key) => /*html*/`
													<td style="width: ${ columns[key].width }" class="${ td_class }" ${ td(field, key, row[field]) }>
														${
															(field in format)
																? format[field](row[field])
																: row[field]
														}
													</td>
												`
											).join('')
										}
									</tr>
								`
							).join('')
						}
					</tbody>
					
					<tfoot class="tfoot">
						${
							footer.map(
								(td, key) => /*html*/`
									<td style="width: ${ columns[key].width }">
										${ td }
									</td>
								`
							).join('')
						}
					</tfoot>
				</table>
			</div>
		`;
	}

	onDrawTable(oSettings) {}

	setPaginationClasses(text, selectedBackground) {
		if (text) {
			this.__paginationTextClass = text;
		}
		if (selectedBackground) {
			this.__selectedBackgroundClass = selectedBackground;
		}
	}

	reload() {
		super.reload();

		const options = {
			"paging": true,
			"ordering": true,
			"info": true,
			"scrollY": this.__scrollY,
			"scrollCollapse": true,
			"scrollX": true,
			"fnDrawCallback": oSettings => {
				$(".page-item.active .page-link").css({
					borderColor: "rgba(0, 0, 0, .15)"
				});
				$(oSettings.nTableWrapper).find('.pagination li:not(.active):not(.disabled) *').addClass(this.__paginationTextClass);
				$(oSettings.nTableWrapper).find('.page-item.active .page-link, .pagination li.active *').addClass(this.__selectedBackgroundClass);
				this.onDrawTable(oSettings);
				if (oSettings._iDisplayLength >= oSettings.fnRecordsDisplay()) {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				} else {
					$(oSettings.nTableWrapper).find('.dataTables_paginate').show();
				}
			},
			"fnInitComplete": () => {
				$.fn.DataTable.ext.pager.simple_numbers = function(page, length) {
					if (length > 5) {
						if (page == 0) {
							return ["first", "previous", 0, 1, 2, "next", "last"];
						} else if (page == 1) {
							return ["first", "previous", 0, 1, 2, "next", "last"];
						} else if (page == length - 1) {
							return ["first", "previous", page - 2, page - 1, page, "next", "last"];
						} else {
							return ["first", "previous", page - 1, page, page + 1, "next", "last"];
						}
					} else {
						const ret = [];
						
						for (let i = 0; i < length; i++) {
							ret.push(i);
						}
						return ret;
					}
				};
			}
		};

		for (const key in this.__options) {
			options[key] = this.__options[key];
		}

		$(() => {
			let table = null;
			
			if ($.fn.dataTable.isDataTable(this.__tableSelector)) {
				table = $(this.__tableSelector).DataTable();
			} else {
				table = $(this.__tableSelector).DataTable(options);
			}
			for (let index in this.__columns) {
				table.column(index).visible(this.__columns[index].visible);
			}			
			$('a[data-toggle="tab"]').on('shown.bs.tab', function(e){
			   $($.fn.dataTable.tables(true)).DataTable().columns.adjust();
			});
		});
	}
}

export class FormFieldComponent extends Component
{
	constructor(props) {
		super(props);
	}

	addFieldControl(name, value) {
		Object.defineProperty(this.__controlNames, name, value);
	}

	setControllers(controls) {
		this.__controlNames = {};
		for (const key in controls) {
			this.addFieldControl(key, controls[key]);
		}
	}

	__onInput(event, target) {
		this.__controlNames[target] = event.target.value;
		event.target.value = this.__controlNames[target]
	}

	__onCheckbox(event, target) {
		this.__controlNames[target] = event.target.checked;
		event.target.checked = this.__controlNames[target]
	}

	__renderAttributes(attributes) {
		return attributes.map(
			attr => {
				if (attr.name == 'enabled') {
					if (attr.value) {
						return '';
					} else {
						return 'disabled';
					}
				}
				if (attr.name == 'checked') {
					if (attr.value) {
						return 'checked';
					} else {
						return '';
					}
				}
				return `${attr.name}="${
					Array.isArray(attr)
						?	attr.join(' ')
						:	attr.value
				}"`;
			}
		).join(' ');
	}
}

export class InputField extends FormFieldComponent
{
	constructor(controls) {
		super();
		this.__autocomplete = {};
		this.setControllers(controls);
	}
	
	addAutocomplete(name, get) {
		Object.defineProperty(this.__autocomplete, name, { get });
	}

	setAutocomplete(controls) {
		for (const key in controls) {
			this.addAutocomplete(key, controls[key]);
		}
	}

	inputAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			events: ['oninput'],
			value: this.__controlNames[controller]
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}
		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		for (const event of options.events) {
			attributes.push({
				name: event,
				value: `this.component.__onInput(event, '${controller}')`
			});
		}
		return this.__renderAttributes(attributes);
	}

	render() {
        const attr = this.getAllAttributes();
		const controller = this.getAttribute("controller");
		const options = {};
		const regex = /^input-/i;
		const autocomplete = this.getAttribute("autocomplete");
		const list = this.__autocomplete[autocomplete];

		for (let key in attr) {
			if (regex.test(key)) {
				options[key.replace(regex, "")] = attr[key];
			}
		}
		if (autocomplete) {
			options.list = "__auto-complete-" + autocomplete;
		}
        return /*html*/`
			<input ${ this.inputAttributes(options, controller) }>
			${ autocomplete
				? /*html*/`
					<datalist id="${ options.list }">
						${
							list.map(option => /*html*/`
								<option>${ option }</option>
							`).join('')
						}
					</datalist>
				` : ""
			}
		`;
	}
}

export class CheckBox extends FormFieldComponent
{
	constructor(controls) {
		super();
		this.setControllers(controls);
	}

	setAutocomplete(controls) {
		for (const key in controls) {
			this.addAutocomplete(key, controls[key]);
		}
	}

	inputAttributes(options, controller) {
		const attributes = [];

		const defaultOptions = {
			type: 'checkbox',
			events: ['onchange'],
			checked: this.__controlNames[controller]
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}
		for (const key in options) {
			attributes.push({
				name: key,
				value: options[key]
			});
		}
		for (const event of options.events) {
			attributes.push({
				name: event,
				value: `this.component.__onCheckbox(event, '${controller}')`
			});
		}
		return this.__renderAttributes(attributes);
	}

	render() {
        const attr = this.getAllAttributes();
		const controller = this.getAttribute("controller");
		const options = {};
		const regex = /^input-/i;
		
		for (let key in attr) {
			if (regex.test(key)) {
				options[key.replace(regex, "")] = attr[key];
			}
		}
		return /*html*/`
			<input ${ this.inputAttributes(options, controller) }>
		`;
	}
}

export class SelectField extends FormFieldComponent
{
	constructor() {
		super({
			default: []
		});
		this.onSelect = new EventEmitter("select", this);
	}

	getOptions(property) {
		if (property === undefined || property === null) {
			property = "default";
		}
		return this[property];
	}

	setOptions(property, text) {
		if (text === undefined || text === null) {
			text = property;
			property = "default";
		}
		this[property] = '' + text;
	}

	setControls(controls) {
		this.definePropertiesObject(controls);
	}

	onFirst(element) {
		const handler = this.getFunctionAttribute("select", element, "event");
		this.onSelect.then(handler);
	}

	__select(event) {
		const element = this.getElement();
		this.onSelect.emit(element, event.target.value);
	}

	render() {
		const control = this.getAttribute("options");
		const options = this[control];
		const allAttr = this.getAllAttributes();
		const attributes = [];
		const regex = /^select-/i;

		for (let key in allAttr) {
			if (regex.test(key)) {
				attributes.push({
					name: key.replace(regex, ""),
					value: allAttr[key]
				});
			}
		}

		return /*html*/`
			<select ${this.__renderAttributes(attributes)} onchange="this.component.__select(event)">
				${
					options.map(
						option => /*html*/`
							<option value="${ option.value }">
								${ option.text }
							</option>
						`
					).join('')
				}
			</select>
		`
	}
}

export class ModalComponent extends Component
{
	constructor(contentClass, ...args) {
		super({
			__active: false
		});
		this.onOpen = this.onClose = () => null;
		this.__content = new contentClass(this, ...args);
	}

	show(selector) {
		super.show(selector);
		this.appendChild(
			this.__content,
			`${selector}>.modal>.modal-dialog>.modal-content`
		)
	}

	getContent() {
		return this.__content;
	}

	setOnOpen(callback) {
		this.onOpen = callback;
	}

	setOnClose(callback) {
		this.onClose = callback;
	}

	register(object) {
		for (const key in object) {
			this[key] = object[key];
		}
	}

	open() {
		this.__active = true;
		this.onOpen();
	}

	close() {
		this.__active = false;
		this.onClose();
	}

	render() {
		return /*html*/`
			<div class="modal ${ this.dataset["modal-class"] || '' } ${ this.__active ? 'd-block show' : 'd-none' }" tabindex="-1" role="dialog" aria-hidden="true">
				<div class="modal-dialog ${ this.dataset["modal-dialog-class"] || '' }" role="document">
					<div class="modal-content" ${ this.dataset["modal-content-class"] || '' }></div>
				</div>
			</div>
			<div class="modal-backdrop fade show ${ this.__active ? 'd-block' : 'd-none' }"></div>
		`;
	}
}