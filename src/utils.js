import { Component } from './core.js';

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
	
	create({ id, header, data, fields, footer, classes, thead_classes, tr_classes, td_classes, columns, tr, td }) {
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
		if (classes === null || classes === undefined) {
			classes = "";
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
		if (thead_classes === null || thead_classes === undefined) {
			thead_classes = '';
		}
		if (tr_classes === null || tr_classes === undefined) {
			tr_classes = '';
		}
		if (td_classes === null || td_classes === undefined) {
			td_classes = '';
		}
		if (tr === null || tr === undefined) {
			tr = r => '';
		}
		if (td === null || td === undefined) {
			td = (f, v) => '';
		}

		const format = fields;

		fields = [];
		classes = `table ${ classes }`;
		
		for (let key in format) {
			fields.push(key);
		}
		this.__columns = columns;

		return /*html*/`
			<div class="table-responsive">
				<table ${ id ? "id=" + id : "" } class="${ classes }">
					<thead class="thead ${ thead_classes }">
						<tr class="">
							${
								header.map(
									(th, key) => /*html*/`
										<th style="width: ${ columns[key].width }">
											${ th }
										</th>
									`
								).join('')
							}
						</tr>
					</thead>
					
					<tbody class="tbody">
						${
							data.map(
								(row, index) => /*html*/`
									<tr class="${ tr_classes }" ${ tr(row, index) }>
										${
											fields.map(
												(field, key) => /*html*/`
													<td style="width: ${ columns[key].width }" class="${ td_classes }" ${ td(field, key, row[field]) }>
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
						<tr class="">
							${
								footer.map(
									(td, key) => /*html*/`
										<td style="width: ${ columns[key].width }">
											${ td }
										</td>
									`
								).join('')
							}
						</tr>
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
			"fnDrawCallback": oSettings => {
				$(".page-item.active .page-link").css({
					borderColor: "rgba(0, 0, 0, .15)"
				})
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
				$(this.__tableSelector).show();
			}
		};

		for (const key in this.__options) {
			options[key] = this.__options[key];
		}

		$(() => {
			let table = null;
			$(this.__tableSelector).hide();
			
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

export class FormComponent extends Component
{
	constructor(props) {
		super(props);
	}

	addFieldControl(name, value) {
		Object.defineProperty(this.__controlNames, name, value);
	}

	setFieldsControls(controls) {
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
				return `${attr.name}="${
					Array.isArray(attr)
						?	attr.join(' ')
						:	attr.value
				}"`;
			}
		).join(' ');
	}

	input(options) {
		const attributes = [];

		const defaultOptions = {
			type: 'text',
			fieldControlName: '',
			events: ['onkeyup', 'onchange'],
			value: this.__controlNames[options.fieldControlName]
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
				value: `this.component.__onInput(event, '${options.fieldControlName}')`
			});
		}
		return /*html*/`<input ${this.__renderAttributes(attributes)}>`;
	}

	checkbox(options) {
		const attributes = [];

		const defaultOptions = {
			type: 'checkbox',
			fieldControlName: '',
			events: ['onchange'],
			checked: this.__controlNames[options.fieldControlName]
		};

		for (const key in defaultOptions) {
			if (options[key] === undefined) {
				options[key] = defaultOptions[key];
			}
		}
		if (options.checked) {
			options.checked = "checked";
		} else {
			delete options['checked'];
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
				value: `this.component.__onCheckbox(event, '${options.fieldControlName}')`
			});
		}
		return /*html*/`<input ${this.__renderAttributes(attributes)}>`;
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